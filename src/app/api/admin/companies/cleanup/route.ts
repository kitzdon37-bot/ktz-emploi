import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { suggestDuplicateGroups, looksLikeTest, addSlugRedirects } from "@/lib/company-cleanup";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; email?: string; id?: string } | undefined;
  return user?.role === "ADMIN" ? user : null;
}

// Champs recopiés depuis le doublon quand l'entreprise conservée ne les a pas
const FILLABLE = ["logo", "website", "description", "sector", "size", "location", "phone", "email", "banner", "videoUrl", "photos", "foundedYear"] as const;

// GET — toutes les entreprises avec ce qu'il faut pour décider (propriétaire, offres, abonnement)
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const now = new Date();
  const rows = await prisma.company.findMany({
    select: {
      id: true, name: true, slug: true, logo: true, sector: true, description: true,
      verified: true, suspended: true, createdAt: true,
      user: { select: { email: true, phone: true, name: true, role: true } },
      subscription: { select: { plan: true, status: true } },
      _count: { select: { jobs: true, reviews: true, jobTemplates: true } },
      jobs: {
        where: { published: true, OR: [{ deadline: null }, { deadline: { gte: now } }] },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const applicationCounts = await prisma.application.groupBy({
    by: ["jobId"],
    _count: { _all: true },
  });
  const jobsByCompany = await prisma.job.findMany({ select: { id: true, companyId: true } });
  const appsPerJob = new Map<string, number>(applicationCounts.map((a: { jobId: string; _count: { _all: number } }) => [a.jobId, a._count._all]));
  const appsPerCompany = new Map<string, number>();
  for (const j of jobsByCompany as Array<{ id: string; companyId: string }>) {
    appsPerCompany.set(j.companyId, (appsPerCompany.get(j.companyId) ?? 0) + (appsPerJob.get(j.id) ?? 0));
  }

  const companies = rows.map(({ jobs, ...c }: (typeof rows)[number]) => ({
    ...c,
    hasDescription: !!c.description,
    description: undefined,
    activeJobs: jobs.length,
    applications: appsPerCompany.get(c.id) ?? 0,
    isTest: looksLikeTest(c),
  }));

  const groups = suggestDuplicateGroups(companies).map((g) => g.map((c) => c.id));
  return NextResponse.json({ companies, groups });
}

// POST — { action: "merge", keepId, removeIds } ou { action: "delete", companyId, confirmJobs? }
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: string; keepId?: string; removeIds?: string[]; companyId?: string; confirmJobs?: boolean;
  };

  // ── Fusion ────────────────────────────────────────────────────────────────
  if (body.action === "merge") {
    const { keepId } = body;
    const removeIds = [...new Set(body.removeIds ?? [])].filter((id) => id !== keepId);
    if (!keepId || removeIds.length === 0) {
      return NextResponse.json({ error: "Choisissez l'entreprise à garder et au moins un doublon" }, { status: 400 });
    }

    const all = await prisma.company.findMany({
      where: { id: { in: [keepId, ...removeIds] } },
      include: { subscription: true, user: { select: { email: true, phone: true } } },
    });
    const keep = all.find((c: (typeof all)[number]) => c.id === keepId);
    const removed = all.filter((c: (typeof all)[number]) => c.id !== keepId);
    if (!keep || removed.length !== removeIds.length) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    // Abonnement : on le transfère s'il n'y en a qu'un ; deux abonnements = décision manuelle
    const subs = removed.filter((c: (typeof removed)[number]) => c.subscription);
    if (subs.length > 0 && (keep.subscription || subs.length > 1)) {
      return NextResponse.json({
        error: "Plusieurs de ces entreprises ont un abonnement. Gardez celle qui a l'abonnement, ou résiliez les autres d'abord.",
      }, { status: 409 });
    }

    const fill: Record<string, unknown> = {};
    for (const f of FILLABLE) {
      if (keep[f] == null || keep[f] === "") {
        const donor = removed.find((c: (typeof removed)[number]) => c[f] != null && c[f] !== "");
        if (donor) fill[f] = donor[f];
      }
    }
    if (removed.some((c: (typeof removed)[number]) => c.verified)) fill.verified = true;
    if (removed.some((c: (typeof removed)[number]) => c.superRecruiter)) fill.superRecruiter = true;

    const keptReviewers = new Set(
      (await prisma.companyReview.findMany({ where: { companyId: keepId }, select: { userId: true } }))
        .map((r: { userId: string }) => r.userId)
    );

    const result = await prisma.$transaction(async (tx) => {
      const jobs = await tx.job.updateMany({ where: { companyId: { in: removeIds } }, data: { companyId: keepId } });
      await tx.jobTemplate.updateMany({ where: { companyId: { in: removeIds } }, data: { companyId: keepId } });
      // Avis : un même utilisateur ne peut laisser qu'un avis par entreprise
      const reviews = await tx.companyReview.findMany({ where: { companyId: { in: removeIds } }, orderBy: { createdAt: "desc" } });
      for (const r of reviews) {
        if (keptReviewers.has(r.userId)) continue;
        keptReviewers.add(r.userId);
        await tx.companyReview.update({ where: { id: r.id }, data: { companyId: keepId } });
      }
      if (subs.length === 1) {
        await tx.subscription.update({ where: { companyId: subs[0].id }, data: { companyId: keepId } });
      }
      if (Object.keys(fill).length > 0) await tx.company.update({ where: { id: keepId }, data: fill });
      await tx.company.deleteMany({ where: { id: { in: removeIds } } });
      return { movedJobs: jobs.count };
    });

    await addSlugRedirects(removed.map((c: (typeof removed)[number]) => c.slug), keep.slug);

    const orphanOwners = removed
      .filter((c: (typeof removed)[number]) => c.userId !== keep.userId)
      .map((c: (typeof removed)[number]) => c.user.email ?? c.user.phone ?? c.userId);

    await logActivity({
      userEmail: admin.email,
      type: "COMPANY_UPDATED",
      label: `Fusion d'entreprises : ${removed.map((c: (typeof removed)[number]) => c.name).join(", ")} → ${keep.name}`,
      metadata: { keepId, removeIds, movedJobs: result.movedJobs, by: admin.email },
    });

    return NextResponse.json({ success: true, movedJobs: result.movedJobs, merged: removed.length, orphanOwners });
  }

  // ── Suppression ───────────────────────────────────────────────────────────
  if (body.action === "delete") {
    const company = await prisma.company.findUnique({
      where: { id: body.companyId ?? "" },
      include: { subscription: true, _count: { select: { jobs: true } } },
    });
    if (!company) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    if (company.subscription && company.subscription.status === "ACTIVE" && company.subscription.plan !== "FREE") {
      return NextResponse.json({ error: "Cette entreprise a un abonnement payant actif : résiliez-le d'abord." }, { status: 409 });
    }
    if (company._count.jobs > 0 && !body.confirmJobs) {
      return NextResponse.json({
        error: `Cette entreprise a ${company._count.jobs} offre(s) : elles seront supprimées avec leurs candidatures.`,
        needsConfirm: true,
      }, { status: 409 });
    }
    await prisma.company.delete({ where: { id: company.id } });
    await logActivity({
      userEmail: admin.email,
      type: "COMPANY_UPDATED",
      label: `Entreprise supprimée : ${company.name}`,
      metadata: { companyId: company.id, jobs: company._count.jobs, by: admin.email },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
