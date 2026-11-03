import Link from "next/link";
import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { articles, ARTICLE_COVERS, GUIDE_COVER } from "@/lib/articles";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/conseils",
  title: "Conseils carrière : CV, lettre de motivation, entretien",
  description: "Conseils pratiques pour trouver un emploi en Centrafrique : rédiger son CV et sa lettre de motivation, réussir son entretien, négocier son salaire.",
});

const BADGE_MAP: Record<string, string> = {
  "CV & Candidature":   "bg-blue-100 text-blue-700",
  "Entretien":          "bg-orange-100 text-orange-600",
  "Marché de l'emploi": "bg-purple-100 text-purple-700",
  "Carrière":           "bg-yellow-100 text-yellow-700",
};

const CATEGORIES = ["Tout", "CV & Candidature", "Entretien", "Carrière", "Marché de l'emploi"];

export default function ConseilsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-6 w-6 text-orange-500" />
          <span className="text-orange-500 font-semibold">Conseils carrière</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Boostez votre carrière en RCA
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Des conseils pratiques pour réussir votre recherche d&apos;emploi et progresser dans votre carrière en République Centrafricaine
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured article : grande photo + texte */}
      <section className="mb-10">
        <Link
          href={`/conseils/${articles[0].slug}`}
          className="group relative block overflow-hidden rounded-3xl bg-gray-900 text-white"
        >
          <div className="grid md:grid-cols-2">
            <div className="relative order-2 md:order-1 p-7 sm:p-10 flex flex-col justify-center">
              <span className="eyebrow">Article phare</span>
              <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold leading-tight mb-4">Guide complet pour trouver un emploi à Bangui</h2>
              <p className="text-gray-300 mb-7 max-w-xl">
                De la préparation de votre CV à la négociation de votre salaire, tout ce que vous devez savoir pour réussir votre recherche d&apos;emploi dans la capitale centrafricaine.
              </p>
              <span className="btn-shine self-start inline-flex items-center gap-2 bg-orange-500 group-hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg shadow-orange-500/30 transition-colors">
                Lire l&apos;article <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative order-1 md:order-2 min-h-[220px] md:min-h-[340px]">
              <div data-photo className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={GUIDE_COVER.src} alt={GUIDE_COVER.alt} className="w-full h-full object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-gray-900 via-gray-900/20 to-transparent" />
            </div>
          </div>
        </Link>
      </section>

      {/* Articles grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const badge = BADGE_MAP[article.category] ?? "bg-gray-100 text-gray-600";
            const cover = ARTICLE_COVERS[article.slug];
            return (
              <Link
                key={article.id}
                href={`/conseils/${article.slug}`}
                className="soft-card group flex flex-col rounded-3xl p-3 pb-6"
              >
                {/* Photo */}
                <div className="relative">
                  <div data-photo className="aspect-[16/10] rounded-3xl bg-gray-100">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.src} alt={cover.alt} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm ${badge}`}>
                    {article.category}
                  </span>
                </div>
                {/* Texte */}
                <div className="px-4 pt-5 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-orange-600 transition-colors">{article.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-5 flex-1">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3.5 w-3.5" /> {article.readTime} de lecture
                    </span>
                    <span className="text-orange-500 text-sm font-semibold flex items-center gap-1">
                      Lire <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Newsletter CTA */}
      <div className="bg-gray-900 text-white rounded-2xl p-8 mt-12 text-center">
        <h3 className="text-2xl font-bold mb-2">Recevez nos conseils chaque semaine</h3>
        <p className="text-gray-400 mb-6">Rejoignez 5000+ professionnels qui reçoivent nos conseils carrière</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="votre@email.com"
            className="flex-1 px-4 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none"
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
            S&apos;abonner
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">Aucun spam. Désabonnement à tout moment.</p>
      </div>
    </div>
  );
}
