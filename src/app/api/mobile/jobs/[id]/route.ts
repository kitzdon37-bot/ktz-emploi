import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mobileUser = getMobileUser(req);

    const job = await prisma.job.findUnique({
      where: { id, published: true },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            website: true,
            description: true,
            sector: true,
            size: true,
            location: true,
            phone: true,
            email: true,
            verified: true,
            allowContact: true,
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    // Incrémenter le compteur de vues
    await prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Vérifier si l'utilisateur a déjà postulé
    let hasApplied = false;
    let isSaved = false;
    if (mobileUser) {
      const [application, savedJob] = await Promise.all([
        prisma.application.findUnique({
          where: { jobId_userId: { jobId: id, userId: mobileUser.id } },
        }),
        prisma.savedJob.findUnique({
          where: { jobId_userId: { jobId: id, userId: mobileUser.id } },
        }),
      ]);
      hasApplied = !!application;
      isSaved = !!savedJob;
    }

    // Offres similaires (même catégorie, même entreprise exclue)
    const similar = await prisma.job.findMany({
      where: {
        published: true,
        category: job.category,
        id: { not: id },
      },
      include: {
        company: { select: { name: true, logo: true, verified: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    return NextResponse.json({ job, hasApplied, isSaved, similar });
  } catch (error) {
    console.error("[mobile/jobs/[id]]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
