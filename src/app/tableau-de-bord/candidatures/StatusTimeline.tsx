"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { APPLICATION_STATUSES } from "@/lib/utils";

interface HistoryEntry {
  id: string;
  status: string;
  note: string | null;
  changedAt: string;
}

interface Props {
  applicationId: string;
  currentStatus: string;
  currentCreatedAt: string;
  history: HistoryEntry[];
}

export default function StatusTimeline({ currentStatus, currentCreatedAt, history }: Props) {
  const [open, setOpen] = useState(false);

  // Si aucun historique, on fabrique une entrée synthétique avec le statut actuel
  const entries: HistoryEntry[] =
    history.length > 0
      ? history
      : [{ id: "initial", status: currentStatus, note: null, changedAt: currentCreatedAt }];

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors font-medium"
      >
        <Clock className="h-3.5 w-3.5" />
        Voir l&apos;historique
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="mt-3 pl-2">
          <ol className="relative border-l-2 border-orange-100 space-y-4 ml-2">
            {entries.map((entry, idx) => {
              const st = APPLICATION_STATUSES[entry.status];
              const isLatest = idx === entries.length - 1;
              return (
                <li key={entry.id} className="relative pl-5">
                  {/* Dot */}
                  <span
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      isLatest ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {st?.label ?? entry.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.changedAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-50 px-2 py-1.5 rounded-lg">
                      {entry.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
