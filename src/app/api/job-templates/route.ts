import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const templates = await prisma.jobTemplate.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const body = await req.json();
  const {
    name,
    title,
    description,
    requirements,
    benefits,
    type,
    category,
    location,
    remote,
    salaryMin,
    salaryMax,
  } = body;

  if (!name || !title || !description || !type || !category || !location) {
    return NextResponse.json(
      { error: "name, title, description, type, category et location sont requis" },
      { status: 400 }
    );
  }

  const template = await prisma.jobTemplate.create({
    data: {
      companyId: company.id,
      name,
      title,
      description,
      requirements: requirements ?? null,
      benefits: benefits ?? null,
      type,
      category,
      location,
      remote: remote ?? false,
      salaryMin: salaryMin ?? null,
      salaryMax: salaryMax ?? null,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
