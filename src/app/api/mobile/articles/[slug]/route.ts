import { NextRequest, NextResponse } from "next/server";
import { handleOptions } from "@/lib/cors";
import { getArticleBySlug } from "@/lib/articles";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }
  return NextResponse.json({ article });
}
