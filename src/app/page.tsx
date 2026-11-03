import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Briefcase, ArrowRight, ArrowUpRight, Star, Users, CheckCircle, FileText, TrendingUp } from "lucide-react";
import JobCard from "@/components/JobCard";
import StatsCounter from "@/components/StatsCounter";
import HeroSearch from "@/components/HeroSearch";
import { JOB_CATEGORIES } from "@/lib/utils";
import ComingSoon from "@/components/ComingSoon";
import { LANDINGS, sectorSlugForCategory } from "@/lib/seo-landing";
import { jsonLd } from "@/lib/seo";

const HOME_FAQ = [
  {
    q: "Comment trouver un emploi en Centrafrique ?",
    a: "Créez un compte gratuit sur KTZ Emploi, complétez votre profil et déposez votre CV. Consultez ensuite les offres d'emploi à Bangui et en province, filtrez par secteur ou type de contrat et postulez en ligne. Activez les alertes pour recevoir les nouvelles offres par email ou WhatsApp.",
  },
  {
    q: "L'inscription sur KTZ Emploi est-elle gratuite ?",
    a: "Oui. L'inscription, la création du CV et les candidatures sont entièrement gratuites pour les candidats. Pour les recruteurs, la publication d'offres est gratuite jusqu'à fin novembre 2026, puis des abonnements démarrent à 10 000 XAF par mois.",
  },
  {
    q: "Quels types d'offres trouve-t-on sur KTZ Emploi ?",
    a: "Des CDI, CDD, stages, missions de consultance et postes à temps partiel, dans tous les secteurs : humanitaire et ONG, santé, informatique et télécoms, banque, éducation, logistique, BTP, agriculture et bien d'autres.",
  },
  {
    q: "Comment publier une offre d'emploi en Centrafrique ?",
    a: "Créez un compte recruteur sur KTZ Emploi, puis cliquez sur « Publier une offre » dans votre tableau de bord. Les candidatures arrivent directement dans votre espace, triées automatiquement selon leur correspondance avec le poste.",
  },
  {
    q: "Qui a créé KTZ Emploi ?",
    a: "KTZ Emploi a été fondée par Donald KITEZE, ingénieur en microélectronique, télécommunications et réseaux et entrepreneur centrafricain, pour faciliter l'accès à l'emploi en République Centrafricaine.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/",
  title: "KTZ Emploi — Offres d'emploi en Centrafrique (Bangui, RCA)",
  absoluteTitle: true,
  description: "Trouvez un emploi en République Centrafricaine avec KTZ Emploi : offres à Bangui et partout en RCA (CDI, CDD, stages, ONG). Inscription gratuite, candidature en ligne en quelques clics.",
});

async function getHomeData() {
  const [featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies, totalUsers] = await Promise.all([
    prisma.job.findMany({
      where: { published: true, featured: true, company: { suspended: false }, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
      include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.job.findMany({
      where: { published: true, company: { suspended: false }, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
      include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.company.findMany({
      select: { name: true, logo: true, sector: true, slug: true },
      orderBy: [{ logo: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.job.count({ where: { published: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] } }),
    prisma.company.count(),
    prisma.user.count({ where: { role: "JOBSEEKER" } }),
  ]);
  return { featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies, totalUsers };
}

// Une photo par secteur (Unsplash, hébergées dans /public/images/secteurs)
const CATEGORY_PHOTOS: Record<string, { src: string; alt: string }> = {
  "Agriculture & Élevage": { src: "/images/secteurs/agriculture.jpg", alt: "Agriculteur au travail dans son champ" },
  "Banque & Finance": { src: "/images/secteurs/banque.jpg", alt: "Professionnel de la finance à son bureau" },
  "BTP & Construction": { src: "/images/secteurs/btp.jpg", alt: "Ouvriers casqués sur le toit d'un chantier" },
  "Commerce & Vente": { src: "/images/secteurs/commerce.jpg", alt: "Marché animé et coloré vu d'en haut" },
  "Communication & Marketing": { src: "/images/secteurs/communication.jpg", alt: "Équipe qui travaille ensemble autour d'un ordinateur" },
  "Comptabilité & Audit": { src: "/images/secteurs/comptabilite.jpg", alt: "Comptable concentré devant son ordinateur" },
  "Éducation & Formation": { src: "/images/secteurs/education.jpg", alt: "Enseignant faisant cours à ses élèves" },
  "Environnement & Mines": { src: "/images/secteurs/mines.jpg", alt: "Mine à ciel ouvert" },
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

// Photos libres de droits (Unsplash), hébergées dans /public/images
const STEPS = [
  { step: "01", icon: Users, title: "Créez votre profil", desc: "Inscrivez-vous gratuitement et renseignez vos compétences, votre expérience et vos ambitions professionnelles.", img: "/images/etape-profil.jpg", alt: "Jeune femme souriante, bras croisés, prête à démarrer sa recherche d'emploi" },
  { step: "02", icon: Search, title: "Explorez les offres", desc: "Parcourez des centaines d'offres d'emploi à Bangui et dans toute la RCA, filtrées selon vos critères.", img: "/images/etape-offres.jpg", alt: "Jeune homme consultant des offres d'emploi sur son ordinateur" },
  { step: "03", icon: CheckCircle, title: "Postulez en un clic", desc: "Envoyez votre candidature directement aux recruteurs et suivez l'avancement depuis votre tableau de bord.", img: "/images/etape-postuler.jpg", alt: "Jeune femme heureuse à son bureau après avoir postulé" },
];

/** En-tête de section : petite étiquette, grand titre, lien « voir tout » optionnel */
function SectionHead({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={`mb-10 flex flex-col gap-5 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className="max-w-2xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className={`mt-3 text-3xl sm:text-4xl font-extrabold leading-[1.1] ${light ? "text-white" : "text-gray-900"}`}>{title}</h2>
        {subtitle && <p className={`mt-3 text-base ${light ? "text-gray-400" : "text-gray-500"}`}>{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="group shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  // Coming soon (production + preview locale via SHOW_COMING_SOON=true)
  if (process.env.SHOW_COMING_SOON === "true") {
    return <ComingSoon />;
  }

  // En développement (localhost) → vrai site
  const { featuredJobs, recentJobs, topCompanies, totalJobs, totalCompanies } = await getHomeData();

  return (
    <>
      {/* ══════════════════════════════════════
          1. HERO (photo avec zoom lent)
      ══════════════════════════════════════ */}
      <section className="relative min-h-[400px] sm:min-h-[520px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/accueil.png" alt="Recherche d'emploi en Centrafrique avec KTZ Emploi" className="kenburns absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end h-full min-h-[400px] sm:min-h-[520px]">
          <div className="pb-8 pt-10 sm:pb-12 sm:pt-16">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white text-[#1e3a5f] text-xs sm:text-sm font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-4 sm:mb-6 shadow-md animate-slide-up-slow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg" alt="Drapeau RCA" className="flag-wave h-4 w-6 sm:h-5 sm:w-7 object-cover rounded-sm shadow-sm" />
              <h1 className="text-xs sm:text-sm font-bold tracking-normal">Offres d&apos;emploi en Centrafrique · 1ère plateforme d&apos;emploi en RCA</h1>
            </div>
            <p className="font-display text-[1.45rem] sm:text-4xl lg:text-[2.6rem] font-extrabold text-white leading-[1.12] tracking-tight mb-5 sm:mb-7 drop-shadow-lg">
              <span className="block animate-slide-up-slow">Pas besoin de connaître</span>
              <span className="block animate-slide-up-slow delay-250">quelqu&apos;un qui connaît quelqu&apos;un.</span>
              <span className="block animate-slide-up-slow delay-500">
                <span className="text-orange-400">Ici, vous postulez vous-même</span>{" "}—
              </span>
              <span className="block animate-slide-up-slow delay-750">et ça change tout.</span>
            </p>
            <HeroSearch />
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { label: "CDI", type: "CDI" },
                { label: "Stage", type: "Stage" },
                { label: "Humanitaire", q: "Humanitaire" },
                { label: "IT & Tech", q: "Informatique" },
                { label: "Santé", q: "Santé" },
              ].map((chip) => (
                <Link key={chip.label} href={`/emplois?${chip.type ? `type=${chip.type}` : `q=${chip.q}`}`} className="zoom-hover bg-white/20 backdrop-blur-sm hover:bg-white/35 border border-white/30 text-white text-sm px-4 py-1.5 rounded-full">
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
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHead
              eyebrow="Sélection"
              title={<span className="inline-flex items-center gap-3">Offres à la une <Star className="h-7 w-7 text-yellow-400 fill-yellow-400" /></span>}
              href="/emplois?featured=true"
              linkLabel="Voir tout"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Entreprises : défilement infini */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Ils nous font confiance" title="Ils recrutent en RCA" href="/entreprises" linkLabel="Toutes les entreprises" />
          <div className="marquee -mx-4 sm:mx-0">
            <div className="marquee-track py-3">
              {[...topCompanies, ...topCompanies].map((co, i) => {
                const dup = i >= topCompanies.length;
                const initials = co.name.slice(0, 2).toUpperCase();
                const colors = ["bg-orange-100 text-orange-600","bg-blue-100 text-blue-600","bg-green-100 text-green-600","bg-purple-100 text-purple-600","bg-rose-100 text-rose-600","bg-yellow-100 text-yellow-700","bg-teal-100 text-teal-600","bg-indigo-100 text-indigo-600"];
                const color = colors[co.name.charCodeAt(0) % colors.length];
                return (
                  <Link key={`${co.slug}-${i}`} href={`/entreprises/${co.slug}`} aria-hidden={dup || undefined} tabIndex={dup ? -1 : undefined} className="soft-card w-44 shrink-0 rounded-2xl p-5 flex flex-col items-center gap-2.5 group">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-base overflow-hidden transition-transform duration-300 group-hover:scale-105 ${co.logo ? "bg-gray-50 border border-gray-100" : color}`}>
                      {co.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={co.logo} alt={co.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-800 text-center leading-tight group-hover:text-orange-600 line-clamp-2 transition-colors">{co.name}</span>
                    {co.sector && <span className="text-[10px] text-gray-400 text-center line-clamp-1">{co.sector}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche : 3 étapes illustrées par de vraies photos */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Pour les candidats" title="Comment ça marche ?" subtitle="Trouvez votre emploi en 3 étapes simples" center />
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map(({ step, icon: Icon, title, desc, img, alt }) => (
              <div key={step} className="soft-card group rounded-3xl p-3 pb-7">
                <div className="relative">
                  <div data-photo className="aspect-[4/3] rounded-3xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={alt} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-gray-900 font-display font-extrabold text-sm px-3 py-1 rounded-full shadow-sm">
                    {step}
                  </span>
                  <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="px-4 pt-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/inscription" className="btn-shine group inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-orange-500/30 transition-colors">
              Commencer gratuitement <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Explorer par secteur */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Secteurs" title="Explorer par secteur" subtitle="Trouvez des offres dans votre domaine d'expertise" href="/emplois" linkLabel="Toutes les offres" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {JOB_CATEGORIES.slice(0, 8).map((cat) => {
              const photo = CATEGORY_PHOTOS[cat];
              return (
                <Link key={cat} href={sectorSlugForCategory(cat) ? `/emplois/secteur/${sectorSlugForCategory(cat)}` : `/emplois?category=${encodeURIComponent(cat)}`} className="group relative block rounded-3xl shadow-sm hover:shadow-xl hover:shadow-orange-500/15 transition-shadow duration-300">
                  <div data-photo className="aspect-[4/5] sm:aspect-[4/3] rounded-3xl bg-gray-200">
                    {photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-colors duration-300 group-hover:from-orange-700/85" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 sm:p-4 flex items-end justify-between gap-2">
                    <span className="font-display text-white font-bold text-sm sm:text-base leading-tight drop-shadow">{cat}</span>
                    <span className="shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:text-orange-600 text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dernières offres */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Nouveautés" title="Dernières offres publiées" href="/emplois" linkLabel="Voir toutes les offres" />
          {recentJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-700">Aucune offre pour le moment</p>
              <p className="text-sm text-gray-400 mt-1">Soyez le premier à publier une offre !</p>
              <Link href="/inscription?role=employer" className="mt-5 inline-block bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
                Recruter maintenant
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Espace recruteurs : composition de vraies photos */}
      <section className="bg-gray-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
            {/* Photos */}
            <div className="relative max-w-lg mx-auto w-full pb-10 sm:pb-12 pr-8 sm:pr-14">
              <div data-photo className="aspect-[4/5] rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/recruteur-entretien.jpg" alt="Une recruteuse mène un entretien d'embauche avec une candidate" loading="lazy" className="w-full h-full object-cover object-[70%_center]" />
              </div>
              <div data-photo className="absolute bottom-0 right-0 w-[52%] aspect-[4/3] rounded-3xl border-[6px] border-gray-900 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/recruteur-reunion.jpg" alt="Une équipe de recrutement échange autour d'une table" loading="lazy" className="w-full h-full object-cover" />
              </div>
              {/* Cartes flottantes */}
              <div className="float-y absolute top-6 -left-3 sm:-left-8 bg-white text-gray-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></span>
                <div>
                  <p className="text-xs font-bold leading-tight">Nouvelle candidature</p>
                  <p className="text-[11px] text-gray-500 leading-tight">Comptable · Bangui</p>
                </div>
              </div>
              <div className="float-y-slow absolute top-[42%] -right-2 sm:right-2 bg-white text-gray-900 rounded-2xl shadow-xl px-4 py-3">
                <p className="font-display text-2xl font-extrabold text-orange-500 leading-none">94%</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">de correspondance<br />avec le poste</p>
              </div>
            </div>

            {/* Texte */}
            <div>
              <span className="eyebrow">Espace recruteurs</span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold leading-[1.05] mb-5">
                Vous recrutez ?<br />
                <span className="text-orange-400">Trouvez vos talents en RCA.</span>
              </h2>
              <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-md">Publiez vos offres et accédez à des milliers de candidats qualifiés. Simple, rapide et gratuit pour commencer.</p>
              <ul className="space-y-3 mb-9">
                {["Publication d'offres en moins de 5 minutes", "Accès à plus de 1 200 profils de candidats", "Suivi des candidatures en temps réel", "Mise en avant de vos offres en page d'accueil"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                    <span className="w-6 h-6 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-orange-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/inscription?role=employer" className="btn-shine bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold text-center text-sm shadow-lg shadow-orange-500/30 transition-colors">
                  Publier une offre gratuitement
                </Link>
                <Link href="/entreprises" className="border border-white/20 hover:border-white/50 hover:bg-white/5 text-gray-200 hover:text-white px-8 py-3.5 rounded-full font-semibold text-center text-sm transition-colors">
                  Voir les entreprises
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conseils carrière */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead eyebrow="Ressources" title="Conseils carrière" subtitle="Nos experts vous accompagnent dans votre recherche d'emploi" href="/conseils" linkLabel="Tous les conseils" />
          <div className="grid md:grid-cols-3 gap-5">
            {TIPS.map(({ icon: Icon, tag, title, desc }) => (
              <Link key={title} href="/conseils" className="soft-card group rounded-3xl p-7 flex flex-col">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-orange-100">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.15em]">{tag}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2 leading-snug group-hover:text-orange-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold mt-5">
                  Lire la suite <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Présentation + FAQ (texte de référence pour Google) */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <span className="eyebrow">À propos</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5 leading-tight">Trouver un emploi en Centrafrique avec KTZ Emploi</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                <strong className="text-gray-800">KTZ Emploi</strong> (ktzemploi.com) est la plateforme de recherche d&apos;emploi
                dédiée à la <strong className="text-gray-800">République Centrafricaine</strong>. Elle réunit en un seul endroit
                les offres d&apos;emploi publiées à Bangui et en province par les entreprises, les administrations,
                les ONG et les organisations internationales.
              </p>
              <p>
                Candidats : créez votre profil gratuitement, déposez votre CV et postulez en ligne aux offres en CDI, CDD,
                stage ou consultance. Les alertes emploi vous préviennent par email ou WhatsApp dès qu&apos;une offre
                correspond à votre métier.
              </p>
              <p>
                Recruteurs : publiez vos offres, recevez les candidatures triées automatiquement par intelligence
                artificielle et consultez la CVthèque des talents centrafricains.
              </p>
              <p>
                KTZ Emploi a été fondée par <Link href="/a-propos" className="text-orange-600 hover:underline">Donald KITEZE</Link>,
                ingénieur et entrepreneur centrafricain, pour rendre le marché de l&apos;emploi en RCA plus simple et plus transparent.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {LANDINGS.ville.slice(0, 6).map((l) => (
                <Link key={l.slug} href={`/emplois/ville/${l.slug}`} className="text-sm px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
                  Emploi {l.label}
                </Link>
              ))}
              {LANDINGS.contrat.slice(0, 3).map((l) => (
                <Link key={l.slug} href={`/emplois/contrat/${l.slug}`} className="text-sm px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 mb-5 leading-tight">Questions fréquentes</h2>
            <div className="space-y-3">
              {HOME_FAQ.map((f) => (
                <details key={f.q} className="group bg-white border border-gray-200 rounded-2xl p-5 open:border-orange-200 open:shadow-sm transition-colors">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center gap-3">
                    {f.q}
                    <span className="shrink-0 w-7 h-7 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bannière inscription : photo d'équipe en parallaxe sous un voile orange */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-parallax src="/images/equipe-talents.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/95 via-orange-500/90 to-orange-500/70" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.05] mb-4">Prêt à trouver votre prochain emploi ?</h2>
          <p className="text-orange-50 text-base sm:text-lg mb-9 max-w-xl mx-auto">Créez votre profil gratuitement et recevez des offres personnalisées directement dans votre boîte mail.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inscription" className="btn-shine bg-white text-orange-600 hover:bg-orange-50 px-8 py-3.5 rounded-full font-bold shadow-lg shadow-black/10 transition-colors">Créer mon profil</Link>
            <Link href="/emplois" className="border-2 border-white/80 text-white hover:bg-white/10 px-8 py-3.5 rounded-full font-semibold transition-colors">Parcourir les offres</Link>
          </div>
        </div>
      </section>
    </>
  );
}
