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

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex]);
    } else {
      router.push(`/emplois?q=${encodeURIComponent(query)}`);
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
    <div ref={containerRef} className="relative flex-1">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-1 h-full">
        <Search className="h-5 w-5 text-orange-400 flex-shrink-0" />
        <div className="flex flex-col py-2.5 w-full">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quoi ?</label>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Métier, entreprise, compétence..."
            autoComplete="off"
            className="outline-none text-gray-800 placeholder-gray-400 text-sm bg-transparent mt-0.5 w-full"
          />
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden mt-1">
          {query.length === 0 && (
            <li className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
              Offres populaires
            </li>
          )}
          {suggestions.map((s, i) => (
            <li key={s.label}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i === activeIndex ? "bg-orange-50" : "hover:bg-gray-50"
                } ${i !== suggestions.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <span className="text-lg flex-shrink-0">
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
