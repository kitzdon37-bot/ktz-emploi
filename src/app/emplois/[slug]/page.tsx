import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { MapPin, Clock, Briefcase, Banknote, Users, Calendar, ExternalLink, Building2, CheckCircle, Star } from "lucide-react";
import { formatSalary, formatDate, timeAgo, APPLICATION_STATUSES } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ApplyButton from "./ApplyButton";
import ReportButton from "./ReportButton";
import CompanyLogo from "@/components/CompanyLogo";
import ShareButtons from "./ShareButtons";
import CompanyPopup from "./CompanyPopup";
import ContactRecruiter from "./ContactRecruiter";

const BASE_URL = "https://ktzemploi.cf";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getJob(slug: string) {
  const job = await prisma.job.findUnique({
    where: { slug, published: true },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });
  return job;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};

  const description = job.description.slice(0, 160).replace(/\s+/g, " ").trim();

  return {
    title: `${job.title} – ${job.company.name} | KTZ Emploi`,
    description,
    openGraph: {
      title: `${job.title} – ${job.company.name}`,
      description,
      url: `${BASE_URL}/emplois/${job.slug}`,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  // Increment view count
  await prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } });

  const session = await getServerSession(authOptions);
  let hasApplied = false;
  let applicationStatus = "";

  let profileCvUrl = "";
  if (session?.user) {
    const userId = (session.user as { id?: string }).id;
    if (userId) {
      const app = await prisma.application.findUnique({
        where: { jobId_userId: { jobId: job.id, userId } },
      });
      hasApplied = !!app;
      applicationStatus = app?.status || "";

      // Récupérer le CV du profil candidat
      const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId }, select: { cv: true } });
      profileCvUrl = profile?.cv || "";
    }
  }

  // Get similar jobs
  const similar = await prisma.job.findMany({
    where: {
      published: true,
      category: job.category,
      id: { not: job.id },
    },
    include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const companyInitials = job.company.name.slice(0, 2).toUpperCase();

  // JSON-LD JobPosting (schema.org)
  const jobPostingSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    ...(job.deadline && { validThrough: job.deadline.toISOString() }),
    employmentType: job.type,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
      ...(job.company.logo && { logo: job.company.logo }),
      ...(job.company.website && { sameAs: job.company.website }),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.remote ? "Télétravail" : job.location,
        addressCountry: "CF",
      },
    },
    ...(job.remote && { jobLocationType: "TELECOMMUTE" }),
    ...(job.salaryMin && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salaryCurrency,
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryMin,
          ...(job.salaryMax && { maxValue: job.salaryMax }),
          unitText: "MONTH",
        },
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />

      {/* Popup entreprise — apparaît automatiquement */}
      <CompanyPopup
        company={{
          name: job.company.name,
          slug: job.company.slug,
          logo: job.company.logo,
          description: job.company.description,
          sector: job.company.sector,
          size: job.company.size,
          location: job.company.location,
          website: job.company.website,
          phone: job.company.phone,
          email: job.company.email,
          verified: job.company.verified,
          superRecruiter: job.company.superRecruiter,
          allowContact: job.company.allowContact,
        }}
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1">
          {/* Job header */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">

            {/* Bannière */}
            {job.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.coverImage}
                alt={`Bannière — ${job.title}`}
                className="w-full h-48 sm:h-60 object-cover"
              />
            )}

            <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center border border-orange-50 font-bold text-orange-600 text-xl flex-shrink-0">
                {job.company.logo ? (
                  <CompanyLogo src={job.company.logo} alt={job.company.name} initials={companyInitials} className="rounded-2xl" />
                ) : companyInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Link href={`/entreprises/${job.company.slug}`} className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                    {job.company.name}
                  </Link>
                  {job.company.verified && (
                    <span className="flex items-center gap-0.5 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                      <CheckCircle className="h-3 w-3" /> Vérifié
                    </span>
                  )}
                  {job.company.superRecruiter && (
                    <span className="flex items-center gap-0.5 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200 font-medium">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> Super Recruteur
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              </div>
              {job.featured && (
                <span className="text-xs bg-yellow-50 text-yellow-700 font-medium px-2 py-1 rounded-full border border-yellow-200">
                  ⭐ À la une
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-sm mb-5">
              <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <Briefcase className="h-4 w-4 text-orange-500" />
                {job.type}
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4 text-orange-500" />
                {job.remote ? "Télétravail" : job.location}
              </span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Banknote className="h-4 w-4 text-orange-500" />
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </span>
              )}
              {job.experienceLevel && (
                <span className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4 text-orange-500" />
                  {job.experienceLevel}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-gray-500 ml-auto text-xs">
                <Clock className="h-3.5 w-3.5" />
                Publié {timeAgo(job.createdAt)}
              </span>
            </div>

            {/* Apply button */}
            <ApplyButton
              jobId={job.id}
              hasApplied={hasApplied}
              applicationStatus={applicationStatus}
              isLoggedIn={!!session}
              userRole={(session?.user as { role?: string })?.role}
              profileCvUrl={profileCvUrl}
            />

            {/* Share buttons */}
            <ShareButtons title={job.title} slug={job.slug} />
            </div>{/* fin p-6 */}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Description du poste</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profil recherché</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Avantages</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.benefits}
              </div>
            </div>
          )}

          <ReportButton jobId={job.id} />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Company card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">À propos de l&apos;entreprise</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-orange-600 overflow-hidden">
                {job.company.logo ? (
                  <CompanyLogo src={job.company.logo} alt={job.company.name} initials={companyInitials} className="p-1" />
                ) : companyInitials}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link href={`/entreprises/${job.company.slug}`} className="font-medium text-gray-900 hover:text-orange-500">
                    {job.company.name}
                  </Link>
                  {job.company.verified && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">✓</span>
                  )}
                  {job.company.superRecruiter && (
                    <span className="flex items-center gap-0.5 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200 font-medium">
                      <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> Super Recruteur
                    </span>
                  )}
                </div>
                {job.company.sector && (
                  <p className="text-xs text-gray-500">{job.company.sector}</p>
                )}
              </div>
            </div>

            {job.company.description && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">{job.company.description}</p>
            )}

            <div className="space-y-1.5 text-sm text-gray-500">
              {job.company.size && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  {job.company.size}
                </div>
              )}
              {job.company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {job.company.location}
                </div>
              )}
              {job.company.website && (
                <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-orange-500 hover:underline">
                  <ExternalLink className="h-4 w-4" />
                  Site web
                </a>
              )}
            </div>

            <Link
              href={`/entreprises/${job.company.slug}`}
              className="block mt-4 text-center text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-100 rounded-lg py-2 hover:bg-orange-50 transition-colors"
            >
              Voir toutes leurs offres
            </Link>
          </div>

          {/* Job summary */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Résumé de l&apos;offre</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Publié le</span>
                <span className="text-gray-700 font-medium">{formatDate(job.createdAt)}</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Clôture</span>
                  <span className="text-gray-700 font-medium text-orange-500">{formatDate(job.deadline)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Secteur</span>
                <span className="text-gray-700 font-medium">{job.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Candidatures</span>
                <span className="text-gray-700 font-medium">{job._count.applications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vues</span>
                <span className="text-gray-700 font-medium">{job.views}</span>
              </div>
            </div>
          </div>

          {/* Contacter le recruteur — uniquement si le recruteur l'a autorisé */}
          {job.company.allowContact && (
            <ContactRecruiter
              companyName={job.company.name}
              phone={job.company.phone}
              email={job.company.email}
            />
          )}

          {/* Similar jobs */}
          {similar.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Offres similaires</h3>
              <div className="space-y-3">
                {similar.map((sj) => (
                  <Link key={sj.id} href={`/emplois/${sj.slug}`} className="block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{sj.title}</p>
                    <p className="text-xs text-gray-500">{sj.company.name} · {sj.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
