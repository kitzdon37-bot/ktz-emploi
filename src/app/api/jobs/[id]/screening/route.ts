import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeQuestions } from "@/lib/screening";
import { getJobQuestions, saveJobQuestions } from "@/lib/screening-db";

// Vérifie que l'offre appartient à l'entreprise du recruteur connecté
async function getOwnedJob(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return { error: NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 }) };

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return { error: NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 }) };

  const job = await prisma.job.findUnique({ where: { id }, select: { id: true, companyId: true } });
  if (!job) return { error: NextResponse.json({ error: "Offre introuvable" }, { status: 404 }) };
  if (job.companyId !== company.id) return { error: NextResponse.json({ error: "Non autorisé" }, { status: 403 }) };

  return { job };
}

// GET /api/jobs/[id]/screening → questions de présélection de l'offre
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getOwnedJob(id);
  if (error) return error;

  return NextResponse.json({ questions: await getJobQuestions(id) });
}

// PUT /api/jobs/[id]/screening
// Body: { questions: ScreeningQuestion[] } — une liste vide retire toutes les questions
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await getOwnedJob(id);
  if (error) return error;

  const { questions } = await req.json();
  if (!Array.isArray(questions)) {
    return NextResponse.json({ error: "Liste de questions invalide" }, { status: 400 });
  }

  const clean = sanitizeQuestions(questions);
  try {
    await saveJobQuestions(id, clean);
  } catch (err) {
    console.error("[PUT /api/jobs/[id]/screening]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
  return NextResponse.json({ success: true, questions: clean });
}
