import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const mobileUser = getMobileUser(req);
  if (!mobileUser) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    const existing = await prisma.savedJob.findUnique({
      where: { jobId_userId: { jobId, userId: mobileUser.id } },
    });

    if (existing) {
      return NextResponse.json({ saved: true, message: "Déjà sauvegardé" });
    }

    await prisma.savedJob.create({
      data: { jobId, userId: mobileUser.id },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[mobile/saved-jobs POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const mobileUser = getMobileUser(req);
  if (!mobileUser) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { jobId } = await params;

    await prisma.savedJob.deleteMany({
      where: { jobId, userId: mobileUser.id },
    });

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error("[mobile/saved-jobs DELETE]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
