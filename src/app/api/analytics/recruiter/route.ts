import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const companyId = company.id;

  // Fetch all jobs for this company
  const jobs = await prisma.job.findMany({
    where: { companyId },
    select: { id: true, title: true, views: true },
  });

  const jobIds = jobs.map((j) => j.id);

  const totalJobs = jobs.length;

  // Aggregate application counts per status
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

  // Applications per job (top 10 ordered by count desc)
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
