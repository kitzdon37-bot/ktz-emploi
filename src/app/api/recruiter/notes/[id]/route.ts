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

  const note = await prisma.recruiterNote.findUnique({ where: { id } });
  if (!note) return NextResponse.json({ error: "Note introuvable" }, { status: 404 });
  if (note.recruiterId !== userId)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.recruiterNote.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
