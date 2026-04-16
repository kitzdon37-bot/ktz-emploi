import Link from "next/link";
import { Search, MapPin, Briefcase, Building2, ArrowRight, Star, Users, CheckCircle, FileText, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import { JOB_CATEGORIES } from "@/lib/utils";

async function getHomeData() {
  const [featuredJobs, recentJobs, totalJobs, totalCompanies, totalUsers] = await Promise.all([
    prisma.job.findMany({
      where: { published: true, featured: true },
      include: { company: { select: { name: true, logo: true, verified: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.job.findMany({
      where: { published: true },
      include: { company: { select: { name: true, logo: true, verified: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.job.count({ where: { published: true } }),
    prisma.company.count(),
    prisma.user.count({ where: { role: "JOBSEEKER" } }),
  ]);
  return { featuredJobs, recentJobs, totalJobs, totalCompanies, totalUsers };
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

const COMPANIES = [
  { name: "SOCATEL", sector: "Télécoms", color: "bg-blue-100 text-blue-700" },
  { name: "Ecobank", sector: "Banque", color: "bg-green-100 text-green-700" },
  { name: "PNUD", sector: "Humanitaire", color: "bg-indigo-100 text-indigo-700" },
  { name: "TotalEnergies", sector: "Énergie", color: "bg-red-100 text-red-700" },
  { name: "Airtel RCA", sector: "Mobile", color: "bg-orange-100 text-orange-700" },
  { name: "MINUSCA", sector: "Nations Unies", color: "bg-sky-100 text-sky-700" },
];

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
  const { featuredJobs, recentJobs, totalJobs, totalCompanies, totalUsers } = await getHomeData();

  return (
    <>
      {/* ══════════════════════════════════════
          1. HERO — image en fond, style Hellowork
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "560px" }}>

        {/* Image de fond pleine largeur */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/accueil.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay dégradé pour lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Contenu superposé */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full" style={{ minHeight: "560px" }}>
          <div className="pb-12 pt-24">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <span>🇨🇫</span>
              <span>N°1 de l&apos;emploi en Centrafrique</span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-8 drop-shadow-lg">
              Notre job, vous aider<br />
              à trouver le vôtre parmi{" "}
              <span className="text-orange-400">
                {totalJobs > 0 ? `${totalJobs}+` : "des centaines d'"}
              </span>
              {totalJobs > 0 && " offres"}
            </h1>

            {/* Barre de recherche — style Hellowork */}
            <form action="/emplois" method="GET">
              <div className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Quoi ? */}
                <div className="flex items-center gap-3 flex-1 px-5 py-1 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <Search className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <div className="flex flex-col py-2.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quoi ?</label>
                    <input
                      type="text"
                      name="q"
                      placeholder="Métier, entreprise, compétence..."
                      className="outline-none text-gray-800 placeholder-gray-400 text-sm bg-transparent mt-0.5"
                    />
                  </div>
                </div>
                {/* Où ? */}
                <div className="flex items-center gap-3 sm:w-56 px-5 py-1 border-b sm:border-b-0 sm:border-r border-gray-200">
                  <MapPin className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <div className="flex flex-col py-2.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Où ?</label>
                    <select name="location" className="outline-none text-gray-800 text-sm bg-transparent mt-0.5 text-gray-500">
                      <option value="">Ville, région...</option>
                      <option value="Bangui">Bangui</option>
                      <option value="Bambari">Bambari</option>
                      <option value="Berbérati">Berbérati</option>
                      <option value="Bouar">Bouar</option>
                    </select>
                  </div>
                </div>
                {/* Bouton */}
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Rechercher
                </button>
              </div>

              {/* Filtres rapides */}
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  { label: "CDI", type: "CDI" },
                  { label: "Stage", type: "Stage" },
                  { label: "Humanitaire", q: "Humanitaire" },
                  { label: "IT & Tech", q: "Informatique" },
                  { label: "Santé", q: "Santé" },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={`/emplois?${chip.type ? `type=${chip.type}` : `q=${chip.q}`}`}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/35 border border-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-all"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. STATS + DRAPEAU
      ══════════════════════════════════════ */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-blue-600" />
        <div className="flex-1 bg-white border-t border-gray-200" />
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-yellow-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="text-center py-2">
              <div className="text-3xl font-extrabold text-gray-900">{totalJobs > 0 ? `${totalJobs}` : "500"}+</div>
              <div className="text-sm text-gray-500 mt-1">Offres d&apos;emploi</div>
            </div>
            <div className="text-center py-2">
              <div className="text-3xl font-extrabold text-gray-900">{totalCompanies > 0 ? `${totalCompanies}` : "120"}+</div>
              <div className="text-sm text-gray-500 mt-1">Entreprises partenaires</div>
            </div>
            <div className="text-center py-2">
              <div className="text-3xl font-extrabold text-gray-900">{totalUsers > 0 ? `${totalUsers}` : "1 200"}+</div>
              <div className="text-sm text-gray-500 mt-1">Candidats inscrits</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. ILS RECRUTENT EN RCA
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Ils recrutent en RCA</h2>
            <Link href="/entreprises" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Voir toutes les entreprises <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COMPANIES.map((co) => (
              <Link
                key={co.name}
                href={`/emplois?q=${co.name}`}
                className="bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-md p-4 flex flex-col items-center gap-2 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${co.color}`}>
                  {co.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight group-hover:text-orange-600">{co.name}</span>
                <span className="text-[10px] text-gray-400">{co.sector}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. COMMENT ÇA MARCHE
      ══════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
            <p className="text-gray-500">Trouvez votre emploi en 3 étapes simples</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Users,
                title: "Créez votre profil",
                desc: "Inscrivez-vous gratuitement et renseignez vos compétences, votre expérience et vos ambitions professionnelles.",
                color: "bg-orange-50 text-orange-500",
              },
              {
                step: "02",
                icon: Search,
                title: "Explorez les offres",
                desc: "Parcourez des centaines d'offres d'emploi à Bangui et dans toute la RCA, filtrées selon vos critères.",
                color: "bg-blue-50 text-blue-500",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Postulez en un clic",
                desc: "Envoyez votre candidature directement aux recruteurs et suivez l'avancement depuis votre tableau de bord.",
                color: "bg-green-50 text-green-500",
              },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="relative text-center">
                {/* Ligne de connexion */}
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
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Commencer gratuitement <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. OFFRES À LA UNE
      ══════════════════════════════════════ */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          6. EXPLORER PAR SECTEUR
      ══════════════════════════════════════ */}
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
              <Link
                key={cat}
                href={`/emplois?category=${encodeURIComponent(cat)}`}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all bg-white"
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat] || "📋"}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 leading-tight">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. DERNIÈRES OFFRES
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Dernières offres publiées</h2>
            <Link href="/emplois" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1">
              Voir toutes les offres <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* ══════════════════════════════════════
          8. ESPACE RECRUTEURS
      ══════════════════════════════════════ */}
      <section className="bg-gray-900 text-white py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Illustration */}
            <div className="hidden lg:flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/recruter-illustration.svg"
                alt="Recruter en Centrafrique"
                className="w-full max-w-md opacity-90"
              />
            </div>
            {/* Contenu */}
            <div>
              <span className="inline-block bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
                Espace recruteurs
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                Vous recrutez ?<br />
                <span className="text-orange-400">Trouvez vos talents en RCA.</span>
              </h2>
              <p className="text-gray-400 text-base mb-8 max-w-md">
                Publiez vos offres et accédez à des milliers de candidats qualifiés. Simple, rapide et gratuit pour commencer.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Publication d'offres en moins de 5 minutes",
                  "Accès à plus de 1 200 profils de candidats",
                  "Suivi des candidatures en temps réel",
                  "Mise en avant de vos offres en page d'accueil",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/inscription?role=employer"
                  className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-xl font-bold transition-colors text-center text-sm"
                >
                  Publier une offre gratuitement
                </Link>
                <Link
                  href="/entreprises"
                  className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-3 rounded-xl font-semibold transition-colors text-center text-sm"
                >
                  Voir les entreprises
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. CONSEILS CARRIÈRE
      ══════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════
          10. BANNIÈRE INSCRIPTION CANDIDAT
      ══════════════════════════════════════ */}
      <section className="bg-orange-500 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3">
            Prêt à trouver votre prochain emploi ?
          </h2>
          <p className="text-orange-100 mb-8">
            Créez votre profil gratuitement et recevez des offres personnalisées directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-3 rounded-xl font-bold transition-colors"
            >
              Créer mon profil
            </Link>
            <Link
              href="/emplois"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Parcourir les offres
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
