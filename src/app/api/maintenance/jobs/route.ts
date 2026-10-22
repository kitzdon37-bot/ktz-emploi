// ⚠️ Route de maintenance TEMPORAIRE (suppression des offres expirées) — à supprimer après usage.
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(token: string | null) {
  const expected = process.env.MAINTENANCE_TOKEN;
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!authorized(searchParams.get("token"))) return new NextResponse("Not found", { status: 404 });

  // Offre expirée = date limite dépassée à l'instant présent
  const now = new Date();
  const where = { deadline: { lt: now } };

  const expired = await prisma.job.findMany({
    where,
    select: {
      id: true, title: true, slug: true, deadline: true, published: true,
      company: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { deadline: "asc" },
  });

  if (searchParams.get("confirm") === "delete") {
    const ids = expired.map((j: (typeof expired)[number]) => j.id);
    const result = await prisma.job.deleteMany({ where: { id: { in: ids } } });
    const remaining = await prisma.job.count({ where: { published: true } });
    return NextResponse.json({ deleted: result.count, remainingPublished: remaining });
  }

  const totals = {
    total: await prisma.job.count(),
    published: await prisma.job.count({ where: { published: true } }),
    expired: expired.length,
    expiredApplications: expired.reduce((n: number, j: (typeof expired)[number]) => n + j._count.applications, 0),
    noDeadline: await prisma.job.count({ where: { deadline: null } }),
    unpublishedNotExpired: await prisma.job.count({ where: { published: false, OR: [{ deadline: null }, { deadline: { gte: now } }] } }),
  };
  return NextResponse.json({
    now: now.toISOString(),
    totals,
    expired: expired.map((j: (typeof expired)[number]) => ({
      title: j.title, company: j.company.name, deadline: j.deadline, published: j.published, applications: j._count.applications,
    })),
  });
}
