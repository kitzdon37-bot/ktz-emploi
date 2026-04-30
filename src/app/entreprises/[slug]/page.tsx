import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  MapPin, Globe, Phone, Mail, Users, CheckCircle, Star,
  Briefcase, ArrowRight, Building2, ExternalLink,
} from "lucide-react";
import JobCard from "@/components/JobCard";
import CompanyLogo from "@/components/CompanyLogo";
import CompanyReportButton from "./ReportButton";
import ReviewModal from "./ReviewModal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    select: { name: true, description: true, sector: true },
  });
  if (!company) return {};

  const description = company.description
    ? company.description.slice(0, 160).replace(/\s+/g, " ").trim()
    : company.sector
    ? `Découvrez ${company.name}, entreprise du secteur ${company.sector} sur KTZ Emploi.`
    : `Découvrez les offres d'emploi de ${company.name} sur KTZ Emploi.`;

  return {
    title: `${company.name} - KTZ Emploi`,
    description,
    icons: company.logo
      ? { icon: company.logo, apple: company.logo }
      : undefined,
    openGraph: {
      title: `${company.name} - KTZ Emploi`,
      description,
    },
  };
}

export default async function EntrepriseDetailPage({ params }: Props) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { published: true },
        include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  const reviews = await prisma.companyReview.findMany({
    where: { companyId: company.id, status: "APPROVED" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── BANNIÈRE + LOGO ── */}
      <div className="relative">
        {/* Bannière */}
        <div className="h-52 w-full overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500">
          {company.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.banner} alt="Bannière" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Logo flottant */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-14 mb-4 inline-block">
            <div className="w-36 h-36 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center font-bold text-orange-600 text-3xl overflow-hidden">
              {company.logo ? (
                <CompanyLogo src={company.logo} alt={company.name} initials="" className="p-1" />
              ) : (
                <Building2 className="h-12 w-12 text-orange-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── INFOS PRINCIPALES ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 -mt-2">
          {/* Nom + badges */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                {company.verified && (
                  <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> Vérifié
                  </span>
                )}
                {company.superRecruiter && (
                  <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-200 font-medium">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> Super Recruteur
                  </span>
                )}
              </div>
              {company.sector && (
                <p className="text-gray-500">{company.sector}</p>
              )}
            </div>

            {/* Lien site web */}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-colors flex-shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                Site web
              </a>
            )}
          </div>

          {/* Barre d'infos rapides */}
          <div className="flex flex-wrap gap-5 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-600">
            {company.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-400" />
                {company.location}
              </span>
            )}
            {company.size && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-400" />
                {company.size}
              </span>
            )}
            {company.email && (
              <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                <Mail className="h-4 w-4 text-orange-400" />
                {company.email}
              </a>
            )}
            {company.phone && (
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-400" />
                {company.phone}
              </span>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                <Globe className="h-4 w-4 text-orange-400" />
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-2 ml-auto text-orange-600 font-semibold">
              <Briefcase className="h-4 w-4" />
              {company.jobs.length} offre{company.jobs.length !== 1 ? "s" : ""} active{company.jobs.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── CORPS PRINCIPAL ── */}
        <div className="flex flex-col lg:flex-row gap-6 pb-12">

          {/* Colonne gauche — description */}
          <div className="flex-1 space-y-6">

            {/* À propos */}
            {company.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  À propos de {company.name}
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                  {company.description}
                </p>
              </div>
            )}

            {/* Vidéo de présentation */}
            {company.videoUrl && (() => {
              const ytMatch = company.videoUrl.match(
                /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
              );
              const videoId = ytMatch?.[1];
              return (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Vidéo de présentation</h2>
                  {videoId ? (
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="Vidéo de présentation"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full rounded-xl"
                      />
                    </div>
                  ) : (
                    <a
                      href={company.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-orange-500 hover:underline text-sm font-medium"
                    >
                      Voir la vidéo de présentation
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Avis */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Avis des employés</h2>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(avgRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({reviews.length} avis)</span>
                    </div>
                  )}
                </div>
                <ReviewModal companySlug={slug} />
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {review.anonymous ? "Employé anonyme" : (review.user.name || "Utilisateur")}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.pros && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="text-green-600 font-medium">+ </span>
                          {review.pros}
                        </p>
                      )}
                      {review.cons && (
                        <p className="text-sm text-gray-600">
                          <span className="text-red-400 font-medium">- </span>
                          {review.cons}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Star className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">Aucun avis pour le moment.</p>
                  <p className="text-xs mt-1">Soyez le premier à donner votre avis !</p>
                </div>
              )}
            </div>

            {/* Chiffres clés */}
            {(company.size || company.location || company.sector) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Informations clés</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {company.sector && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Secteur</dt>
                        <dd className="text-sm font-semibold text-gray-800 mt-0.5">{company.sector}</dd>
                      </div>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Taille</dt>
                        <dd className="text-sm font-semibold text-gray-800 mt-0.5">{company.size}</dd>
                      </div>
                    </div>
                  )}
                  {company.location && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Localisation</dt>
                        <dd className="text-sm font-semibold text-gray-800 mt-0.5">{company.location}</dd>
                      </div>
                    </div>
                  )}
                  {company.website && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <dt className="text-xs text-gray-400 font-medium uppercase tracking-wide">Site web</dt>
                        <a href={company.website} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-semibold text-orange-500 hover:underline mt-0.5 block truncate">
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Offres d'emploi */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Offres d&apos;emploi
                  <span className="ml-2 text-sm font-normal text-gray-400">({company.jobs.length})</span>
                </h2>
                <Link href="/emplois" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">
                  Toutes les offres <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {company.jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {company.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                  <Briefcase className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-medium text-gray-500">Aucune offre active pour le moment</p>
                  <Link href="/emplois" className="text-orange-500 text-sm hover:underline mt-2 inline-block">
                    Voir d&apos;autres offres
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite — sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-5">

            {/* Carte identité rapide */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">Fiche entreprise</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Offres actives</span>
                  <span className="font-bold text-orange-500">{company.jobs.length}</span>
                </div>
                {company.sector && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Secteur</span>
                    <span className="font-medium text-gray-700 text-right max-w-[140px]">{company.sector}</span>
                  </div>
                )}
                {company.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Effectif</span>
                    <span className="font-medium text-gray-700">{company.size}</span>
                  </div>
                )}
                {company.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ville</span>
                    <span className="font-medium text-gray-700">{company.location}</span>
                  </div>
                )}
                {company.verified && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 text-xs font-medium">Entreprise vérifiée</span>
                  </div>
                )}
                {company.superRecruiter && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-yellow-700 text-xs font-medium">Super Recruteur</span>
                  </div>
                )}
              </div>
            </div>

            {/* Report */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <CompanyReportButton companyId={company.id} />
            </div>

            {/* Contact */}
            {(company.email || company.phone || company.website) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide text-gray-500">Contact</h3>
                <div className="space-y-3">
                  {company.email && (
                    <a href={`mailto:${company.email}`}
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                        <Mail className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                      </div>
                      <span className="truncate">{company.email}</span>
                    </a>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-600 hover:text-orange-500 transition-colors group">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                        <Globe className="h-4 w-4 text-gray-400 group-hover:text-orange-500" />
                      </div>
                      <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
