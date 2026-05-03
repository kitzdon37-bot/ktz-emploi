import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const all = searchParams.get("all");

  // all=1 : admin uniquement — retourne aussi les brouillons
  let showAll = false;
  if (all === "1") {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    showAll = role === "ADMIN";
  }

  const where: Record<string, unknown> = showAll ? {} : { published: true };

  if (category) {
    where.category = category;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' as const } },
      { excerpt: { contains: q, mode: 'insensitive' as const } },
      { content: { contains: q, mode: 'insensitive' as const } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, image: true } } },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json({ posts, total });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;

  const body = await req.json();
  const { title, content, excerpt, category, published } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "title et content requis" }, { status: 400 });
  }

  // Ensure unique slug by appending a timestamp if needed
  const baseSlug = generateSlug(title);
  const existing = await prisma.blogPost.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt ?? null,
      category: category ?? "Conseils",
      published: published ?? true,
      authorId: userId,
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ post }, { status: 201 });
}
