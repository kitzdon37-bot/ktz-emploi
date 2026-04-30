import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = subscribers.length;
  const active = subscribers.filter((s) => s.active).length;

  return NextResponse.json({ subscribers, total, active });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  await prisma.newsletterSubscriber.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
