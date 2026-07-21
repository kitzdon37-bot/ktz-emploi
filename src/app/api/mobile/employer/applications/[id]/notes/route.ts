import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste des notes d'un recruteur sur une candidature
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return withCors(NextResponse.json({ error: "Accès refusé" }, { status: 403 }), req);
    }

    const { id } = await params;

    // Vérifier que la candidature appartient bien à une offre de ce recruteur
    const application = await prisma.application.findFirst({
      where: { id, job: { company: { userId: tokenUser.id } } },
      select: { id: true },
    });
    if (!application) {
      return withCors(NextResponse.json({ error: "Candidature introuvable" }, { status: 404 }), req);
    }

    const notes = await prisma.recruiterNote.findMany({
      where: { applicationId: id, recruiterId: tokenUser.id },
      orderBy: { createdAt: "asc" },
    });

    return withCors(NextResponse.json({ notes }), req);
  } catch (error) {
    console.error("[mobile/employer/applications/[id]/notes GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// POST: ajouter une note
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return withCors(NextResponse.json({ error: "Accès refusé" }, { status: 403 }), req);
    }

    const { id } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return withCors(NextResponse.json({ error: "Contenu de la note requis" }, { status: 400 }), req);
    }

    // Vérifier que la candidature appartient à ce recruteur
    const application = await prisma.application.findFirst({
      where: { id, job: { company: { userId: tokenUser.id } } },
      select: { id: true },
    });
    if (!application) {
      return withCors(NextResponse.json({ error: "Candidature introuvable" }, { status: 404 }), req);
    }

    const note = await prisma.recruiterNote.create({
      data: {
        applicationId: id,
        recruiterId: tokenUser.id,
        content: content.trim(),
      },
    });

    return withCors(NextResponse.json({ note }), req);
  } catch (error) {
    console.error("[mobile/employer/applications/[id]/notes POST]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// DELETE: supprimer une note
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return withCors(NextResponse.json({ error: "Accès refusé" }, { status: 403 }), req);
    }

    const { noteId } = await req.json();
    if (!noteId) {
      return withCors(NextResponse.json({ error: "ID de note manquant" }, { status: 400 }), req);
    }

    await prisma.recruiterNote.deleteMany({
      where: { id: noteId, recruiterId: tokenUser.id },
    });

    return withCors(NextResponse.json({ success: true }), req);
  } catch (error) {
    console.error("[mobile/employer/applications/[id]/notes DELETE]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
