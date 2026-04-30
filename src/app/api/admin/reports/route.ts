import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const status = req.nextUrl.searchParams.get("status") || "PENDING";

  const rawReports = await prisma.report.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with target name
  const reports = await Promise.all(
    rawReports.map(async (r) => {
      let targetName = r.targetId;
      try {
        if (r.type === "JOB") {
          const job = await prisma.job.findUnique({ where: { id: r.targetId }, select: { title: true } });
          if (job) targetName = job.title;
        } else if (r.type === "COMPANY") {
          const company = await prisma.company.findUnique({ where: { id: r.targetId }, select: { name: true } });
          if (company) targetName = company.name;
        }
      } catch {
        // target may have been deleted
      }
      return {
        ...r,
        createdAt: r.createdAt.toISOString(),
        targetName,
      };
    })
  );

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { reportId, status } = await req.json();
  if (!reportId || !["REVIEWED", "DISMISSED"].includes(status)) {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  await prisma.report.update({ where: { id: reportId }, data: { status } });
  return NextResponse.json({ success: true });
}
