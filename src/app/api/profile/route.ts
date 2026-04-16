import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });

  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;
  const body = await req.json();

  const allowed = ["title", "bio", "phone", "location", "skills", "experience", "education"] as const;
  const data: Record<string, string | null> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key] || null;
  }

  const profile = await prisma.jobSeekerProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json({ profile });
}
