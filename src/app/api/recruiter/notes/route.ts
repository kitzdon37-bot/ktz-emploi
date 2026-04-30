import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const { searchParams } = new URL(req.url);
  const applicationId = searchParams.get("applicationId");
  if (!applicationId) return NextResponse.json({ error: "applicationId requis" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { select: { companyId: true } } },
  });
  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const notes = await prisma.recruiterNote.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
    include: { recruiter: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const body = await req.json();
  const { applicationId, content } = body;
  if (!applicationId || !content) return NextResponse.json({ error: "applicationId et content requis" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: { select: { companyId: true } } },
  });
  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const note = await prisma.recruiterNote.create({
    data: {
      applicationId,
      recruiterId: userId,
      content,
    },
    include: { recruiter: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ note }, { status: 201 });
}
