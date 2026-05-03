import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

async function getAuthUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as { id: string; role: string };
    return { id: u.id, role: u.role };
  }
  const mobile = getMobileUser(req);
  if (mobile) return { id: mobile.id, role: mobile.role };
  return null;
}

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (authUser.role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = authUser.id;

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const companyId = company.id;

  const jobs = await prisma.job.findMany({
    where: { companyId },
    select: { id: true, title: true, views: true },
  });

  const jobIds = jobs.map((j) => j.id);
  const totalJobs = jobs.length;

  const [
    totalApplications,
    pendingApplications,
    reviewingApplications,
    interviewApplications,
    acceptedApplications,
    rejectedApplications,
    last30DaysCount,
  ] = await Promise.all([
    prisma.application.count({ where: { jobId: { in: jobIds } } }),
    prisma.application.count({ where: { jobId: { in: jobIds }, status: "PENDING" } }),
    prisma.application.count({ where: { jobId: { in: jobIds }, status: "REVIEWING" } }),
    prisma.application.count({ where: { jobId: { in: jobIds }, status: "INTERVIEW" } }),
    prisma.application.count({ where: { jobId: { in: jobIds }, status: "ACCEPTED" } }),
    prisma.application.count({ where: { jobId: { in: jobIds }, status: "REJECTED" } }),
    prisma.application.count({
      where: {
        jobId: { in: jobIds },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const appCountsByJob = await prisma.application.groupBy({
    by: ["jobId"],
    where: { jobId: { in: jobIds } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const jobMap = new Map(jobs.map((j) => [j.id, { title: j.title, views: j.views }]));

  const applicationsPerJob = appCountsByJob.map((row) => ({
    jobId: row.jobId,
    title: jobMap.get(row.jobId)?.title ?? "",
    count: row._count.id,
    views: jobMap.get(row.jobId)?.views ?? 0,
  }));

  const conversionRate =
    totalApplications > 0
      ? Math.round((acceptedApplications / totalApplications) * 100 * 10) / 10
      : 0;

  return NextResponse.json({
    totalJobs,
    totalApplications,
    pendingApplications,
    reviewingApplications,
    interviewApplications,
    acceptedApplications,
    rejectedApplications,
    applicationsPerJob,
    last30Days: last30DaysCount,
    conversionRate,
  });
}
