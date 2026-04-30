import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ArrowRight, Tag } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const categories = Array.from(new Set(posts.map((p) => p.category))).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <span className="text-orange-500 font-semibold text-sm">Blog KTZ Emploi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Conseils &amp; Actualités
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Suivez nos dernières publications sur le marché de l&apos;emploi en République Centrafricaine
          </p>
        </div>

        {/* Category filter tabs */}
        {categories.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {["Tout", ...categories].map((cat) => (
                <span
                  key={cat}
                  className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 cursor-pointer transition-colors"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">Aucun article publié pour le moment</p>
            <p className="text-sm mt-1">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all flex flex-col"
              >
                {/* Category badge */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 flex-1">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      Lire l&apos;article <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
