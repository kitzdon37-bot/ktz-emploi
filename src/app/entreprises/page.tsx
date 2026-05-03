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
      { name: { contains: params.q, mode: 'insensitive' } },
      { description: { contains: params.q, mode: 'insensitive' } },
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
  "Banque & Finance":         "from-blue-600 to-blue-800",
  "Assurances":               "from-indigo-600 to-indigo-800",
  "Télécommunications":       "from-cyan-500 to-cyan-700",
  "Informatique & Télécoms":  "from-violet-600 to-violet-800",
  "BTP & Construction":       "from-amber-500 to-amber-700",
  "Transport & Logistique":   "from-orange-500 to-orange-700",
  "Santé":                    "from-rose-500 to-rose-700",
  "Médecine & Santé":         "from-rose-500 to-rose-700",
  "Éducation & Formation":    "from-emerald-500 to-emerald-700",
  "Industrie":                "from-gray-600 to-gray-800",
  "Hôtellerie & Tourisme":    "from-teal-500 to-teal-700",
  "Humanitaire & ONG":        "from-green-600 to-green-800",
  "ONG / Humanitaire":        "from-green-600 to-green-800",
  "Agriculture & Élevage":    "from-lime-600 to-lime-800",
  "Journalisme & Médias":     "from-purple-500 to-purple-700",
  "Énergie & Mines":          "from-yellow-600 to-yellow-800",
  "Commerce & Vente":         "from-red-500 to-red-700",
};

const SECTOR_ICONS: Record<string, string> = {
  "Banque & Finance":         "🏦",
  "Assurances":               "🛡️",
  "Télécommunications":       "📡",
  "Informatique & Télécoms":  "💻",
  "BTP & Construction":       "🏗️",
  "Transport & Logistique":   "🚚",
  "Santé":                    "🏥",
  "Médecine & Santé":         "🏥",
  "Éducation & Formation":    "📚",
  "Industrie":                "🏭",
  "Hôtellerie & Tourisme":    "🏨",
  "Humanitaire & ONG":        "🤝",
  "ONG / Humanitaire":        "🤝",
  "Agriculture & Élevage":    "🌾",
  "Journalisme & Médias":     "📰",
  "Énergie & Mines":          "⚡",
  "Commerce & Vente":         "🛒",
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
            const sectorColor = SECTOR_COLORS[company.sector ?? ""] ?? "from-orange-500 to-amber-500";
            const sectorIcon = SECTOR_ICONS[company.sector ?? ""] ?? "🏢";
            return (
              <Link
                key={company.id}
                href={`/entreprises/${company.slug}`}
                className="bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all overflow-hidden group"
              >
                {/* Mini-bannière colorée */}
                <div className={`relative h-20 bg-gradient-to-r ${sectorColor} overflow-hidden`}>
                  {/* Cercles déco */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                  <div className="absolute -bottom-3 left-8 w-12 h-12 rounded-full bg-white/10" />
                  {/* Icône secteur */}
                  <div className="absolute top-3 right-4 text-2xl opacity-60">{sectorIcon}</div>
                  {/* Logo flottant */}
                  <div className="absolute -bottom-5 left-4 w-14 h-14 rounded-xl bg-white shadow-md border-2 border-white flex items-center justify-center font-bold text-orange-600 text-lg overflow-hidden z-10">
                    {company.logo ? (
                      <CompanyLogo src={company.logo} alt={company.name} initials={initials} className="rounded-xl" />
                    ) : (
                      <span className="text-base font-extrabold" style={{ color: "inherit" }}>{initials}</span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="pt-8 px-4 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <h3 className="font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">{company.name}</h3>
                      {company.verified && (
                        <span className="text-xs text-blue-500 font-bold flex-shrink-0">✓</span>
                      )}
                    </div>
                    {company.superRecruiter && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-200 font-medium flex-shrink-0">
                        <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" /> Top
                      </span>
                    )}
                  </div>
                  {company.sector && <p className="text-xs text-gray-400 mb-2">{company.sector}</p>}

                  {company.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{company.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                    {company.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.location}
                      </span>
                    ) : <span />}
                    <span className="flex items-center gap-1 text-orange-500 font-semibold">
                      <Briefcase className="h-3 w-3" />
                      {company._count.jobs} offre{company._count.jobs !== 1 ? "s" : ""}
                    </span>
                  </div>
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

