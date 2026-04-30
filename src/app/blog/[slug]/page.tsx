import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Tag, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    select: { title: true, excerpt: true },
  });
  if (!post) return {};

  const description = post.excerpt
    ? post.excerpt.slice(0, 160).replace(/\s+/g, " ").trim()
    : undefined;

  return {
    title: post.title,
    ...(description && { description }),
    openGraph: {
      title: post.title,
      ...(description && { description }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux articles
        </Link>

        <article className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Article header */}
          <div className="p-6 md:p-10 border-b border-gray-100">
            {/* Category badge */}
            <div className="flex items-center gap-1.5 mb-4">
              <Tag className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-0.5 rounded-full">
                {post.category}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </span>
              {post.author?.name && (
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                  {post.author.name}
                </span>
              )}
            </div>

            {post.excerpt && (
              <p className="mt-4 text-gray-600 text-base leading-relaxed italic border-l-4 border-orange-300 pl-4 bg-orange-50/50 py-2 rounded-r-lg">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Article content */}
          <div className="p-6 md:p-10">
            {post.content.startsWith("<") ? (
              // Contenu HTML produit par l'éditeur riche
              <div
                className="prose prose-orange prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-orange-300 prose-blockquote:bg-orange-50/50 prose-blockquote:py-1 prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1 prose-code:rounded max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              // Contenu texte brut (ancien format)
              <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                {post.content}
              </div>
            )}
          </div>
        </article>

        {/* Footer link */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir tous les articles
          </Link>
        </div>
      </div>
    </div>
  );
}
