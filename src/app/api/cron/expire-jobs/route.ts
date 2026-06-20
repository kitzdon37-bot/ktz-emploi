import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/expire-jobs
 *
 * Dépublie automatiquement les offres dont la date limite est dépassée.
 * À appeler via Vercel Cron (ou cron-job.org) une fois par jour.
 * Protégé par CRON_SECRET dans les variables d'environnement.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();

  const result = await prisma.job.updateMany({
    where: {
      published: true,
      deadline: { lt: now },
    },
    data: { published: false },
  });

  return NextResponse.json({
    ok: true,
    expired: result.count,
    at: now.toISOString(),
  });
}
