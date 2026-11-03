import { pageMetadata, founderSchema, jsonLd, SITE_URL } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Lightbulb, Heart, Users, TrendingUp, Building2,
  MapPin, CheckCircle, ArrowRight, Globe, Shield, Zap, Quote,
  Layers, EyeOff, Scale, BookOpen,
} from "lucide-react";

export const metadata: Metadata = pageMetadata({
  path: "/a-propos",
  title: "Donald KITEZE, fondateur de KTZ Emploi — Qui sommes-nous",
  description:
    "Donald KITEZE (KITEZE Donald), ingénieur et entrepreneur centrafricain, a fondé KTZ Emploi, la plateforme d'emploi de la République Centrafricaine. Découvrez son histoire et notre mission.",
});

// Page de profil du fondateur : aide Google à associer « Donald KITEZE » à KTZ Emploi
const profileSchema = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: `${SITE_URL}/a-propos`,
  name: "Donald KITEZE — Fondateur de KTZ Emploi",
  mainEntity: founderSchema(),
  about: { "@id": `${SITE_URL}/#organisation` },
};

const PROBLEMS = [
  {
    icon: Layers,
    title: "Pas de plateforme dédiée",
    desc: "Avant KTZ Emploi, les offres d'emploi en RCA étaient dispersées sur des réseaux sociaux, des panneaux d'affichage ou transmises de bouche à oreille. Aucun outil centralisé n'existait.",
  },
  {
    icon: EyeOff,
    title: "Candidats invisibles",
    desc: "Des milliers de Centrafricains diplômés et qualifiés n'avaient aucun moyen de se rendre visibles auprès des employeurs. Leur talent restait inexploité.",
  },
  {
    icon: Building2,
    title: "Recrutement difficile pour les entreprises",
    desc: "Les entreprises, ONG et organisations internationales peinaient à trouver des profils locaux qualifiés, souvent contraintes de recruter à l'étranger.",
  },
  {
    icon: Scale,
    title: "Manque de transparence",
    desc: "L'absence d'informations sur les salaires, les entreprises et les conditions de travail créait des inégalités et favorisait l'exploitation.",
  },
];

const VALUES = [
  {
    icon: Heart,
    color: "bg-rose-100 text-rose-600",
    title: "Centrafricain d'abord",
    desc: "Nous sommes nés en RCA, pour la RCA. Chaque décision que nous prenons est guidée par l'intérêt des Centrafricains.",
  },
  {
    icon: Shield,
    color: "bg-blue-100 text-blue-600",
    title: "Confiance & Transparence",
    desc: "Informations sur les salaires, vérification des entreprises, protection des données : nous construisons un écosystème de confiance.",
  },
  {
    icon: Zap,
    color: "bg-amber-100 text-amber-600",
    title: "Accessibilité",
    desc: "Simple à utiliser sur mobile comme sur ordinateur, même avec une connexion limitée. L'emploi doit être accessible à tous.",
  },
  {
    icon: Globe,
    color: "bg-emerald-100 text-emerald-600",
    title: "Ouverture",
    desc: "Nous accueillons les entreprises locales comme les organisations internationales, les stages comme les CDI, Bangui comme les régions.",
  },
];

const IMPACTS = [
  { number: "500+", label: "Offres publiées" },
  { number: "2 000+", label: "Candidats inscrits" },
  { number: "150+", label: "Entreprises partenaires" },
  { number: "17", label: "Secteurs couverts" },
];

// Photos libres de droits (Unsplash), hébergées dans /public/images
const MISSIONS = [
  {
    title: "Pour les candidats",
    img: "/images/etape-profil.jpg",
    alt: "Jeune femme souriante prête à démarrer sa recherche d'emploi",
    items: [
      "Centraliser toutes les offres d'emploi en RCA en un seul endroit",
      "Permettre à chaque Centrafricain de créer un profil visible par les recruteurs",
      "Recevoir des alertes personnalisées pour les offres correspondant à son profil",
      "Postuler en un clic, suivre ses candidatures en temps réel",
      "Accéder à des conseils carrière adaptés au marché local",
    ],
  },
  {
    title: "Pour les entreprises & recruteurs",
    img: "/images/recruteur-reunion.jpg",
    alt: "Équipe de recrutement échangeant autour d'une table",
    items: [
      "Publier des offres d'emploi et les diffuser à des milliers de candidats",
      "Accéder à une CVthèque de talents centrafricains qualifiés",
      "Gérer les candidatures avec des outils modernes (pipeline, notes, statuts)",
      "Contacter les candidats par email ou WhatsApp directement depuis la plateforme",
      "Renforcer leur marque employeur avec un profil entreprise dédié",
    ],
  },
];

const VISION = [
  {
    title: "Court terme",
    desc: "S'imposer comme la référence incontournable pour l'emploi en RCA, avec la CVthèque la plus complète du pays et la confiance des meilleurs employeurs.",
  },
  {
    title: "Moyen terme",
    desc: "Étendre l'impact aux régions de la RCA et aux diasporas centrafricaines, tout en gardant Bangui et le terrain local au cœur de la plateforme.",
  },
  {
    title: "Long terme",
    desc: "Contribuer concrètement à réduire le chômage des jeunes en RCA en connectant formation professionnelle, emploi et entrepreneuriat local.",
  },
];

export default function AProposPage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(profileSchema)} />

      {/* ── Hero : photo d'équipe (zoom lent) sous un voile sombre ────────── */}
      <section className="relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/equipe-talents.jpg" alt="" aria-hidden="true" className="kenburns absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/80 to-orange-950/70" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-orange-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6 animate-slide-up-slow">
            <MapPin className="h-3.5 w-3.5" />
            Bangui, République Centrafricaine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6 animate-slide-up-slow delay-250">
            La plateforme d&apos;emploi
            <span className="block text-orange-400">née pour la RCA</span>
          </h1>
          <p className="text-lg text-gray-200 leading-relaxed max-w-2xl mx-auto animate-slide-up-slow delay-500">
            KTZ Emploi est née d&apos;un vécu personnel et d&apos;une conviction forte :
            les Centrafricains méritent un outil numérique à leur image pour trouver
            un emploi, recruter des talents et bâtir une économie prospère.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up-slow delay-750">
            <Link
              href="/emplois"
              className="btn-shine group inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-full font-semibold shadow-lg shadow-orange-500/30 transition-colors"
            >
              Voir les offres <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white/60 hover:bg-white/10 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
            >
              Rejoindre la communauté
            </Link>
          </div>
        </div>
      </section>

      {/* ── Chiffres clés ─────────────────────────────────────────────────── */}
      <section className="bg-orange-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {IMPACTS.map((item) => (
              <div key={item.label}>
                <p className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">{item.number}</p>
                <p className="text-orange-100 text-sm mt-1 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre histoire : texte + photo ────────────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="eyebrow">Notre histoire</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 leading-[1.1]">
              Pourquoi KTZ Emploi existe
            </h2>
            <div className="space-y-5 text-gray-600 text-base leading-relaxed">
              <p>
                Tout a commencé par une recherche d&apos;emploi. Comme des milliers de jeunes Centrafricains,{" "}
                <strong className="text-gray-900">Donald KITEZE</strong>{" "}s&apos;est mis à chercher des opportunités
                professionnelles en République Centrafricaine — avec une question simple en tête :{" "}
                <em>où postuler ?</em>
              </p>
              <p>
                La réponse a été décevante. Pas une seule plateforme ne permettait à un candidat
                de créer son profil, de consulter des offres fiables, de postuler en ligne ou d&apos;être
                visible auprès des employeurs. Les annonces se perdaient dans des groupes WhatsApp,
                des pages Facebook éphémères ou des bouches à oreille aléatoires.
                Le marché existait — mais l&apos;outil pour y accéder, lui, n&apos;existait pas.
              </p>
              <p>
                Ce vide n&apos;était pas une fatalité. C&apos;était une opportunité.{" "}
                Plutôt que d&apos;attendre qu&apos;une solution arrive de l&apos;extérieur,
                Donald a décidé de la construire lui-même — avec les réalités du terrain centrafricain
                comme boussole, et la conviction que{" "}
                <strong className="text-gray-900">les talents centrafricains méritent un espace numérique
                à leur mesure.</strong>
              </p>
              <p>
                KTZ Emploi est née de cette frustration transformée en action :
                une plateforme où les candidats peuvent enfin se connecter, créer leur profil,
                postuler, être vus — et où les recruteurs peuvent enfin trouver les talents
                qui les entourent sans le savoir.
              </p>
            </div>
          </div>
          <div className="relative max-w-md w-full mx-auto lg:max-w-none">
            <div data-photo className="aspect-[4/5] rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/etape-offres.jpg" alt="Jeune homme cherchant des offres d'emploi sur son ordinateur" loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="float-y absolute -bottom-5 -left-3 sm:-left-8 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 max-w-[16rem]">
              <span className="w-10 h-10 shrink-0 rounded-full bg-orange-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-orange-500" />
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-snug">« Où postuler ? »<span className="block text-xs font-normal text-gray-500">La question qui a tout déclenché</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le fondateur ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-20 sm:py-24 text-white">
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">

            {/* Photo de profil (centrée sur téléphone) */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3 self-center md:self-start">
              <div className="relative w-56 h-72 md:w-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-orange-500/40">
                <Image
                  src="/photo_profil.png"
                  alt="Donald KITEZE — Fondateur de KTZ Emploi"
                  fill
                  sizes="(max-width: 768px) 224px, 256px"
                  className="object-cover object-top"
                  quality={100}
                  priority
                />
              </div>
              <span className="text-xs text-gray-400 text-center">Fondateur</span>
            </div>

            {/* Contenu */}
            <div className="flex-1">
              <span className="eyebrow">Le fondateur</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-extrabold mb-2">Donald KITEZE</h2>
              <p className="text-orange-400 text-sm font-medium mb-7">
                Ingénieur en Microélectronique, Télécommunications & Réseaux · Entrepreneur — Bangui, RCA
              </p>

              {/* Citation */}
              <div className="relative mb-7 rounded-2xl bg-white/5 border border-white/10 p-6">
                <Quote className="h-8 w-8 text-orange-500/40 absolute -top-3 left-4" />
                <blockquote className="text-gray-200 text-base leading-relaxed italic">
                  J&apos;ai cherché des offres d&apos;emploi en RCA et je n&apos;ai trouvé aucune plateforme
                  qui permettait à un candidat de s&apos;inscrire, de créer son profil et de postuler
                  correctement. Tout était dispersé, informel, inaccessible.
                  Ce manque évident m&apos;a convaincu qu&apos;il fallait construire la solution
                  moi-même — plutôt qu&apos;attendre qu&apos;elle arrive d&apos;ailleurs.
                </blockquote>
              </div>

              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  Ingénieur en Microélectronique, Télécommunications et Réseaux, Donald KITEZE a choisi
                  de mettre ses compétences techniques au service d&apos;un problème réel qu&apos;il a lui-même
                  vécu. Entrepreneur dans l&apos;âme, plutôt que de développer des solutions pour d&apos;autres
                  marchés, il a décidé de partir d&apos;un constat local et d&apos;y apporter une réponse locale.
                </p>
                <p>
                  KTZ Emploi est le résultat de cette démarche : une plateforme pensée en RCA,
                  adaptée aux réalités du terrain centrafricain, conçue pour durer et pour grandir
                  avec la communauté qu&apos;elle sert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Le problème qu'on résout ──────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="eyebrow">Le problème que nous résolvons</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.1]">
              Le marché de l&apos;emploi centrafricain était cassé
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Quatre problèmes majeurs bloquaient l&apos;accès à l&apos;emploi en RCA avant KTZ Emploi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className="soft-card group relative rounded-3xl p-7 overflow-hidden">
                <span className="absolute top-5 right-6 font-display text-5xl font-extrabold text-gray-100 select-none transition-colors duration-300 group-hover:text-orange-100" aria-hidden="true">
                  0{i + 1}
                </span>
                <div className="relative w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="relative font-bold text-gray-900 text-lg mb-2">{p.title}</h3>
                <p className="relative text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre mission : deux cartes avec photo ────────────────────────── */}
      <section className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="eyebrow">Notre mission</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.1]">
              Ce que nous faisons concrètement
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {MISSIONS.map((m) => (
              <div key={m.title} className="soft-card group rounded-3xl p-3 pb-7">
                <div className="relative">
                  <div data-photo className="aspect-[16/9] rounded-3xl bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.img} alt={m.alt} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-white">
                    {m.title.startsWith("Pour les candidats") ? <Users className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                </div>
                <div className="px-4 pt-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{m.title}</h3>
                  <ul className="space-y-3">
                    {m.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mosaïque de photos : les talents centrafricains ───────────────── */}
      <section className="bg-white pb-20 sm:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="eyebrow">Les talents de la RCA</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.1]">Des talents dans tous les secteurs</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Des champs aux bureaux, des chantiers aux salles de classe : KTZ Emploi connecte chaque métier à ses opportunités.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 sm:gap-4 md:h-[560px]">
            {[
              { src: "/images/secteurs/agriculture.jpg", label: "Agriculture", alt: "Agriculteur au travail dans son champ", cls: "col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto" },
              { src: "/images/secteurs/btp.jpg", label: "BTP & Construction", alt: "Ouvriers casqués sur un toit", cls: "aspect-square md:aspect-auto" },
              { src: "/images/secteurs/education.jpg", label: "Éducation", alt: "Enseignant faisant cours", cls: "aspect-square md:aspect-auto" },
              { src: "/images/secteurs/commerce.jpg", label: "Commerce", alt: "Marché animé vu d'en haut", cls: "aspect-square md:aspect-auto" },
              { src: "/images/secteurs/banque.jpg", label: "Banque & Finance", alt: "Professionnel de la finance à son bureau", cls: "aspect-square md:aspect-auto" },
            ].map((t) => (
              <figure key={t.label} className={`group relative overflow-hidden rounded-3xl ${t.cls}`}>
                <div data-photo className="absolute inset-0 rounded-3xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.src} alt={t.alt} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <figcaption className="pointer-events-none absolute bottom-3 left-4 right-4 font-display font-bold text-white text-sm sm:text-base drop-shadow">
                  {t.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre vision : photo en parallaxe sous un voile sombre ─────────── */}
      <section className="relative overflow-hidden text-white py-20 sm:py-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-parallax src="/images/secteurs/communication.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/95 via-gray-900/90 to-orange-950/80" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="eyebrow">Notre vision</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold mb-5 leading-[1.05]">
              Devenir <span className="text-orange-400">LA référence</span>{" "}de l&apos;emploi en RCA
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-12">
              L&apos;ambition de KTZ Emploi est claire : être la plateforme incontournable,
              celle qu&apos;on cite en premier quand on parle d&apos;emploi en République Centrafricaine.
              Pas une option parmi d&apos;autres — <span className="text-orange-400 font-semibold">la référence</span>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VISION.map((v, i) => (
              <div key={v.title} className="relative rounded-3xl p-6 bg-white/[0.07] backdrop-blur-md border border-white/15 hover:bg-white/[0.12] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-full bg-orange-500 text-white font-display font-extrabold text-sm flex items-center justify-center">{i + 1}</span>
                  <p className="text-orange-300 text-xs font-bold uppercase tracking-[0.15em]">{v.title}</p>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm text-gray-400">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            Une ambition construite pas à pas, avec la communauté.
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ───────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="eyebrow">Nos valeurs</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.1]">Ce qui nous guide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="soft-card group rounded-3xl p-7 text-center">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final : photo en parallaxe sous un voile orange ──────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-parallax src="/images/conseils/secteurs-qui-recrutent.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/95 via-orange-500/90 to-orange-500/75" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-[1.05]">
            Rejoignez la communauté KTZ Emploi
          </h2>
          <p className="text-orange-50 text-lg mb-9 leading-relaxed">
            Que vous cherchiez un emploi ou que vous recrutiez, KTZ Emploi est la plateforme
            qu&apos;il vous faut pour réussir en République Centrafricaine.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inscription"
              className="btn-shine group inline-flex items-center justify-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-8 py-3.5 rounded-full font-bold shadow-lg shadow-black/10 transition-colors"
            >
              Créer un compte gratuit <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/emplois"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/70 hover:border-white hover:bg-white/10 text-white px-8 py-3.5 rounded-full font-bold transition-colors"
            >
              Voir les offres
            </Link>
          </div>
          <Link href="/conseils" className="mt-8 inline-flex items-center gap-2 text-sm text-orange-50 hover:text-white underline-offset-4 hover:underline">
            <BookOpen className="h-4 w-4" /> Lire nos conseils carrière
          </Link>
        </div>
      </section>
    </div>
  );
}
