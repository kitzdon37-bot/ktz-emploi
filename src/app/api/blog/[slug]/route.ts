import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "ADMIN";

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  if (!post) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  // Non-admins can only see published posts
  if (!post.published && !isAdmin) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  const body = await req.json();
  const { title, content, excerpt, category, published } = body;

  const updatedPost = await prisma.blogPost.update({
    where: { slug },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(category !== undefined && { category }),
      ...(published !== undefined && { published }),
    },
    include: { author: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ post: updatedPost });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Réservé aux administrateurs" }, { status: 403 });

  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  await prisma.blogPost.delete({ where: { slug } });

  return NextResponse.json({ success: true });
}
