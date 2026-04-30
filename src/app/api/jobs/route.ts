import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getPlanLimits } from "@/lib/plans";
import { logActivity } from "@/lib/activity";
import { sendJobNotifications } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  // Bloquer les comptes suspendus
  const suspended = (session.user as { suspended?: boolean }).suspended;
  if (suspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

  const company = await prisma.company.findUnique({
    where: { userId },
    include: { subscription: true },
  });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });
  if (company.suspended) return NextResponse.json({ error: "Entreprise suspendue" }, { status: 403 });

  // Vérifier la limite d'offres selon le plan
  const planKey = company.subscription?.plan ?? "FREE";
  const planStatus = company.subscription?.status ?? "ACTIVE";
  const limits = getPlanLimits(planStatus === "ACTIVE" ? planKey : "FREE");
  const activeJobs = await prisma.job.count({ where: { companyId: company.id, published: true } });
  if (activeJobs >= limits.maxJobs) {
    return NextResponse.json({
      error: `Limite atteinte : votre plan ${limits.name} autorise ${limits.maxJobs === 999 ? "offres illimitées" : `${limits.maxJobs} offre(s) active(s)`}. Passez à un plan supérieur sur /tableau-de-bord/abonnement`,
      upgradeRequired: true,
    }, { status: 403 });
  }

  try {
    const {
      title, type, category, location, remote, description,
      requirements, benefits, experienceLevel, salaryMin, salaryMax, deadline, coverImage,
      notifyOnApproval,
    } = await req.json();

    if (!title || !type || !category || !location || !description) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.job.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title,
        slug,
        type,
        category,
        location,
        remote: !!remote,
        description,
        requirements: requirements || null,
        benefits: benefits || null,
        experienceLevel: experienceLevel || null,
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        deadline: deadline ? new Date(deadline) : null,
        coverImage: coverImage || null,
        published: true,
        notifyOnApproval: !!notifyOnApproval,
      },
      include: { company: { select: { name: true } } },
    });

    const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    await logActivity({
      userId,
      userEmail: dbUser?.email,
      userName: dbUser?.name ?? undefined,
      type: "JOB_PUBLISHED",
      label: `Offre publiée : ${title}`,
      metadata: { jobId: job.id, slug: job.slug, companyName: company.name, category, location },
    });

    // Notifications immédiates si le recruteur l'a demandé
    if (notifyOnApproval) {
      sendJobNotifications(job).catch(err =>
        console.error("[Notifications] Erreur:", err)
      );
    }

    return NextResponse.json({ success: true, id: job.id, slug: job.slug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/jobs]", message);
    return NextResponse.json({ error: "Erreur serveur", detail: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId manquant" }, { status: 400 });

  // Vérifier que l'offre appartient bien à cette entreprise
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  if (job.companyId !== company.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.job.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}

