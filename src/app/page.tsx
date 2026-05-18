import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, ArrowRight, Star, Users, CheckCircle, FileText, TrendingUp } from "lucide-react";
import JobCard from "@/components/JobCard";
import StatsCounter from "@/components/StatsCounter";
import HeroSearch from "@/components/HeroSearch";
import { JOB_CATEGORIES } from "@/lib/utils";
import ComingSoon from "@/components/ComingSoon";

async function getHomeData() {
  const [featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies, totalUsers] = await Promise.all([
    prisma.job.findMany({
      where: { published: true, featured: true, company: { suspended: false } },
      include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.job.findMany({
      where: { published: true, company: { suspended: false } },
      include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.company.findMany({
      select: { name: true, logo: true, sector: true, slug: true },
      orderBy: [{ logo: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.job.count({ where: { published: true } }),
    prisma.company.count(),
    prisma.user.count({ where: { role: "JOBSEEKER" } }),
  ]);
  return { featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies, totalUsers };
}

const CATEGORY_ICONS: Record<string, string> = {
  "Humanitaire & ONG": "🤝",
  "Informatique & Télécoms": "💻",
  "Médecine & Santé": "🏥",
  "Banque & Finance": "🏦",
  "Éducation & Formation": "📚",
  "Commerce & Vente": "🛒",
  "BTP & Construction": "🏗️",
  "Agriculture & Élevage": "🌾",
};

const TIPS = [
  {
    icon: FileText,
    tag: "CV & Candidature",
    title: "Comment rédiger un CV qui attire les recruteurs en RCA",
    desc: "Les clés pour structurer votre CV et vous démarquer parmi des centaines de candidats.",
  },
  {
    icon: Users,
    tag: "Entretien",
    title: "Les 5 erreurs à éviter lors d'un entretien d'embauche",
    desc: "Préparez-vous efficacement et faites bonne impression dès la première rencontre.",
  },
  {
    icon: TrendingUp,
    tag: "Salaires",
    title: "Grilles de salaires en République Centrafricaine 2025",
    desc: "Découvrez les rémunérations moyennes par secteur et par niveau d'expérience.",
  },
];

export default async function HomePage() {
  // Coming soon (production + preview locale via SHOW_COMING_SOON=true)
  if (process.env.SHOW_COMING_SOON === "true") {
    return <ComingSoon />;
  }

  // En développement (localhost) → vrai site
  const { featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies, totalUsers } = await getHomeData();

  return (
    <>
      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="relative" style={{ minHeight: "560px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/accueil.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full" style={{ minHeight: "560px" }}>
          <div className="pb-12 pt-24">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white text-[#1e3a5f] text-sm font-bold px-4 py-1.5 rounded-full mb-6 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg" alt="Drapeau RCA" className="flag-wave h-5 w-7 object-cover rounded-sm shadow-sm" />
              <span>1ère plateforme de recherche d&apos;emploi en Centrafrique</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-8 drop-shadow-lg">
              Pas besoin de connaître<br />
              quelqu&apos;un qui connaît quelqu&apos;un.<br />
              <span className="text-orange-400">Ici, vous postulez vous-même</span>{" "}—<br />
              et ça change tout.
            </h1>
            <HeroSearch />
            <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: "CDI", type: "CDI" },
                  { label: "Stage", type: "Stage" },
                  { label: "Humanitaire", q: "Humanitaire" },
                  { label: "IT & Tech", q: "Informatique" },
                  { label: "Santé", q: "Santé" },
                ].map((chip) => (
                  <Link key={chip.label} href={`/emplois?${chip.type ? `type=${chip.type}` : `q=${chip.q}`}`} className="bg-white/20 backdrop-blur-sm hover:bg-white/35 border border-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-all">
                    {chip.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bande drapeau RCA */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-blue-600" />
        <div className="flex-1 bg-white border-t border-gray-200" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsCounter totalJobs={totalJobs} totalCompanies={totalCompanies} totalUsers={200} />
        </div>
      </section>

      {/* Offres à la une */}
      {featuredJobs.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <h2 className="text-2xl font-bold text-gray-900">Offres à la une</h2>
              </div>
              <Link href="/emplois?featured=true" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Entreprises */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Ils recrutent en RCA</h2>
            <Link href="/entreprises" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Voir toutes les entreprises <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {topCompanies.map((co) => {
              const initials = co.name.slice(0, 2).toUpperCase();
              const colors = ["bg-orange-100 text-orange-600","bg-blue-100 text-blue-600","bg-green-100 text-green-600","bg-purple-100 text-purple-600","bg-rose-100 text-rose-600","bg-yellow-100 text-yellow-700","bg-teal-100 text-teal-600","bg-indigo-100 text-indigo-600"];
              const color = colors[co.name.charCodeAt(0) % colors.length];
              return (
                <Link key={co.slug} href={`/entreprises/${co.slug}`} className="bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md p-5 flex flex-col items-center gap-2.5 transition-all group">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-base overflow-hidden ${co.logo ? "bg-gray-50 border border-gray-100" : color}`}>
                    {co.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={co.logo} alt={co.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      initials
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 text-center leading-tight group-hover:text-orange-600 line-clamp-2">{co.name}</span>
                  {co.sector && <span className="text-[10px] text-gray-400 text-center line-clamp-1">{co.sector}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
            <p className="text-gray-500">Trouvez votre emploi en 3 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Users, title: "Créez votre profil", desc: "Inscrivez-vous gratuitement et renseignez vos compétences, votre expérience et vos ambitions professionnelles.", color: "bg-orange-50 text-orange-500" },
              { step: "02", icon: Search, title: "Explorez les offres", desc: "Parcourez des centaines d'offres d'emploi à Bangui et dans toute la RCA, filtrées selon vos critères.", color: "bg-blue-50 text-blue-500" },
              { step: "03", icon: CheckCircle, title: "Postulez en un clic", desc: "Envoyez votre candidature directement aux recruteurs et suivez l'avancement depuis votre tableau de bord.", color: "bg-green-50 text-green-500" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="relative text-center">
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-px border-t-2 border-dashed border-gray-200" />
                <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center mx-auto mb-5 relative z-10`}>
                  <Icon className="h-9 w-9" />
                </div>
                <div className="text-xs font-bold text-gray-300 mb-2 tracking-widest">ÉTAPE {step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/inscription" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explorer par secteur */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Explorer par secteur</h2>
              <p className="text-gray-500 text-sm mt-1">Trouvez des offres dans votre domaine d&apos;expertise</p>
            </div>
            <Link href="/emplois" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Toutes les offres <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {JOB_CATEGORIES.slice(0, 8).map((cat) => (
              <Link key={cat} href={`/emplois?category=${encodeURIComponent(cat)}`} className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all bg-white">
                <span className="text-2xl">{CATEGORY_ICONS[cat] || "📋"}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dernières offres */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dernières offres publiées</h2>
            <Link href="/emplois" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Voir toutes les offres <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">Aucune offre pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Soyez le premier à publier une offre !</p>
              <Link href="/inscription?role=employer" className="mt-5 inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                Recruter maintenant
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Espace recruteurs */}
      <section className="bg-gray-900 text-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/recruter-illustration.svg" alt="Recruter en Centrafrique" className="w-full max-w-md opacity-90" />
            </div>
            <div>
              <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">Espace recruteurs</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                Vous recrutez ?<br />
                <span className="text-orange-400">Trouvez vos talents en RCA.</span>
              </h2>
              <p className="text-gray-400 text-base mb-8 max-w-md">Publiez vos offres et accédez à des milliers de candidats qualifiés. Simple, rapide et gratuit pour commencer.</p>
              <ul className="space-y-3 mb-8">
                {["Publication d'offres en moins de 5 minutes", "Accès à plus de 1 200 profils de candidats", "Suivi des candidatures en temps réel", "Mise en avant de vos offres en page d'accueil"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/inscription?role=employer" className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-xl font-bold transition-colors text-center text-sm">
                  Publier une offre gratuitement
                </Link>
                <Link href="/entreprises" className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors text-center text-sm">
                  Voir les entreprises
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conseils carrière */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Conseils carrière</h2>
              <p className="text-gray-500 text-sm mt-1">Nos experts vous accompagnent dans votre recherche d&apos;emploi</p>
            </div>
            <Link href="/conseils" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Tous les conseils <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TIPS.map(({ icon: Icon, tag, title, desc }) => (
              <Link key={title} href="/conseils" className="group bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md p-6 transition-all">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">{tag}</span>
                <h3 className="text-base font-bold text-gray-900 mt-2 mb-2 leading-snug group-hover:text-orange-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-medium mt-4">
                  Lire la suite <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bannière inscription */}
      <section className="bg-orange-500 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">Prêt à trouver votre prochain emploi ?</h2>
          <p className="text-orange-100 mb-8">Créez votre profil gratuitement et recevez des offres personnalisées directement dans votre boîte mail.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inscription" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-xl font-bold transition-colors">Créer mon profil</Link>
            <Link href="/emplois" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition-colors">Parcourir les offres</Link>
          </div>
        </div>
      </section>
    </>
  );
}
