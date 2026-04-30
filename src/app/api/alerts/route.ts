import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — retourne les alertes de l'utilisateur connecté
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;

  const alerts = await prisma.jobAlert.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}

// POST — crée une nouvelle alerte
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const body = await req.json();
  const { keywords, location, frequency } = body;

  if (!keywords?.trim()) {
    return NextResponse.json({ error: "Les mots-clés sont requis" }, { status: 400 });
  }

  const VALID_FREQUENCIES = ["instant", "daily", "weekly"];
  if (frequency && !VALID_FREQUENCIES.includes(frequency)) {
    return NextResponse.json({ error: "Fréquence invalide" }, { status: 400 });
  }

  const alert = await prisma.jobAlert.create({
    data: {
      userId,
      keywords: keywords.trim(),
      location: location?.trim() || null,
      frequency: frequency || "daily",
      active: true,
    },
  });

  return NextResponse.json({ alert }, { status: 201 });
}

// DELETE — supprime une alerte { id }
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const body = await req.json();
  const { id } = body;

  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const alert = await prisma.jobAlert.findUnique({ where: { id } });
  if (!alert) return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 });
  if (alert.userId !== userId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.jobAlert.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
