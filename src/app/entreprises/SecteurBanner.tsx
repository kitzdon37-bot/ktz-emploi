"use client";

import { useEffect, useRef, useState } from "react";

const SECTOR_STYLES: Record<string, { gradient: string; text: string; icon: string }> = {
  "Banque & Finance":         { gradient: "from-blue-600 to-blue-800",     text: "text-blue-100",    icon: "🏦" },
  "Assurances":               { gradient: "from-indigo-600 to-indigo-800", text: "text-indigo-100",  icon: "🛡️" },
  "Télécommunications":       { gradient: "from-cyan-500 to-cyan-700",     text: "text-cyan-100",    icon: "📡" },
  "Informatique & Télécoms":  { gradient: "from-violet-600 to-violet-800", text: "text-violet-100",  icon: "💻" },
  "BTP & Construction":       { gradient: "from-amber-500 to-amber-700",   text: "text-amber-100",   icon: "🏗️" },
  "Transport & Logistique":   { gradient: "from-orange-500 to-orange-700", text: "text-orange-100",  icon: "🚚" },
  "Santé":                    { gradient: "from-rose-500 to-rose-700",     text: "text-rose-100",    icon: "🏥" },
  "Éducation & Formation":    { gradient: "from-emerald-500 to-emerald-700", text: "text-emerald-100", icon: "📚" },
  "Industrie":                { gradient: "from-gray-600 to-gray-800",     text: "text-gray-100",    icon: "🏭" },
  "Hôtellerie & Tourisme":    { gradient: "from-teal-500 to-teal-700",     text: "text-teal-100",    icon: "🏨" },
};

const DEFAULT_STYLE = { gradient: "from-gray-600 to-gray-800", text: "text-gray-100", icon: "🏢" };

interface Props {
  secteur: string;
  count: number;
  customIcon?: string;
  customGradient?: string;
  customText?: string;
  label?: string;
}

export default function SecteurBanner({ secteur, count, customIcon, customGradient, customText, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const base = SECTOR_STYLES[secteur] ?? DEFAULT_STYLE;
  const style = {
    gradient: customGradient ?? base.gradient,
    text:     customText     ?? base.text,
    icon:     customIcon     ?? base.icon,
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r ${style.gradient} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Cercles décoratifs en fond */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
      <div className="absolute top-2 right-24 w-16 h-16 rounded-full bg-white/5" />

      <div className="relative px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`text-4xl transition-all duration-500 delay-200 ${visible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          >
            {style.icon}
          </span>
          <div>
            <h2
              className={`text-2xl sm:text-3xl font-extrabold text-white tracking-tight transition-all duration-500 delay-100 ${
                visible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
            >
              {secteur}
            </h2>
            <p
              className={`${style.text} text-sm mt-0.5 font-medium transition-all duration-500 delay-200 ${
                visible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
              }`}
            >
              {label ?? `${count} entreprise${count > 1 ? "s" : ""} répertoriée${count > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Compteur animé */}
        <div
          className={`hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm transition-all duration-500 delay-300 ${
            visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <span className="text-2xl font-extrabold text-white">{count}</span>
          <span className={`text-xs ${style.text}`}>entreprise{count > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
