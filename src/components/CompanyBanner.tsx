import { Building2 } from "lucide-react";

/* ── Thèmes par secteur ──────────────────────────────────────── */
const SECTOR_THEMES: Record<string, {
  from: string; to: string; via?: string;
  accent: string; icon: string; textLight: string;
}> = {
  "Banque & Finance":         { from: "#0f2d6b", to: "#1d4ed8", via: "#1e40af", accent: "#93c5fd", icon: "🏦", textLight: "rgba(219,234,254,0.7)" },
  "Assurances":               { from: "#1e1b4b", to: "#4338ca", via: "#3730a3", accent: "#a5b4fc", icon: "🛡️", textLight: "rgba(224,231,255,0.7)" },
  "Télécommunications":       { from: "#082f49", to: "#0e7490", via: "#0369a1", accent: "#67e8f9", icon: "📡", textLight: "rgba(207,250,254,0.7)" },
  "Informatique & Télécoms":  { from: "#2e1065", to: "#7c3aed", via: "#6d28d9", accent: "#c4b5fd", icon: "💻", textLight: "rgba(237,233,254,0.7)" },
  "BTP & Construction":       { from: "#431407", to: "#b45309", via: "#92400e", accent: "#fcd34d", icon: "🏗️", textLight: "rgba(254,243,199,0.7)" },
  "Transport & Logistique":   { from: "#431407", to: "#c2410c", via: "#9a3412", accent: "#fdba74", icon: "🚚", textLight: "rgba(255,237,213,0.7)" },
  "Santé":                    { from: "#4c0519", to: "#be123c", via: "#9f1239", accent: "#fda4af", icon: "🏥", textLight: "rgba(255,228,230,0.7)" },
  "Éducation & Formation":    { from: "#022c22", to: "#047857", via: "#065f46", accent: "#6ee7b7", icon: "📚", textLight: "rgba(209,250,229,0.7)" },
  "Industrie":                { from: "#030712", to: "#374151", via: "#111827", accent: "#9ca3af", icon: "🏭", textLight: "rgba(243,244,246,0.6)" },
  "Hôtellerie & Tourisme":    { from: "#042f2e", to: "#0f766e", via: "#134e4a", accent: "#5eead4", icon: "🏨", textLight: "rgba(204,251,241,0.7)" },
  "Humanitaire & ONG":        { from: "#022c22", to: "#16a34a", via: "#065f46", accent: "#86efac", icon: "🤝", textLight: "rgba(220,252,231,0.7)" },
  "Agriculture & Élevage":    { from: "#1a2e05", to: "#4d7c0f", via: "#3f6212", accent: "#bef264", icon: "🌾", textLight: "rgba(247,254,231,0.7)" },
  "Journalisme & Médias":     { from: "#3b0764", to: "#a21caf", via: "#86198f", accent: "#f0abfc", icon: "📰", textLight: "rgba(250,232,255,0.7)" },
  "Énergie & Mines":          { from: "#1c1917", to: "#854d0e", via: "#713f12", accent: "#fbbf24", icon: "⚡", textLight: "rgba(254,249,195,0.7)" },
  "Commerce & Vente":         { from: "#450a0a", to: "#dc2626", via: "#991b1b", accent: "#fca5a5", icon: "🛒", textLight: "rgba(254,226,226,0.7)" },
  "ONG / Humanitaire":        { from: "#022c22", to: "#16a34a", via: "#065f46", accent: "#86efac", icon: "🤝", textLight: "rgba(220,252,231,0.7)" },
  "Médecine & Santé":         { from: "#4c0519", to: "#be123c", via: "#9f1239", accent: "#fda4af", icon: "🏥", textLight: "rgba(255,228,230,0.7)" },
};

const DEFAULT_THEME = {
  from: "#7c2d12", to: "#ea580c", via: "#c2410c",
  accent: "#fdba74", icon: "🏢", textLight: "rgba(255,237,213,0.7)",
};

function getTheme(sector?: string | null) {
  if (!sector) return DEFAULT_THEME;
  return SECTOR_THEMES[sector] ?? DEFAULT_THEME;
}

interface CompanyBannerProps {
  name: string;
  sector?: string | null;
  banner?: string | null;
  location?: string | null;
  verified?: boolean;
}

export default function CompanyBanner({ name, sector, banner, location, verified }: CompanyBannerProps) {
  const t = getTheme(sector);
  const initials = name.slice(0, 2).toUpperCase();

  /* Si une bannière custom existe, on l'affiche avec un overlay léger */
  if (banner) {
    return (
      <div className="h-52 w-full relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner} alt="Bannière" className="w-full h-full object-cover" />
        {/* Overlay bas pour lisibilité du logo flottant */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
    );
  }

  /* Bannière générée selon le secteur */
  return (
    <div
      className="h-52 w-full relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${t.from} 0%, ${t.via ?? t.to} 50%, ${t.to} 100%)` }}
    >
      {/* ── Cercles décoratifs ── */}
      <div
        className="absolute rounded-full opacity-10"
        style={{ width: 300, height: 300, top: -80, right: -60, background: t.accent }}
      />
      <div
        className="absolute rounded-full opacity-10"
        style={{ width: 180, height: 180, bottom: -60, left: 60, background: t.accent }}
      />
      <div
        className="absolute rounded-full opacity-[0.07]"
        style={{ width: 100, height: 100, top: 20, left: "40%", background: "#fff" }}
      />

      {/* ── Grille de points ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`dots-${initials}`} x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${initials})`} />
      </svg>

      {/* ── Bande accent en bas ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
        style={{ background: t.accent }}
      />

      {/* ── Contenu textuel ── */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-5">
        <div className="flex items-end gap-4">
          {/* Initiales en grand */}
          <div
            className="text-5xl font-black leading-none select-none opacity-20"
            style={{ color: t.accent, letterSpacing: "-0.04em" }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Secteur + icône */}
            {sector && (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-1.5"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(6px)" }}
              >
                <span>{t.icon}</span>
                <span>{sector}</span>
              </div>
            )}

            {/* Nom de l'entreprise */}
            <h1 className="text-2xl font-extrabold text-white leading-tight drop-shadow-sm truncate">
              {name}
              {verified && (
                <span className="ml-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-200 align-middle">
                  ✓
                </span>
              )}
            </h1>

            {/* Localisation */}
            {location && (
              <p className="text-xs mt-0.5" style={{ color: t.textLight }}>
                📍 {location}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
