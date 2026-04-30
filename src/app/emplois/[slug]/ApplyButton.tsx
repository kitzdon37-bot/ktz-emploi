"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Loader2, CheckCircle, Paperclip, X } from "lucide-react";
import { APPLICATION_STATUSES } from "@/lib/utils";

interface Props {
  jobId: string;
  hasApplied: boolean;
  applicationStatus: string;
  isLoggedIn: boolean;
  userRole?: string;
  profileCvUrl?: string;
}

export default function ApplyButton({ jobId, hasApplied, applicationStatus, isLoggedIn, userRole, profileCvUrl }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [useProfileCv, setUseProfileCv] = useState(!!profileCvUrl);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(hasApplied);
  const [status, setStatus] = useState(applicationStatus);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/connexion?callbackUrl=/emplois"
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
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
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 px-4 py-2.5 rounded-xl">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Candidature envoyée</span>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
          {st.label}
        </span>
        <Link href="/tableau-de-bord/candidatures" className="text-sm text-orange-500 hover:underline ml-auto">
          Voir mes candidatures →
        </Link>
      </div>
    );
  }

  async function handleApply() {
    setError("");
    setLoading(true);
    try {
      // 1. Upload du CV si fourni
      let cvUrl: string | null = useProfileCv && profileCvUrl ? profileCvUrl : null;
      if (!useProfileCv && cvFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("cv", cvFile);
        const uploadRes = await fetch("/api/upload/cv", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        setUploading(false);
        if (!uploadRes.ok) { setError(uploadData.error || "Erreur upload CV"); setLoading(false); return; }
        cvUrl = uploadData.url;
      }

      // 2. Soumettre la candidature
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter, cvUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur lors de la candidature"); return; }
      setSuccess(true);
      setStatus("PENDING");
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div>
      {!showForm ? (
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Send className="h-4 w-4" />
            Postuler maintenant
          </button>
        </div>
      ) : (
        <div className="border border-orange-100 rounded-xl p-4 bg-orange-50">
          <h3 className="font-medium text-gray-900 mb-3">Votre candidature</h3>
          {error && <p className="text-orange-500 text-sm mb-3">{error}</p>}
          {/* CV */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CV <span className="text-gray-400 font-normal">(PDF ou Word, max 5 Mo)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => { setCvFile(e.target.files?.[0] ?? null); setUseProfileCv(false); }}
            />
            {/* CV du profil disponible */}
            {profileCvUrl && useProfileCv && (
              <div className="flex items-center gap-2 px-4 py-2.5 border border-green-200 bg-green-50 rounded-xl text-sm mb-2">
                <Paperclip className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="flex-1 truncate text-gray-700">CV de votre profil</span>
                <button type="button" onClick={() => { setUseProfileCv(false); fileInputRef.current?.click(); }} className="text-xs text-orange-500 hover:underline">
                  Changer
                </button>
              </div>
            )}
            {/* Nouveau CV sélectionné */}
            {!useProfileCv && cvFile && (
              <div className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 bg-orange-50 rounded-xl text-sm">
                <Paperclip className="h-4 w-4 text-orange-500 flex-shrink-0" />
                <span className="flex-1 truncate text-gray-700">{cvFile.name}</span>
                <button type="button" onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; if (profileCvUrl) setUseProfileCv(true); }}>
                  <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            )}
            {/* Aucun CV */}
            {!useProfileCv && !cvFile && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors w-full"
              >
                <Paperclip className="h-4 w-4" />
                Joindre mon CV
              </button>
            )}
          </div>

          {/* Lettre de motivation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Lettre de motivation <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              placeholder="Décrivez pourquoi vous êtes le candidat idéal..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApply}
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {(loading || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Upload CV..." : "Envoyer ma candidature"}
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
