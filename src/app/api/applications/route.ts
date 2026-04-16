import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Erreur d'authentification" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "JOBSEEKER") return NextResponse.json({ error: "Réservé aux candidats" }, { status: 403 });

  const { jobId, coverLetter } = await req.json();
  if (!jobId) return NextResponse.json({ error: "Offre manquante" }, { status: 400 });

  const job = await prisma.job.findUnique({ where: { id: jobId, published: true } });
  if (!job) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId } },
  });
  if (existing) return NextResponse.json({ error: "Vous avez déjà postulé" }, { status: 409 });

  const app = await prisma.application.create({
    data: { jobId, userId, coverLetter: coverLetter || null },
  });

  return NextResponse.json({ success: true, id: app.id });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true, verified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
