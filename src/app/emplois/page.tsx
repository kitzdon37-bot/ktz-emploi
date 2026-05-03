import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import { JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS, RCA_LOCATIONS } from "@/lib/utils";
import { Search, MapPin, Filter, Briefcase } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    type?: string;
    experience?: string;
    remote?: string;
    featured?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 20;

async function getJobs(params: Awaited<Props["searchParams"]>) {
  const page = parseInt(params.page || "1");
  const skip = (page - 1) * PAGE_SIZE;

  const where: Record<string, unknown> = { published: true, company: { suspended: false } };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
      { company: { name: { contains: params.q, mode: 'insensitive' } } },
    ];
  }
  if (params.location) where.location = { contains: params.location, mode: 'insensitive' };
  if (params.category) where.category = params.category;
  if (params.type) where.type = params.type;
  if (params.experience) where.experienceLevel = params.experience;
  if (params.remote === "true") where.remote = true;
  if (params.featured === "true") where.featured = true;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { name: true, logo: true, verified: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE,
      skip,
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, pages: Math.ceil(total / PAGE_SIZE) };
}

export default async function EmploisPage({ searchParams }: Props) {
  const params = await searchParams;
  const { jobs, total, page, pages } = await getJobs(params);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...params, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return `/emplois?${p.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Offres d&apos;emploi en RCA</h1>
        <p className="text-gray-500 mt-1">
          {total} offre{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
          {params.q && <span className="text-orange-500"> pour &quot;{params.q}&quot;</span>}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <form action="/emplois" method="GET" className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtres
            </h2>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q}
                  placeholder="Mot-clé..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  name="location"
                  defaultValue={params.location}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none bg-white"
                >
                  <option value="">Toute la RCA</option>
                  {RCA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Secteur</label>
              <select
                name="category"
                defaultValue={params.category}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Tous les secteurs</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Contract type */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Type de contrat</label>
              <select
                name="type"
                defaultValue={params.type}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Tous les contrats</option>
                {JOB_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Expérience</label>
              <select
                name="experience"
                defaultValue={params.experience}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Tous niveaux</option>
                {EXPERIENCE_LEVELS.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Remote */}
            <div className="mb-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="remote"
                  value="true"
                  defaultChecked={params.remote === "true"}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="text-sm text-gray-700">Télétravail uniquement</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Filtrer
              </button>
              <Link
                href="/emplois"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Reset
              </Link>
            </div>
          </form>
        </aside>

        {/* Jobs list */}
        <div className="flex-1">
          {jobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      ← Précédent
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={buildUrl({ page: String(p) })}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        p === page
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < pages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Suivant →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <Briefcase className="h-14 w-14 mx-auto mb-4 text-gray-200" />
              <p className="text-xl font-semibold text-gray-700">Aucune offre trouvée</p>
              <p className="text-sm mt-2">Modifiez vos critères de recherche ou{" "}
                <Link href="/emplois" className="text-orange-500 hover:underline">réinitialisez les filtres</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

