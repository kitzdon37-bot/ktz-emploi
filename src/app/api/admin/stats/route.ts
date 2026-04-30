import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const nowPlus7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalCompanies,
    totalJobs,
    totalApplications,
    newUsersLast7Days,
    newJobsLast7Days,
    newApplicationsLast7Days,
    topSectors,
    expiringJobs,
    pendingJobsCount,
    suspendedUsersCount,
    suspendedCompaniesCount,
    pendingReportsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.job.count({ where: { published: true } }),
    prisma.application.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo }, published: true } }),
    prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.job.groupBy({
      by: ["category"],
      where: { published: true },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
    prisma.job.findMany({
      where: {
        published: true,
        deadline: { not: null, lte: nowPlus7Days },
      },
      select: {
        id: true,
        title: true,
        deadline: true,
        company: { select: { name: true } },
      },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
    prisma.job.count({ where: { published: false } }),
    prisma.user.count({ where: { suspended: true } }),
    prisma.company.count({ where: { suspended: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalCompanies,
    totalJobs,
    totalApplications,
    newUsersLast7Days,
    newJobsLast7Days,
    newApplicationsLast7Days,
    topSectors,
    expiringJobs: expiringJobs.map((j) => ({
      ...j,
      deadline: j.deadline!.toISOString(),
    })),
    pendingJobsCount,
    suspendedUsersCount,
    suspendedCompaniesCount,
    pendingReportsCount,
  });
}
