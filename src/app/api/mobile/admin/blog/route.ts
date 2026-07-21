import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste des articles de blog
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      prisma.blogPost.count(),
    ]);

    return withCors(NextResponse.json({ posts, total, page, limit }), req);
  } catch (error) {
    console.error("[mobile/admin/blog GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// POST: créer un article
export async function POST(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { title, excerpt, content, category, published = true } = await req.json();

    if (!title?.trim() || !content?.trim()) {
      return withCors(NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 }), req);
    }

    const slug =
      title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-") +
      "-" +
      Date.now();

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        category: category?.trim() || "Conseils",
        published,
        authorId: tokenUser.id,
      },
      include: { author: { select: { name: true } } },
    });

    return withCors(NextResponse.json({ post }), req);
  } catch (error) {
    console.error("[mobile/admin/blog POST]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// PUT: modifier un article
export async function PUT(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id, title, excerpt, content, category, published } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(excerpt !== undefined && { excerpt: excerpt?.trim() || null }),
        ...(content && { content: content.trim() }),
        ...(category && { category: category.trim() }),
        ...(published !== undefined && { published }),
      },
      include: { author: { select: { name: true } } },
    });

    return withCors(NextResponse.json({ post }), req);
  } catch (error) {
    console.error("[mobile/admin/blog PUT]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// DELETE: supprimer un article
export async function DELETE(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    await prisma.blogPost.delete({ where: { id } });

    return withCors(NextResponse.json({ success: true }), req);
  } catch (error) {
    console.error("[mobile/admin/blog DELETE]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
