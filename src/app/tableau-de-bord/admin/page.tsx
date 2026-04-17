"use client";

import { useState, useEffect } from "react";
import {
  Users, Mail, Search, CheckSquare, Square, Send,
  Briefcase, MapPin, Tag, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp
} from "lucide-react";

interface Candidate {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  profile: {
    title: string | null;
    location: string | null;
    skills: string | null;
  } | null;
  matchCount: number;
  matchedJobs: {
    id: string;
    title: string;
    slug: string;
    type: string;
    location: string;
    company: { name: string };
  }[];
}

interface SendResult {
  email: string;
  sent: boolean;
  jobCount: number;
  error?: string;
}

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/candidates")
      .then((r) => r.json())
      .then((data) => { setCandidates(data.candidates ?? []); setLoading(false); });
  }, []);

  const filtered = candidates.filter((c) =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.profile?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.profile?.location?.toLowerCase().includes(search.toLowerCase())
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  }

  async function sendEmails() {
    if (selected.size === 0) return;
    setSending(true);
    setResults(null);
    const res = await fetch("/api/admin/send-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateIds: Array.from(selected) }),
    });
    const data = await res.json();
    setResults(data.results);
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-500" />
            Gestion des candidats
          </h1>
          <p className="text-gray-500 mt-0.5">
            {candidates.length} candidat(s) inscrit(s)
          </p>
        </div>

        <button
          onClick={sendEmails}
          disabled={selected.size === 0 || sending}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Envoi en cours..." : `Envoyer les offres (${selected.size})`}
        </button>
      </div>

      {/* Résultats envoi */}
      {results && (
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">
            Résultats : {results.filter((r) => r.sent).length}/{results.length} emails envoyés
          </h3>
          <div className="space-y-2">
            {results.map((r) => (
              <div key={r.email} className="flex items-center gap-3 text-sm">
                {r.sent
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
                <span className="font-medium text-gray-700">{r.email}</span>
                {r.sent
                  ? <span className="text-gray-400">· {r.jobCount} offre(s) envoyée(s)</span>
                  : <span className="text-red-400">· {r.jobCount === 0 ? "Aucune offre correspondante" : r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, poste, ville..."
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <button
          onClick={toggleAll}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {selected.size === filtered.length && filtered.length > 0
            ? <CheckSquare className="h-4 w-4 text-orange-500" />
            : <Square className="h-4 w-4" />}
          Tout sélectionner
        </button>
      </div>

      {/* Liste des candidats */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Aucun candidat trouvé</p>
          </div>
        )}

        {filtered.map((c) => (
          <div
            key={c.id}
            className={`bg-white rounded-2xl border transition-all ${
              selected.has(c.id) ? "border-orange-300 ring-1 ring-orange-100" : "border-gray-200"
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">

                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(c.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {selected.has(c.id)
                    ? <CheckSquare className="h-5 w-5 text-orange-500" />
                    : <Square className="h-5 w-5 text-gray-300 hover:text-gray-500" />}
                </button>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0">
                  {(c.name ?? c.email).slice(0, 2).toUpperCase()}
                </div>

                {/* Info candidat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-gray-900">{c.name ?? "—"}</p>
                      <a href={`mailto:${c.email}`} className="text-sm text-orange-500 hover:underline flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {c.email}
                      </a>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      c.matchCount > 0 ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.matchCount} offre(s) correspondante(s)
                    </span>
                  </div>

                  {/* Tags profil */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {c.profile?.title && (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        <Briefcase className="h-3 w-3" /> {c.profile.title}
                      </span>
                    )}
                    {c.profile?.location && (
                      <span className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" /> {c.profile.location}
                      </span>
                    )}
                    {c.profile?.skills && c.profile.skills.split(",").slice(0, 3).map((s) => (
                      <span key={s} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <Tag className="h-3 w-3" /> {s.trim()}
                      </span>
                    ))}
                    {!c.profile?.title && !c.profile?.location && (
                      <span className="text-xs text-gray-400 italic">Profil non complété</span>
                    )}
                  </div>
                </div>

                {/* Bouton développer */}
                {c.matchedJobs.length > 0 && (
                  <button
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {expanded === c.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {/* Offres correspondantes (développé) */}
              {expanded === c.id && c.matchedJobs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 pl-9">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Offres qui lui seront envoyées
                  </p>
                  {c.matchedJobs.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                        {job.company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.company.name} · {job.location} · {job.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
