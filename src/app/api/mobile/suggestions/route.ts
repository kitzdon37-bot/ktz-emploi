import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (q.length === 0) {
      // Sans texte : titres les plus populaires
      const popular = await prisma.job.findMany({
        where: { published: true },
        select: { title: true, category: true },
        distinct: ["title"],
        take: 6,
        orderBy: { views: "desc" },
      });
      return withCors(
        NextResponse.json(
          popular.map((j) => ({ label: j.title, type: "title", category: j.category }))
        ),
        req
      );
    }

    const [jobs, categories] = await Promise.all([
      prisma.job.findMany({
        where: { published: true, title: { contains: q, mode: "insensitive" } },
        select: { title: true, category: true },
        distinct: ["title"],
        take: 8,
        orderBy: { views: "desc" },
      }),
      prisma.job.findMany({
        where: { published: true, category: { contains: q, mode: "insensitive" } },
        select: { category: true },
        distinct: ["category"],
        take: 3,
      }),
    ]);

    const suggestions = [
      ...jobs.map((j) => ({ label: j.title, type: "title" as const, category: j.category })),
      ...categories.map((c) => ({ label: c.category, type: "category" as const, category: c.category })),
    ];

    const seen = new Set<string>();
    const unique = suggestions.filter((s) => {
      if (seen.has(s.label)) return false;
      seen.add(s.label);
      return true;
    });

    return withCors(NextResponse.json(unique.slice(0, 8)), req);
  } catch (error) {
    console.error("[mobile/suggestions GET]", error);
    return withCors(NextResponse.json([], { status: 500 }), req);
  }
}
