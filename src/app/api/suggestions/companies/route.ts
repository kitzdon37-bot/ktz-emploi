import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const companies = await prisma.company.findMany({
    where: q.length > 0 ? { name: { contains: q, mode: "insensitive" } } : {},
    select: { name: true },
    distinct: ["name"],
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json(companies.map((c) => c.name));
}
