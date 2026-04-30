import { TrendingUp, DollarSign } from "lucide-react";

interface SalaryEntry {
  sector: string;
  poste: string;
  min: number;
  max: number;
  currency: string;
}

const SALAIRES: SalaryEntry[] = [
  { sector: "Banque & Finance", poste: "Comptable", min: 150000, max: 400000, currency: "XAF" },
  { sector: "Banque & Finance", poste: "Directeur financier", min: 500000, max: 1200000, currency: "XAF" },
  { sector: "Informatique", poste: "Développeur web", min: 200000, max: 600000, currency: "XAF" },
  { sector: "Informatique", poste: "Responsable IT", min: 400000, max: 900000, currency: "XAF" },
  { sector: "Santé", poste: "Médecin", min: 300000, max: 800000, currency: "XAF" },
  { sector: "Santé", poste: "Infirmier", min: 100000, max: 250000, currency: "XAF" },
  { sector: "Éducation", poste: "Enseignant", min: 80000, max: 200000, currency: "XAF" },
  { sector: "Éducation", poste: "Directeur d'école", min: 200000, max: 450000, currency: "XAF" },
  { sector: "BTP", poste: "Ingénieur civil", min: 250000, max: 650000, currency: "XAF" },
  { sector: "BTP", poste: "Technicien", min: 120000, max: 300000, currency: "XAF" },
  { sector: "Commerce", poste: "Commercial", min: 100000, max: 350000, currency: "XAF" },
  { sector: "Commerce", poste: "Directeur commercial", min: 400000, max: 900000, currency: "XAF" },
  { sector: "Logistique", poste: "Logisticien", min: 150000, max: 380000, currency: "XAF" },
  { sector: "Logistique", poste: "Responsable supply chain", min: 350000, max: 750000, currency: "XAF" },
  { sector: "ONG / Humanitaire", poste: "Chargé de projet", min: 200000, max: 600000, currency: "XAF" },
  { sector: "ONG / Humanitaire", poste: "Coordinateur", min: 400000, max: 1000000, currency: "XAF" },
  { sector: "Administration", poste: "Secrétaire", min: 80000, max: 180000, currency: "XAF" },
  { sector: "Administration", poste: "Directeur administratif", min: 350000, max: 800000, currency: "XAF" },
];

function formatXAF(n: number): string {
  return n.toLocaleString("fr-FR") + " XAF";
}

// Group by sector
const GLOBAL_MAX = Math.max(...SALAIRES.map((s) => s.max));

function groupBySector(data: SalaryEntry[]): Record<string, SalaryEntry[]> {
  return data.reduce<Record<string, SalaryEntry[]>>((acc, item) => {
    if (!acc[item.sector]) acc[item.sector] = [];
    acc[item.sector].push(item);
    return acc;
  }, {});
}

const SECTOR_COLORS: Record<string, string> = {
  "Banque & Finance": "text-blue-600 bg-blue-50 border-blue-200",
  "Informatique": "text-purple-600 bg-purple-50 border-purple-200",
  "Santé": "text-green-600 bg-green-50 border-green-200",
  "Éducation": "text-yellow-700 bg-yellow-50 border-yellow-200",
  "BTP": "text-orange-600 bg-orange-50 border-orange-200",
  "Commerce": "text-pink-600 bg-pink-50 border-pink-200",
  "Logistique": "text-cyan-600 bg-cyan-50 border-cyan-200",
  "ONG / Humanitaire": "text-teal-600 bg-teal-50 border-teal-200",
  "Administration": "text-gray-600 bg-gray-50 border-gray-200",
};

export default function SalairesPage() {
  const grouped = groupBySector(SALAIRES);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-orange-500 font-semibold text-sm">KTZ Emploi</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Baromètre des salaires en RCA
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Fourchettes indicatives en Franc CFA (XAF) par secteur et type de poste
          </p>
        </div>
      </div>

      {/* Sectors */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {Object.entries(grouped).map(([sector, entries]) => {
            const colorClass = SECTOR_COLORS[sector] ?? "text-gray-600 bg-gray-50 border-gray-200";
            return (
              <div key={sector} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Sector header */}
                <div className={`px-6 py-4 border-b ${colorClass}`}>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <h2 className="font-bold text-base">{sector}</h2>
                    <span className="ml-auto text-xs font-medium opacity-70">
                      {entries.length} poste(s)
                    </span>
                  </div>
                </div>

                {/* Entries */}
                <div className="divide-y divide-gray-50">
                  {entries.map((entry) => {
                    const barMin = Math.round((entry.min / GLOBAL_MAX) * 100);
                    const barMax = Math.round((entry.max / GLOBAL_MAX) * 100);

                    return (
                      <div key={entry.poste} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:w-48 flex-shrink-0">
                            <p className="font-semibold text-gray-900 text-sm">{entry.poste}</p>
                          </div>

                          <div className="flex-1">
                            {/* Bar */}
                            <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="absolute top-0 h-full bg-orange-200 rounded-full"
                                style={{ left: `${barMin}%`, width: `${barMax - barMin}%` }}
                              />
                              <div
                                className="absolute top-1 h-3 bg-orange-500 rounded-full"
                                style={{ left: `${barMin}%`, width: `${barMax - barMin}%` }}
                              />
                            </div>
                          </div>

                          <div className="sm:w-56 flex-shrink-0 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatXAF(entry.min)}
                            </span>
                            <span className="text-gray-400 mx-1.5 text-sm">–</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatXAF(entry.max)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer note */}
        <div className="mt-10 bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-orange-700">
            <strong>Note :</strong> Données indicatives basées sur les offres publiées sur KTZ Emploi.
            Les salaires réels peuvent varier selon l&apos;expérience, la taille de l&apos;entreprise et la localisation.
          </p>
        </div>
      </div>
    </div>
  );
}
