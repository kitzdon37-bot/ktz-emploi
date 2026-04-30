import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const reporterId = (session?.user as { id?: string })?.id ?? null;

  const { type, targetId, reason, details } = await req.json();

  if (!type || !targetId || !reason) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  if (!["JOB", "COMPANY"].includes(type)) {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  await prisma.report.create({
    data: {
      type,
      targetId,
      reason,
      details: details ?? null,
      reporterId,
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true });
}
