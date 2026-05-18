import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const cv = await prisma.cvBuilder.findUnique({ where: { userId } });
  if (!cv) return NextResponse.json({ data: null, template: "modern" });

  return NextResponse.json({ data: JSON.parse(cv.data), template: cv.template });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { data, template } = await req.json();

  const cv = await prisma.cvBuilder.upsert({
    where: { userId },
    update: { data: JSON.stringify(data), template: template ?? "modern" },
    create: { userId, data: JSON.stringify(data), template: template ?? "modern" },
  });

  return NextResponse.json({ success: true, id: cv.id });
}
