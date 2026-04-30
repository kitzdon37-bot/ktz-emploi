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
  if (role !== "ADMIN") return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });

  const event = await prisma.recruitmentEvent.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

  await prisma.recruitmentEvent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
