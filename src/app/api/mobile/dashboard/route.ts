import { NextRequest, NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) return (session.user as { id?: string }).id ?? null;
  const mobileUser = getMobileUser(req);
  return mobileUser?.id ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const [applications, savedJobs, profile, recommendedJobs] = await Promise.all([
      prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            include: { company: { select: { name: true, logo: true, verified: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.savedJob.findMany({
        where: { userId },
        include: {
          job: {
            include: { company: { select: { name: true, logo: true, verified: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.jobSeekerProfile.findUnique({ where: { userId } }),
      prisma.job.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          company: { select: { name: true, logo: true, verified: true } },
          _count: { select: { applications: true } },
        },
      }),
    ]);

    // Stats candidatures
    const allApplications = await prisma.application.findMany({
      where: { userId },
      select: { status: true },
    });
    const statusCounts = allApplications.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      stats: {
        total: allApplications.length,
        interview: statusCounts["INTERVIEW"] || 0,
        accepted: statusCounts["ACCEPTED"] || 0,
        pending: statusCounts["PENDING"] || 0,
      },
      recentApplications: applications,
      savedJobs,
      recommendedJobs,
      profile,
    });
  } catch (error) {
    console.error("[mobile/dashboard]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
