import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

const PAGE_SIZE = 12;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const category = searchParams.get("category") || "";
    const type = searchParams.get("type") || "";
    const experience = searchParams.get("experience") || "";
    const remote = searchParams.get("remote") === "true";
    const featured = searchParams.get("featured") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || String(PAGE_SIZE))));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { published: true };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { company: { name: { contains: q } } },
      ];
    }
    if (location) where.location = { contains: location };
    if (category) where.category = category;
    if (type) where.type = type;
    if (experience) where.experienceLevel = experience;
    if (remote) where.remote = true;
    if (featured) where.featured = true;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: { select: { id: true, name: true, logo: true, verified: true, slug: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("[mobile/jobs]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
