import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MapPin, Briefcase, Search } from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string; sector?: string }>;
}

async function getCompanies(params: Awaited<Props["searchParams"]>) {
  const where: Record<string, unknown> = {};
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }
  if (params.sector) where.sector = params.sector;

  return prisma.company.findMany({
    where,
    include: {
      _count: {
        select: { jobs: { where: { published: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

const SECTORS = [
  "ONG / Humanitaire", "Santé", "Finance", "Éducation",
  "Gouvernement", "Industrie", "Commerce", "Télécoms", "Autre",
];

export default async function EntreprisesPage({ searchParams }: Props) {
  const params = await searchParams;
  const companies = await getCompanies(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Entreprises qui recrutent</h1>
        <p className="text-gray-500 mt-1">{companies.length} entreprise{companies.length !== 1 ? "s" : ""} inscrite{companies.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <form action="/entreprises" method="GET" className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Rechercher une entreprise..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
        <select
          name="sector"
          defaultValue={params.sector}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
        >
          <option value="">Tous les secteurs</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Filtrer
        </button>
      </form>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => {
            const initials = company.name.slice(0, 2).toUpperCase();
            return (
              <Link
                key={company.id}
                href={`/entreprises/${company.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-red-100 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-bold text-red-700 text-lg border border-orange-50 flex-shrink-0">
                    {company.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-2xl" />
                    ) : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                      {company.verified && (
                        <span className="text-xs text-blue-600">✓</span>
                      )}
                    </div>
                    {company.sector && <p className="text-xs text-gray-500 mt-0.5">{company.sector}</p>}
                  </div>
                </div>

                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{company.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {company.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {company.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-red-600 font-medium ml-auto">
                    <Briefcase className="h-3 w-3" />
                    {company._count.jobs} offre{company._count.jobs !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Building2 className="h-14 w-14 mx-auto mb-4 text-gray-200" />
          <p className="text-xl font-semibold text-gray-700">Aucune entreprise trouvée</p>
          <Link href="/entreprises" className="text-red-600 text-sm hover:underline mt-2 inline-block">
            Voir toutes les entreprises
          </Link>
        </div>
      )}
    </div>
  );
}
