import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  // Sans texte : retourner les offres les plus populaires
  if (q.length === 0) {
    const popular = await prisma.job.findMany({
      where: { published: true },
      select: { title: true, category: true },
      distinct: ["title"],
      take: 6,
      orderBy: { views: "desc" },
    });
    return NextResponse.json(
      popular.map((j) => ({ label: j.title, type: "title", category: j.category }))
    );
  }

  // Chercher les titres d'offres qui matchent
  const jobs = await prisma.job.findMany({
    where: {
      published: true,
      title: { contains: q, mode: "insensitive" },
    },
    select: { title: true, category: true },
    distinct: ["title"],
    take: 8,
    orderBy: { views: "desc" },
  });

  // Chercher les catégories qui matchent
  const categories = await prisma.job.findMany({
    where: {
      published: true,
      category: { contains: q, mode: "insensitive" },
    },
    select: { category: true },
    distinct: ["category"],
    take: 3,
  });

  const suggestions = [
    ...jobs.map((j) => ({ label: j.title, type: "title" as const, category: j.category })),
    ...categories.map((c) => ({ label: c.category, type: "category" as const, category: c.category })),
  ];

  // Dédoublonner
  const seen = new Set<string>();
  const unique = suggestions.filter((s) => {
    if (seen.has(s.label)) return false;
    seen.add(s.label);
    return true;
  });

  return NextResponse.json(unique.slice(0, 8));
}
