import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions, withCors } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

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
        where: { published: true, deadline: { not: null, lte: nowPlus7Days } },
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

    return withCors(NextResponse.json({
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      newUsersLast7Days,
      newJobsLast7Days,
      newApplicationsLast7Days,
      topSectors,
      expiringJobs: expiringJobs.map((j) => ({ ...j, deadline: j.deadline!.toISOString() })),
      pendingJobsCount,
      suspendedUsersCount,
      suspendedCompaniesCount,
      pendingReportsCount,
    }), req);
  } catch (error) {
    console.error("[mobile/admin/stats GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
