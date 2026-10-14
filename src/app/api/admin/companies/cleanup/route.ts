import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { suggestDuplicateGroups, looksLikeTest, mergeCompanies, deleteCompany, CleanupError } from "@/lib/company-cleanup";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; email?: string; id?: string } | undefined;
  return user?.role === "ADMIN" ? user : null;
}

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

  try {
    if (body.action === "merge") {
      const r = await mergeCompanies(body.keepId ?? "", body.removeIds ?? [], admin.email);
      return NextResponse.json({ success: true, movedJobs: r.movedJobs, merged: r.merged.length, orphanOwners: r.orphanOwners });
    }
    if (body.action === "delete") {
      await deleteCompany(body.companyId ?? "", !!body.confirmJobs, admin.email);
      return NextResponse.json({ success: true });
    }
  } catch (e) {
    if (e instanceof CleanupError) return NextResponse.json({ error: e.message, ...e.extra }, { status: e.status });
    throw e;
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
