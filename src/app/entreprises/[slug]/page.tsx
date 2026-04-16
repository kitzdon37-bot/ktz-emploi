import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe, Phone, Mail, Users, CheckCircle } from "lucide-react";
import JobCard from "@/components/JobCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EntrepriseDetailPage({ params }: Props) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { published: true },
        include: { company: { select: { name: true, logo: true, verified: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Company header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-bold text-orange-600 text-2xl border border-orange-50 flex-shrink-0">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-2xl" />
            ) : initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.verified && (
                <span className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  <CheckCircle className="h-3.5 w-3.5" /> Entreprise vérifiée
                </span>
              )}
            </div>
            {company.sector && <p className="text-gray-500 mt-1">{company.sector}</p>}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
              {company.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {company.location}
                </span>
              )}
              {company.size && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  {company.size}
                </span>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-orange-500 hover:underline">
                  <Globe className="h-4 w-4" />
                  Site web
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`}
                  className="flex items-center gap-1.5 text-orange-500 hover:underline">
                  <Mail className="h-4 w-4" />
                  {company.email}
                </a>
              )}
              {company.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {company.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {company.description && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-2">À propos</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{company.description}</p>
          </div>
        )}
      </div>

      {/* Jobs */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Offres d&apos;emploi ({company.jobs.length})
        </h2>
        {company.jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200">
            <p>Aucune offre active pour le moment</p>
            <Link href="/emplois" className="text-orange-500 text-sm hover:underline mt-2 inline-block">
              Voir d&apos;autres offres
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
