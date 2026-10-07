import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/jobs/[id]/ai-ranking
// Body: { enabled: boolean }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") {
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });
  }

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  }
  if (job.companyId !== company.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { enabled } = await req.json();
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Valeur 'enabled' manquante ou invalide" }, { status: 400 });
  }

  await prisma.job.update({
    where: { id: params.id },
    data: { aiRankingEnabled: enabled },
  });

  return NextResponse.json({ success: true, aiRankingEnabled: enabled });
}
