"use client";

import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { RCA_LOCATIONS } from "@/lib/utils";

export default function HeroSearch() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* ── Mobile : loupe seule → s'ouvre en overlay ─────────────────── */}
      <div className="sm:hidden">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center w-14 h-14 bg-orange-500 hover:bg-orange-600 rounded-full shadow-2xl transition-colors"
            aria-label="Ouvrir la recherche"
          >
            <Search className="h-6 w-6 text-white" />
          </button>
        ) : (
          <div className="cursor-fix relative z-50 bg-white rounded-2xl shadow-2xl animate-fadeIn">
            {/* Bouton fermer */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 z-10 p-1.5 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Champ Quoi */}
            <div className="border-b border-gray-200">
              <SearchBar />
            </div>

            {/* Champ Où + bouton */}
            <form action="/emplois" method="GET" className="flex">
              <div className="flex items-center gap-3 flex-1 px-5 py-1 cursor-default">
                <MapPin className="h-5 w-5 text-orange-400 flex-shrink-0 pointer-events-none select-none" />
                <div className="flex flex-col py-2.5 w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none select-none">Où ?</label>
                  <input
                    type="text"
                    name="location"
                    list="rca-locations-mobile"
                    placeholder="Ville, région..."
                    className="outline-none text-gray-800 placeholder-gray-400 text-sm bg-transparent mt-0.5 w-full"
                  />
                  <datalist id="rca-locations-mobile">
                    {RCA_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} />
                    ))}
                  </datalist>
                </div>
              </div>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-5 font-bold text-sm transition-colors rounded-br-2xl flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Desktop : barre complète ───────────────────────────────────── */}
      <div className="hidden sm:block relative z-50">
        <div className="cursor-fix flex flex-row bg-white rounded-2xl shadow-2xl">
          {/* Champ Quoi */}
          <div className="flex-1 border-r border-gray-200 overflow-visible">
            <SearchBar />
          </div>
          {/* Champ Où + bouton */}
          <form action="/emplois" method="GET" className="flex rounded-tr-2xl rounded-br-2xl overflow-hidden">
            <div className="flex items-center gap-3 w-56 px-5 py-1 border-r border-gray-200 cursor-default">
              <MapPin className="h-5 w-5 text-orange-400 flex-shrink-0 pointer-events-none select-none" />
              <div className="flex flex-col py-2.5 w-full">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none select-none">Où ?</label>
                <input
                  type="text"
                  name="location"
                  list="rca-locations-desktop"
                  placeholder="Ville, région..."
                  className="outline-none text-gray-800 placeholder-gray-400 text-sm bg-transparent mt-0.5 w-full"
                />
                <datalist id="rca-locations-desktop">
                  {RCA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
