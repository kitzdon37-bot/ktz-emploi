import Link from "next/link";
import { BookOpen, TrendingUp, FileText, MessageSquare, Star, ArrowRight } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "Comment rédiger un CV qui se démarque en 2024",
    excerpt: "Votre CV est votre carte de visite. Découvrez les meilleures pratiques pour créer un CV percutant adapté au marché centrafricain.",
    category: "CV & Candidature",
    readTime: "5 min",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    title: "Réussir son entretien d'embauche : 10 conseils essentiels",
    excerpt: "L'entretien est votre chance de briller. Préparez-vous efficacement avec ces conseils pratiques testés par des professionnels RH.",
    category: "Entretien",
    readTime: "7 min",
    icon: MessageSquare,
    color: "bg-orange-50 text-orange-500",
  },
  {
    id: 3,
    title: "Les secteurs qui recrutent le plus en RCA",
    excerpt: "Humanitaire, télécoms, finance... Découvrez quels secteurs offrent le plus d'opportunités en République Centrafricaine.",
    category: "Marché de l'emploi",
    readTime: "4 min",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: 4,
    title: "Rédiger une lettre de motivation convaincante",
    excerpt: "La lettre de motivation est souvent la clé d'une candidature réussie. Apprenez à structurer un message qui accroche les recruteurs.",
    category: "CV & Candidature",
    readTime: "6 min",
    icon: FileText,
    color: "bg-orange-50 text-orange-600",
  },
  {
    id: 5,
    title: "Négocier son salaire : guide complet",
    excerpt: "Savoir négocier sa rémunération est une compétence essentielle. Voici comment aborder cette discussion avec confiance.",
    category: "Carrière",
    readTime: "8 min",
    icon: Star,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    id: 6,
    title: "Se reconvertir professionnellement : par où commencer ?",
    excerpt: "Changer de carrière peut être intimidant, mais avec la bonne approche, c'est tout à fait réalisable. Voici les étapes clés.",
    category: "Carrière",
    readTime: "10 min",
    icon: TrendingUp,
    color: "bg-pink-50 text-pink-600",
  },
];

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
        <div className="relative">
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4 inline-block">
            Article phare
          </span>
          <h2 className="text-2xl font-bold mb-3">Guide complet pour trouver un emploi à Bangui</h2>
          <p className="text-yellow-50 mb-5 max-w-xl">
            De la préparation de votre CV à la négociation de votre salaire, tout ce que vous devez savoir pour réussir votre recherche d&apos;emploi dans la capitale centrafricaine.
          </p>
          <button className="flex items-center gap-2 bg-white text-orange-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
            Lire l&apos;article <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-orange-100 transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${article.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {article.category}
              </span>
              <h3 className="font-bold text-gray-900 mt-3 mb-2 leading-snug">{article.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">⏱ {article.readTime} de lecture</span>
                <button className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                  Lire <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
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

