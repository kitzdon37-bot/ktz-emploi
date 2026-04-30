import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Briefcase, Target, Lightbulb, Heart, Users, TrendingUp,
  MapPin, CheckCircle, ArrowRight, Globe, Shield, Zap, Quote,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Qui sommes-nous — KTZ Emploi",
  description:
    "Découvrez l'histoire de KTZ Emploi, fondée par Donald KITEZE. La première plateforme d'emploi dédiée à la République Centrafricaine. Notre mission : connecter les talents centrafricains aux meilleures opportunités.",
};

const PROBLEMS = [
  {
    icon: "📋",
    title: "Pas de plateforme dédiée",
    desc: "Avant KTZ Emploi, les offres d'emploi en RCA étaient dispersées sur des réseaux sociaux, des panneaux d'affichage ou transmises de bouche à oreille. Aucun outil centralisé n'existait.",
  },
  {
    icon: "🔍",
    title: "Candidats invisibles",
    desc: "Des milliers de Centrafricains diplômés et qualifiés n'avaient aucun moyen de se rendre visibles auprès des employeurs. Leur talent restait inexploité.",
  },
  {
    icon: "🏢",
    title: "Recrutement difficile pour les entreprises",
    desc: "Les entreprises, ONG et organisations internationales peinaient à trouver des profils locaux qualifiés, souvent contraintes de recruter à l'étranger.",
  },
  {
    icon: "📡",
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

export default function AProposPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-orange-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="h-3.5 w-3.5" />
            Bangui, République Centrafricaine
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            La plateforme d&apos;emploi
            <span className="block text-orange-400">née pour la RCA</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
            KTZ Emploi est née d&apos;un vécu personnel et d&apos;une conviction forte :
            les Centrafricains méritent un outil numérique à leur image pour trouver
            un emploi, recruter des talents et bâtir une économie prospère.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/emplois"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Voir les offres <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-6 py-3 rounded-full font-semibold transition-colors"
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
                <p className="text-3xl md:text-4xl font-extrabold">{item.number}</p>
                <p className="text-orange-100 text-sm mt-1 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre histoire ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-orange-600" />
          </div>
          <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Notre histoire</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
          Pourquoi KTZ Emploi existe
        </h2>
        <div className="space-y-5 text-gray-600 text-base leading-relaxed">
          <p>
            Tout a commencé par une recherche d&apos;emploi. Comme des milliers de jeunes Centrafricains,
            <strong className="text-gray-900"> Donald KITEZE</strong> s&apos;est mis à chercher des opportunités
            professionnelles en République Centrafricaine — avec une question simple en tête :
            <em> où postuler ?</em>
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
      </section>

      {/* ── Le fondateur ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-10 items-start">

            {/* Photo de profil */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="relative w-52 h-64 md:w-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-orange-500/40">
                <Image
                  src="/photo_profil.png"
                  alt="Donald KITEZE — Fondateur de KTZ Emploi"
                  fill
                  sizes="(max-width: 768px) 208px, 256px"
                  className="object-cover object-top"
                  quality={100}
                  priority
                />
              </div>
              <span className="text-xs text-gray-400 text-center">Fondateur</span>
            </div>

            {/* Contenu */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Le fondateur</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Donald KITEZE</h2>
              <p className="text-orange-400 text-sm font-medium mb-6">
                Développeur & Entrepreneur — Bangui, RCA
              </p>

              {/* Citation */}
              <div className="relative mb-6">
                <Quote className="h-8 w-8 text-orange-500/30 absolute -top-2 -left-1" />
                <blockquote className="pl-8 text-gray-300 text-base leading-relaxed italic">
                  J&apos;ai cherché des offres d&apos;emploi en RCA et je n&apos;ai trouvé aucune plateforme
                  qui permettait à un candidat de s&apos;inscrire, de créer son profil et de postuler
                  correctement. Tout était dispersé, informel, inaccessible.
                  Ce manque évident m&apos;a convaincu qu&apos;il fallait construire la solution
                  moi-même — plutôt qu&apos;attendre qu&apos;elle arrive d&apos;ailleurs.
                </blockquote>
              </div>

              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>
                  Formé en informatique, Donald KITEZE a choisi de mettre ses compétences techniques
                  au service d&apos;un problème réel qu&apos;il a lui-même vécu. Plutôt que de développer
                  des solutions pour d&apos;autres marchés, il a décidé de partir d&apos;un constat local
                  et d&apos;y apporter une réponse locale.
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
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <Lightbulb className="h-3.5 w-3.5" />
              Le problème que nous résolvons
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Le marché de l&apos;emploi centrafricain était cassé
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Quatre problèmes majeurs bloquaient l&apos;accès à l&apos;emploi en RCA avant KTZ Emploi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notre mission ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Notre mission</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
          Ce que nous faisons concrètement
        </h2>
        <div className="space-y-4">
          {[
            {
              title: "Pour les candidats",
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
              items: [
                "Publier des offres d'emploi et les diffuser à des milliers de candidats",
                "Accéder à une CVthèque de talents centrafricains qualifiés",
                "Gérer les candidatures avec des outils modernes (pipeline, notes, statuts)",
                "Contacter les candidats par email ou WhatsApp directement depuis la plateforme",
                "Renforcer leur marque employeur avec un profil entreprise dédié",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Notre vision ─────────────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Notre vision</span>
          </div>
          <h2 className="text-3xl font-extrabold mb-4 leading-tight">
            Devenir LA référence de l&apos;emploi en RCA
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            L&apos;ambition de KTZ Emploi est claire : être la plateforme incontournable,
            celle qu&apos;on cite en premier quand on parle d&apos;emploi en République Centrafricaine.
            Pas une option parmi d&apos;autres — <span className="text-orange-400 font-semibold">la référence</span>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
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
            ].map((v) => (
              <div key={v.title} className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">{v.title}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nos valeurs ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Heart className="h-3.5 w-3.5" />
            Nos valeurs
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Ce qui nous guide</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:border-orange-100 hover:shadow-sm transition-all">
              <div className={`w-12 h-12 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Rejoignez la communauté KTZ Emploi
          </h2>
          <p className="text-orange-100 text-lg mb-8 leading-relaxed">
            Que vous cherchiez un emploi ou que vous recrutiez, KTZ Emploi est la plateforme
            qu&apos;il vous faut pour réussir en République Centrafricaine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inscription"
              className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-8 py-3.5 rounded-full font-bold transition-colors"
            >
              Créer un compte gratuit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/emplois"
              className="inline-flex items-center gap-2 border-2 border-white/40 hover:border-white text-white px-8 py-3.5 rounded-full font-bold transition-colors"
            >
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
