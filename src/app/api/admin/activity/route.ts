import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");

  const logs = await prisma.activityLog.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(logs);
}
