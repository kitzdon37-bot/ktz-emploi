import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return (session.user as { id?: string }).id ?? null;
  }
  const mobileUser = getMobileUser(req);
  return mobileUser?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Bloquer les comptes suspendus
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { suspended: true } });
  if (dbUser?.suspended) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

  const body = await req.json();

  const allowed = ["title", "bio", "phone", "location", "skills", "experience", "education", "cv"] as const;
  const data: Record<string, string | boolean | null> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key] || null;
  }
  if ("cvPublic" in body) data.cvPublic = !!body.cvPublic;

  const profile = await prisma.jobSeekerProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });

  return NextResponse.json({ profile });
}
