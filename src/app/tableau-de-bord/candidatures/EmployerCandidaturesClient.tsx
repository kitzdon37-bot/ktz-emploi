"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase, FileText, Archive, ArchiveRestore, Trash2,
  ChevronDown, Loader2, SortAsc, Filter, X, AlertTriangle,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import ApplicationActions from "./ApplicationActions";
import NotesButton from "./NotesButton";
import ExportCsvButton from "./ExportCsvButton";

const APPLICATION_STATUSES: Record<string, { label: string; color: string }> = {
  PENDING:   { label: "En attente",        color: "text-yellow-700 bg-yellow-50 border-yellow-200" },
  REVIEWING: { label: "En cours d'examen", color: "text-blue-700 bg-blue-50 border-blue-200" },
  INTERVIEW: { label: "Entretien",          color: "text-purple-700 bg-purple-50 border-purple-200" },
  ACCEPTED:  { label: "Accepté",            color: "text-green-700 bg-green-50 border-green-200" },
  REJECTED:  { label: "Refusé",             color: "text-red-700 bg-red-50 border-red-200" },
};

type SortKey = "date_desc" | "date_asc" | "status" | "name" | "job";
type FilterTab = "active" | "archived";

interface AppData {
  id: string;
  status: string;
  archived: boolean;
  coverLetter: string | null;
  cvUrl: string | null;
  createdAt: string;
  job: { title: string; slug: string; type: string };
  user: {
    name: string | null;
    email: string | null;
    profile: { whatsappOptIn: boolean } | null;
  };
}

interface Props {
  initialApplications: AppData[];
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "date_desc", label: "Plus récentes d'abord" },
  { value: "date_asc",  label: "Plus anciennes d'abord" },
  { value: "name",      label: "Candidat (A → Z)" },
  { value: "job",       label: "Poste (A → Z)" },
  { value: "status",    label: "Statut" },
];

const STATUS_ORDER = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED"];

export default function EmployerCandidaturesClient({ initialApplications }: Props) {
  const router = useRouter();
  const [apps, setApps] = useState<AppData[]>(initialApplications);
  const [tab, setTab] = useState<FilterTab>("active");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterJob, setFilterJob] = useState<string>("");
  const [pendingArchive, setPendingArchive] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>("");

  // Unique job titles for filter
  const jobTitles = useMemo(() => {
    const set = new Set(apps.map((a) => a.job.title));
    return Array.from(set).sort();
  }, [apps]);

  // Filtered + sorted list
  const displayed = useMemo(() => {
    let list = apps.filter((a) => a.archived === (tab === "archived"));
    if (filterStatus) list = list.filter((a) => a.status === filterStatus);
    if (filterJob) list = list.filter((a) => a.job.title === filterJob);

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "date_asc":  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date_desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":      return (a.user.name || a.user.email || "").localeCompare(b.user.name || b.user.email || "");
        case "job":       return a.job.title.localeCompare(b.job.title);
        case "status":    return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
        default:          return 0;
      }
    });
    return list;
  }, [apps, tab, sort, filterStatus, filterJob]);

  const activeCount   = apps.filter((a) => !a.archived).length;
  const archivedCount = apps.filter((a) => a.archived).length;

  async function handleArchive(id: string, archive: boolean) {
    setPendingArchive(id);
    setActionError("");
    try {
      const res = await fetch(`/api/employer/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: archive }),
      });
      if (res.ok) {
        setApps((prev) => prev.map((a) => a.id === id ? { ...a, archived: archive } : a));
      } else {
        setActionError("Erreur lors de l'archivage.");
      }
    } finally {
      setPendingArchive(null);
    }
  }

  async function handleDelete(id: string) {
    setPendingDelete(id);
    setActionError("");
    try {
      const res = await fetch(`/api/employer/applications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== id));
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setActionError("Erreur lors de la suppression.");
        setDeleteConfirmId(null);
      }
    } finally {
      setPendingDelete(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidatures reçues</h1>
        <ExportCsvButton />
      </div>

      {/* Tabs : Actives / Archivées */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5 w-fit">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "active" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Actives
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === "active" ? "bg-orange-100 text-orange-600" : "bg-gray-200 text-gray-500"}`}>
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => setTab("archived")}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "archived" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Archive className="h-3.5 w-3.5" />
          Archivées
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "archived" ? "bg-gray-100 text-gray-600" : "bg-gray-200 text-gray-500"}`}>
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Filtres + Tri */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Tri */}
        <div className="relative">
          <SortAsc className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-7 pr-7 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Filtre statut */}
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-7 pr-7 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(APPLICATION_STATUSES).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>

        {/* Filtre poste */}
        {jobTitles.length > 1 && (
          <div className="relative">
            <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <select
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
              className="pl-7 pr-7 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 appearance-none max-w-[200px]"
            >
              <option value="">Tous les postes</option>
              {jobTitles.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Reset filtres */}
        {(filterStatus || filterJob) && (
          <button
            onClick={() => { setFilterStatus(""); setFilterJob(""); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-3.5 w-3.5" /> Effacer
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{displayed.length} résultat{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {actionError}
        </div>
      )}

      {/* Liste */}
      {displayed.length > 0 ? (
        <div className="space-y-3">
          {displayed.map((app) => {
            const st = APPLICATION_STATUSES[app.status];
            const isArchiving = pendingArchive === app.id;
            const isDeleting  = pendingDelete === app.id;
            return (
              <div
                key={app.id}
                className={`bg-white rounded-2xl border p-5 transition-all ${
                  app.archived ? "border-gray-100 opacity-75" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">{app.user.name || app.user.email}</p>
                      {st && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${st.color}`}>
                          {st.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{app.user.email}</p>
                    <div className="mt-1">
                      <Link href={`/emplois/${app.job.slug}`} className="text-sm text-orange-500 hover:underline">
                        {app.job.title}
                      </Link>
                      <span className="text-xs text-gray-400 ml-2">· {app.job.type}</span>
                    </div>
                    {app.coverLetter && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                        {app.coverLetter}
                      </p>
                    )}
                    {app.cvUrl && (
                      <a
                        href={app.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-orange-500 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Voir le CV
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <ApplicationActions
                      applicationId={app.id}
                      initialStatus={app.status}
                      candidateName={app.user.name || app.user.email || "Candidat"}
                      candidateWhatsappOptIn={app.user.profile?.whatsappOptIn ?? false}
                    />
                    <span className="text-xs text-gray-400">{timeAgo(app.createdAt)}</span>

                    {/* Actions secondaires */}
                    <div className="flex items-center gap-1 mt-1">
                      {/* Archive / Désarchiver */}
                      <button
                        onClick={() => handleArchive(app.id, !app.archived)}
                        disabled={isArchiving}
                        title={app.archived ? "Désarchiver" : "Archiver"}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50"
                      >
                        {isArchiving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : app.archived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </button>

                      {/* Supprimer */}
                      <button
                        onClick={() => setDeleteConfirmId(app.id)}
                        disabled={isDeleting}
                        title="Supprimer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <NotesButton applicationId={app.id} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">
            {tab === "archived" ? "Aucune candidature archivée" : "Aucune candidature active"}
          </p>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirmId(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Supprimer la candidature ?</h3>
                <p className="text-sm text-gray-500">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={pendingDelete === deleteConfirmId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {pendingDelete === deleteConfirmId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
