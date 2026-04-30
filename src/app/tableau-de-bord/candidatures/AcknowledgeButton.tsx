"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function AcknowledgeButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/employer/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Erreur lors de l'envoi");
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <CheckCircle className="h-3.5 w-3.5" />
        Email envoyé
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs px-3 py-2 border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium disabled:opacity-60"
        title="Envoyer un accusé de réception au candidat"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        {loading ? "Envoi..." : "Accuser réception"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
