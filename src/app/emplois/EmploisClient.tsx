"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Suggestion {
  label: string;
  type: "title" | "category";
  category: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Humanitaire & ONG": "🤝",
  "Informatique & Télécoms": "💻",
  "Médecine & Santé": "🏥",
  "Banque & Finance": "🏦",
  "Éducation & Formation": "📚",
  "Commerce & Vente": "🛒",
  "BTP & Construction": "🏗️",
  "Agriculture & Élevage": "🌾",
  "Environnement & Agriculture": "🌿",
  "Logistique & Transport": "🚛",
  "Droit & Administration": "⚖️",
  "Finance & Comptabilité": "📊",
};

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-orange-500">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function EmploisSearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/suggestions?q=${encodeURIComponent(q)}`);
      const data: Suggestion[] = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 120);
  }

  function handleSelect(s: Suggestion) {
    setQuery(s.label);
    setOpen(false);
    if (s.type === "category") {
      router.push(`/emplois?category=${encodeURIComponent(s.label)}`);
    } else {
      router.push(`/emplois?q=${encodeURIComponent(s.label)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    }
  }

  function handleFocus() {
    if (suggestions.length > 0) setOpen(true);
    else fetchSuggestions(query);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        name="q"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        autoComplete="off"
        placeholder="Mot-clé..."
        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden mt-1">
          {query.length === 0 && (
            <li className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
              Offres populaires
            </li>
          )}
          {suggestions.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex ? "bg-orange-50" : "hover:bg-gray-50"
                } ${i !== suggestions.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-base flex-shrink-0">
                  {s.type === "category" ? (CATEGORY_ICONS[s.category] ?? "📋") : "🔍"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    <Highlight text={s.label} query={query} />
                  </p>
                  {s.type === "title" && (
                    <p className="text-xs text-gray-400 truncate">{s.category}</p>
                  )}
                  {s.type === "category" && (
                    <p className="text-xs text-orange-500">Voir toutes les offres</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
