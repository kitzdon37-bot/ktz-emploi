import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const [totalJobs, totalCompanies, totalUsers, totalApplications] = await Promise.all([
      prisma.job.count({ where: { published: true } }),
      prisma.company.count(),
      prisma.user.count({ where: { role: "JOBSEEKER" } }),
      prisma.application.count(),
    ]);

    return NextResponse.json({
      totalJobs,
      totalCompanies,
      totalUsers,
      totalApplications,
    });
  } catch (error) {
    console.error("[mobile/stats]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
