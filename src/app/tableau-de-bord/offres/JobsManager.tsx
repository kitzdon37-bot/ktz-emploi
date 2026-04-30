"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase, Clock, Users, Eye, Trash2, Loader2, Plus, AlertTriangle, X, CheckCircle,
} from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  published: boolean;
  createdAt: string;
  _count: { applications: number };
}

export default function JobsManager({ jobs: initialJobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDelete(jobId: string) {
    setDeleting(jobId);
    setConfirmId(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        showToast("success", "Offre supprimée.");
        router.refresh();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Erreur lors de la suppression.");
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes offres d&apos;emploi</h1>
          <p className="text-gray-500 mt-0.5">{jobs.length} offre{jobs.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/tableau-de-bord/publier"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          Nouvelle offre
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Briefcase className="h-14 w-14 mx-auto mb-4 text-gray-200" />
          <p className="text-lg font-semibold text-gray-700">Aucune offre pour le moment</p>
          <p className="text-sm text-gray-400 mt-1">Publiez votre première offre pour commencer à recevoir des candidatures.</p>
          <Link href="/tableau-de-bord/publier" className="inline-block mt-5 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Publier une offre
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className={`bg-white rounded-2xl border p-5 ${
              job.published ? "border-gray-200" : "border-dashed border-gray-300"
            }`}>
              <div className="flex items-start gap-4">
                {/* Icône */}
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Link href={`/emplois/${job.slug}`} className="font-semibold text-gray-900 hover:text-orange-500 truncate">
                      {job.title}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      job.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {job.published ? "Publié" : "En attente de validation"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(job.createdAt)}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job._count.applications} candidature{job._count.applications !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/emplois/${job.slug}`}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Voir
                  </Link>

                  {confirmId === job.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Confirmer ?</span>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deleting === job.id}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-60"
                      >
                        {deleting === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Oui, supprimer
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(job.id)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-100 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
