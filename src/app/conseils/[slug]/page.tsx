import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, BookOpen } from "lucide-react";
import { articles, getArticleBySlug } from "@/lib/articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = articles.filter((a) => a.id !== article.id && a.category === article.category).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${article.coverColor} py-16`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/conseils"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux conseils
          </Link>

          <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
            {article.category}
          </span>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.author} — {article.authorRole}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readTime} de lecture
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="prose prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-strong:text-gray-900
            prose-ul:my-4 prose-ul:pl-6 prose-li:text-gray-700 prose-li:my-1
            prose-ol:my-4 prose-ol:pl-6
            prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:bg-orange-50 prose-blockquote:rounded-r-lg prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:not-italic
            prose-code:bg-gray-100 prose-code:text-orange-600 prose-code:px-1 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm
            prose-hr:border-gray-200 prose-hr:my-6
            prose-table:w-full prose-table:text-sm
            prose-th:bg-orange-50 prose-th:text-orange-700 prose-th:font-semibold prose-th:px-4 prose-th:py-2 prose-th:text-left
            prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-700
            prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Author card */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${article.coverColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
            {article.author.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{article.author}</p>
            <p className="text-sm text-gray-500">{article.authorRole} — KTZ Emploi</p>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/conseils/${rel.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:border-orange-200 hover:shadow-sm transition-all"
                >
                  <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    {rel.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2 mb-1 text-sm leading-snug line-clamp-2">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {rel.readTime} de lecture
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to all articles */}
        <div className="mt-8 text-center">
          <Link
            href="/conseils"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voir tous les conseils carrière
          </Link>
        </div>
      </div>
    </div>
  );
}
