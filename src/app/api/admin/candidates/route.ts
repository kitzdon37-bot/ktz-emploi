import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;

  // Accessible aux admins ET aux recruteurs (pour voir les candidats disponibles)
  if (!session?.user || (role !== "ADMIN" && role !== "EMPLOYER")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: "JOBSEEKER" },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  // Pour chaque candidat, calcule les offres qui correspondent
  const candidates = await Promise.all(
    users.map(async (user) => {
      const keywords =
        user.profile?.title?.split(" ").filter((w) => w.length > 3) ?? [];
      const location = user.profile?.location ?? "";

      const matchedJobs = await prisma.job.findMany({
        where: {
          published: true,
          OR: [
            ...(keywords.length > 0
              ? keywords.map((kw) => ({ title: { contains: kw, mode: 'insensitive' as const } }))
              : []),
            ...(location ? [{ location: { contains: location, mode: 'insensitive' as const } }] : []),
            ...(keywords.length === 0 && !location ? [{ published: true }] : []),
          ],
        },
        include: { company: { select: { name: true } } },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 5,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        profile: user.profile
          ? {
              title: user.profile.title,
              location: user.profile.location,
              skills: user.profile.skills,
            }
          : null,
        matchCount: matchedJobs.length,
        matchedJobs,
      };
    })
  );

  return NextResponse.json({ candidates });
}
