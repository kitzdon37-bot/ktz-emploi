"use client";

import { useEffect, useState } from "react";
import { Loader2, X, Info } from "lucide-react";
import type { ScreeningQuestion } from "@/lib/screening";
import ScreeningQuestionsEditor from "@/components/ScreeningQuestionsEditor";

interface Props {
  jobId: string;
  jobTitle: string;
  applicationsCount: number;
  onClose: () => void;
  onSaved: (count: number) => void;
}

export default function ScreeningModal({ jobId, jobTitle, applicationsCount, onClose, onSaved }: Props) {
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/screening`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuestions(data.questions ?? []);
      })
      .catch((e) => setError(e.message || "Impossible de charger les questions."))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function handleSave() {
    setError("");
    const untitled = questions.findIndex((q) => !q.label.trim());
    if (untitled !== -1) {
      setError(`La question ${untitled + 1} n'a pas d'intitulé.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/screening`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur lors de l'enregistrement."); return; }
      onSaved(data.questions.length);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
    >
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-200 bg-white rounded-t-2xl">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900">Questions aux candidats</h2>
            <p className="text-sm text-gray-500 truncate">{jobTitle}</p>
          </div>
          <button onClick={onClose} disabled={saving} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {applicationsCount > 0 && (
            <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2.5 rounded-xl">
              <Info className="h-4 w-4 flex-shrink-0 mt-px" />
              Les modifications s&apos;appliquent aux prochaines candidatures. Les {applicationsCount} candidature{applicationsCount > 1 ? "s" : ""} déjà reçue{applicationsCount > 1 ? "s" : ""} conserve{applicationsCount > 1 ? "nt" : ""} leurs réponses.
            </div>
          )}
          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
          ) : (
            <ScreeningQuestionsEditor value={questions} onChange={setQuestions} />
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <button onClick={onClose} disabled={saving} className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
