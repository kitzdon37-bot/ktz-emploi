"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function OctobreRoseBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white text-sm py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-center pr-8">
        {/* Ruban SVG inline */}
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C9.5 2 7.5 3.5 7.5 5.5c0 1.4.8 2.6 2 3.3L7 17l5 3 5-3-2.5-8.2c1.2-.7 2-1.9 2-3.3C16.5 3.5 14.5 2 12 2zm0 2c1.4 0 2.5.9 2.5 2s-1.1 2-2.5 2-2.5-.9-2.5-2S10.6 4 12 4z"/>
        </svg>
        <span className="font-semibold tracking-wide">🎀 Octobre Rose</span>
        <span className="hidden sm:inline text-pink-100">—</span>
        <span className="hidden sm:inline text-pink-100">
          Ensemble contre le cancer du sein. Parlez-en, dépistez-vous.
        </span>
        <a
          href="https://www.cancer.org/cancer/types/breast-cancer.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors flex-shrink-0"
        >
          En savoir plus
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
