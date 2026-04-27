import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        include: {
          _count: { select: { jobs: { where: { published: true } } } },
        },
        orderBy: { verified: "desc" },
        take: limit,
        skip,
      }),
      prisma.company.count(),
    ]);

    return NextResponse.json({ companies, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("[mobile/companies]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
