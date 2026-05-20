"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  /** Extra classes for the outer wrapper div */
  wrapperClassName?: string;
  /** Fetch suggestions asynchronously (debounced 120ms) */
  fetchSuggestions?: (q: string) => Promise<string[]>;
  /** Static list to filter client-side */
  staticSuggestions?: string[];
  id?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function AutocompleteInput({
  value,
  onChange,
  placeholder,
  className,
  wrapperClassName,
  fetchSuggestions,
  staticSuggestions,
  id,
  required,
  autoComplete = "off",
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const load = useCallback(
    async (q: string) => {
      if (staticSuggestions) {
        const filtered =
          q.length === 0
            ? staticSuggestions.slice(0, 8)
            : staticSuggestions
                .filter((s) => s.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 8);
        setSuggestions(filtered);
        setOpen(filtered.length > 0);
        return;
      }
      if (fetchSuggestions) {
        const results = await fetchSuggestions(q);
        setSuggestions(results);
        setOpen(results.length > 0);
      }
    },
    [staticSuggestions, fetchSuggestions]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setHighlighted(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(e.target.value), 120);
  }

  function handleFocus() {
    load(value);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      onChange(suggestions[highlighted]);
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function pick(s: string) {
    onChange(s);
    setOpen(false);
    setHighlighted(-1);
  }

  return (
    <div ref={containerRef} className={`relative${wrapperClassName ? ` ${wrapperClassName}` : ""}`}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={className}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => pick(s)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                i === highlighted
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
