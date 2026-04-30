import { NextResponse } from "next/server";
import { handleOptions } from "@/lib/cors";
import { articles } from "@/lib/articles";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const list = articles.map(({ id, slug, title, excerpt, category, readTime, date, author, authorRole, coverColor }) => ({
    id, slug, title, excerpt, category, readTime, date, author, authorRole, coverColor,
  }));
  return NextResponse.json({ articles: list });
}
