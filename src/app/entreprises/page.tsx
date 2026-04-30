import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, MapPin, Briefcase, Search, Star, Phone, Mail, Globe, BookOpen } from "lucide-react";
import CompanyLogo from "@/components/CompanyLogo";
import { ANNUAIRE_RCA, SECTEURS_ANNUAIRE } from "@/lib/annuaire-rca";
import SecteurBanner from "./SecteurBanner";

interface Props {
  searchParams: Promise<{ q?: string; sector?: string }>;
}

async function getCompanies(params: Awaited<Props["searchParams"]>) {
  const where: Record<string, unknown> = { suspended: false };
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

const SECTOR_COLORS: Record<string, string> = {
  "Banque & Finance":         "bg-blue-100 text-blue-700",
  "Assurances":               "bg-indigo-100 text-indigo-700",
  "Télécommunications":       "bg-cyan-100 text-cyan-700",
  "Informatique & Télécoms":  "bg-violet-100 text-violet-700",
  "BTP & Construction":       "bg-amber-100 text-amber-700",
  "Transport & Logistique":   "bg-orange-100 text-orange-700",
  "Santé":                    "bg-rose-100 text-rose-700",
  "Éducation & Formation":    "bg-emerald-100 text-emerald-700",
  "Industrie":                "bg-gray-100 text-gray-700",
  "Hôtellerie & Tourisme":    "bg-teal-100 text-teal-700",
};

export default async function EntreprisesPage({ searchParams }: Props) {
  const params = await searchParams;
  const companies = await getCompanies(params);

  // Filtrer le répertoire selon les mêmes critères
  const annuaireFiltered = ANNUAIRE_RCA.filter((e) => {
    const q = params.q?.toLowerCase() ?? "";
    const matchQ = !q || [e.nom, e.description, e.secteur].join(" ").toLowerCase().includes(q);
    const matchSector = !params.sector || e.secteur.toLowerCase().includes(params.sector.toLowerCase());
    return matchQ && matchSector;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Entreprises en Centrafrique</h1>
        <p className="text-gray-500 mt-1">
          {companies.length} entreprise{companies.length !== 1 ? "s" : ""} inscrite{companies.length !== 1 ? "s" : ""} ·{" "}
          {ANNUAIRE_RCA.length} référencées dans l&apos;annuaire national
        </p>
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
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          name="sector"
          defaultValue={params.sector}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="">Tous les secteurs</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          Filtrer
        </button>
      </form>

      {/* ── Entreprises inscrites sur KTZ Emploi ── */}
      {companies.length > 0 && (
        <div className="mb-6">
          <SecteurBanner
            secteur="Entreprises qui recrutent en Centrafrique"
            count={companies.length}
            customIcon="🚀"
            customGradient="from-orange-500 to-rose-600"
            customText="text-orange-100"
            label={`${companies.length} entreprise${companies.length > 1 ? "s" : ""} active${companies.length > 1 ? "s" : ""} sur KTZ Emploi`}
          />
        </div>
      )}

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => {
            const initials = company.name.slice(0, 2).toUpperCase();
            return (
              <Link
                key={company.id}
                href={`/entreprises/${company.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-orange-100 transition-all"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center font-bold text-orange-600 text-xl border border-orange-50 flex-shrink-0">
                    {company.logo ? (
                      <CompanyLogo src={company.logo} alt={company.name} initials={initials} className="rounded-2xl" />
                    ) : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                      {company.verified && (
                        <span className="text-xs text-blue-600">✓</span>
                      )}
                      {company.superRecruiter && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200 font-medium">
                          <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> Super Recruteur
                        </span>
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
                  <span className="flex items-center gap-1 text-orange-500 font-medium ml-auto">
                    <Briefcase className="h-3 w-3" />
                    {company._count.jobs} offre{company._count.jobs !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        !params.q && !params.sector && (
          <div className="text-center py-10 bg-orange-50 rounded-2xl mb-8">
            <Building2 className="h-10 w-10 mx-auto mb-3 text-orange-300" />
            <p className="font-semibold text-gray-700">Aucune entreprise inscrite pour l&apos;instant</p>
            <p className="text-sm text-gray-500 mt-1">Consultez le répertoire national ci-dessous</p>
          </div>
        )
      )}

      {/* ── Répertoire national ── */}
      {annuaireFiltered.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Répertoire des entreprises de RCA
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Source : Annuaire Beafrika · {annuaireFiltered.length} entreprise{annuaireFiltered.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Grille par secteur */}
          {SECTEURS_ANNUAIRE.filter((s) =>
            annuaireFiltered.some((e) => e.secteur === s)
          ).map((secteur) => {
            const count = annuaireFiltered.filter((e) => e.secteur === secteur).length;
            return (
            <div key={secteur} className="mb-12">
              <SecteurBanner secteur={secteur} count={count} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {annuaireFiltered
                  .filter((e) => e.secteur === secteur)
                  .map((e) => {
                    const initiales = e.nom.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                    const colorClass = SECTOR_COLORS[e.secteur] ?? "bg-gray-100 text-gray-600";
                    return (
                      <div
                        key={e.nom}
                        className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col gap-4"
                      >
                        {/* Avatar + nom */}
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl flex-shrink-0 shadow-sm ${colorClass}`}>
                            {initiales}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-base leading-snug">{e.nom}</p>
                            <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${colorClass}`}>
                              {e.secteur}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {e.description && (
                          <p className="text-sm text-gray-600 leading-relaxed">{e.description}</p>
                        )}

                        {/* Contacts */}
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          {e.localisation && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <MapPin className="h-4 w-4 text-orange-400 flex-shrink-0" />
                              <span>{e.localisation}</span>
                            </div>
                          )}
                          {e.telephone && (
                            <a href={`tel:${e.telephone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600 font-medium transition-colors">
                              <Phone className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              {e.telephone}
                            </a>
                          )}
                          {e.email && (
                            <a href={`mailto:${e.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-orange-500 transition-colors truncate">
                              <Mail className="h-4 w-4 text-orange-400 flex-shrink-0" />
                              {e.email}
                            </a>
                          )}
                          {e.site && (
                            <a href={e.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium hover:underline truncate">
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              {e.site.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}

              </div>
            </div>
            );
          })}

          {annuaireFiltered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p>Aucune entreprise dans le répertoire pour cette recherche</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

