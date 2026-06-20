import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
import { articles } from "@/lib/articles";

const CARD_BG_MAP: Record<string, string> = {
  "CV & Candidature": "bg-blue-50",
  "Entretien":        "bg-orange-50",
  "Marché de l'emploi": "bg-purple-50",
  "Carrière":         "bg-yellow-50",
};

const ILLUSTRATION_MAP: Record<string, string> = {
  "CV & Candidature":   "/illustrations/cv-candidature.svg",
  "Entretien":          "/illustrations/entretien.svg",
  "Marché de l'emploi": "/illustrations/marche-emploi.svg",
  "Carrière":           "/illustrations/carriere.svg",
};

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

      {/* Featured article */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="flex-1">
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4 inline-block">
              Article phare
            </span>
            <h2 className="text-2xl font-bold mb-3">Guide complet pour trouver un emploi à Bangui</h2>
            <p className="text-yellow-50 mb-5 max-w-xl">
              De la préparation de votre CV à la négociation de votre salaire, tout ce que vous devez savoir pour réussir votre recherche d&apos;emploi dans la capitale centrafricaine.
            </p>
            <Link
              href={`/conseils/${articles[0].slug}`}
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors"
            >
              Lire l&apos;article <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center w-56 flex-shrink-0">
            <Image
              src="/illustrations/conseils-hero.svg"
              alt=""
              width={220}
              height={165}
              className="object-contain drop-shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const cardBg = CARD_BG_MAP[article.category] ?? "bg-gray-50";
          const badge  = BADGE_MAP[article.category]  ?? "bg-gray-100 text-gray-600";
          const illus  = ILLUSTRATION_MAP[article.category] ?? "/illustrations/cv-candidature.svg";
          return (
            <Link
              key={article.id}
              href={`/conseils/${article.slug}`}
              className="block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-100 transition-all group"
            >
              {/* Illustration header */}
              <div className={`relative h-44 flex items-center justify-center overflow-hidden ${cardBg}`}>
                <Image
                  src={illus}
                  alt=""
                  width={210}
                  height={140}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              {/* Card body */}
              <div className="p-6">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${badge}`}>
                  {article.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 leading-snug">{article.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">⏱ {article.readTime} de lecture</span>
                  <span className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                    Lire <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

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
