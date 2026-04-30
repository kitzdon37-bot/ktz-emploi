import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER" && role !== "ADMIN")
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.trim().toLowerCase() || "";

  const candidates = await prisma.jobSeekerProfile.findMany({
    where: {
      cvPublic: true,
      cv: { not: null },
    },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const filtered = search
    ? candidates.filter((c) => {
        const text = [c.title, c.location, c.skills, c.user.name].join(" ").toLowerCase();
        return text.includes(search);
      })
    : candidates;

  const result = filtered.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.user.name,
    email: c.user.email,
    phone: c.phone,
    title: c.title,
    location: c.location,
    skills: c.skills,
    bio: c.bio,
    cv: c.cv,
    updatedAt: c.updatedAt,
  }));

  return NextResponse.json({ candidates: result, total: result.length });
}
