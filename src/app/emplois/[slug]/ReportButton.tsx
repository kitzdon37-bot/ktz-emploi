"use client";
import { useState } from "react";
import { Flag, X, Loader2, CheckCircle } from "lucide-react";

const REASONS = ["Offre frauduleuse", "Contenu inapproprié", "Offre expirée", "Informations incorrectes", "Autre"];

export default function ReportButton({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setSent] = useState(false);

  async function submit() {
    setLoading(true);
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "JOB", targetId: jobId, reason, details: details || undefined }),
    });
    setLoading(false);
    setSent(true);
    setTimeout(() => { setOpen(false); setSent(false); }, 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mt-4"
      >
        <Flag className="h-3.5 w-3.5" />Signaler cette offre
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Signaler cette offre</h3>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {done ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />Signalement envoyé, merci !
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Raison</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    {REASONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Détails (optionnel)</label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
                  Envoyer le signalement
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
