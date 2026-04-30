"use client";

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface PipelineApplication {
  id: string;
  status: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobSlug: string;
  createdAt: string;
}

const COLUMNS: {
  key: string;
  label: string;
  color: string;
  header: string;
  dot: string;
}[] = [
  {
    key: "PENDING",
    label: "En attente",
    color: "bg-yellow-50 border-yellow-200",
    header: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-400",
  },
  {
    key: "REVIEWING",
    label: "En cours d'examen",
    color: "bg-blue-50 border-blue-200",
    header: "bg-blue-100 text-blue-800",
    dot: "bg-blue-400",
  },
  {
    key: "INTERVIEW",
    label: "Entretien",
    color: "bg-purple-50 border-purple-200",
    header: "bg-purple-100 text-purple-800",
    dot: "bg-purple-400",
  },
  {
    key: "ACCEPTED",
    label: "Accepté",
    color: "bg-green-50 border-green-200",
    header: "bg-green-100 text-green-800",
    dot: "bg-green-400",
  },
  {
    key: "REJECTED",
    label: "Refusé",
    color: "bg-gray-50 border-gray-200",
    header: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
];

const ALL_STATUSES = COLUMNS.map((c) => c.key);

interface Props {
  initialApplications: PipelineApplication[];
}

export default function PipelineClient({ initialApplications }: Props) {
  const [applications, setApplications] = useState<PipelineApplication[]>(initialApplications);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function moveApplication(id: string, newStatus: string) {
    setMovingId(id);
    try {
      const res = await fetch(`/api/employer/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.key);
        return (
          <div
            key={col.key}
            className={`flex-shrink-0 w-64 rounded-2xl border ${col.color} flex flex-col`}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl ${col.header}`}>
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="ml-auto text-xs font-bold opacity-70">{colApps.length}</span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3 p-3 flex-1">
              {colApps.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
                  <Users className="h-8 w-8 text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">Aucune candidature</p>
                </div>
              ) : (
                colApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="font-semibold text-gray-900 text-sm leading-snug mb-0.5">
                      {app.candidateName || app.candidateEmail}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{app.jobTitle}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(app.createdAt)}</p>

                    {/* Move-to buttons */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ALL_STATUSES.filter((s) => s !== col.key).map((s) => {
                        const target = COLUMNS.find((c) => c.key === s)!;
                        return (
                          <button
                            key={s}
                            disabled={movingId === app.id}
                            onClick={() => moveApplication(app.id, s)}
                            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${target.header}`}
                          >
                            {movingId === app.id ? (
                              <Loader2 className="h-3 w-3 animate-spin inline" />
                            ) : (
                              `→ ${target.label}`
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
