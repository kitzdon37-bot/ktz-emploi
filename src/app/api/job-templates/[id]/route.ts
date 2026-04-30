import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const template = await prisma.jobTemplate.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Modèle introuvable" }, { status: 404 });
  if (template.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.jobTemplate.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
