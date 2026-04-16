"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { APPLICATION_STATUSES } from "@/lib/utils";

interface Props {
  jobId: string;
  hasApplied: boolean;
  applicationStatus: string;
  isLoggedIn: boolean;
  userRole?: string;
}

export default function ApplyButton({ jobId, hasApplied, applicationStatus, isLoggedIn, userRole }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(hasApplied);
  const [status, setStatus] = useState(applicationStatus);
  const [error, setError] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/connexion?callbackUrl=/emplois"
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <Send className="h-4 w-4" />
          Postuler maintenant
        </Link>
        <Link
          href="/inscription"
          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  if (userRole === "EMPLOYER") {
    return (
      <p className="text-sm text-gray-500 italic">
        Les recruteurs ne peuvent pas postuler aux offres.
      </p>
    );
  }

  if (success) {
    const st = APPLICATION_STATUSES[status] || APPLICATION_STATUSES.PENDING;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-xl">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Candidature envoyée</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
          {st.label}
        </span>
        <Link href="/tableau-de-bord/candidatures" className="text-sm text-red-600 hover:underline ml-auto">
          Voir mes candidatures →
        </Link>
      </div>
    );
  }

  async function handleApply() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la candidature");
        return;
      }
      setSuccess(true);
      setStatus("PENDING");
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!showForm ? (
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Send className="h-4 w-4" />
            Postuler maintenant
          </button>
        </div>
      ) : (
        <div className="border border-red-100 rounded-xl p-4 bg-red-50">
          <h3 className="font-medium text-gray-900 mb-3">Votre candidature</h3>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lettre de motivation <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              placeholder="Décrivez pourquoi vous êtes le candidat idéal..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Envoyer ma candidature
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-white transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
