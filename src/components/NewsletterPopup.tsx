"use client";

import { useState, useEffect } from "react";
import { X, Mail, CheckCircle, Loader2, Briefcase } from "lucide-react";

const STORAGE_KEY = "ktz_newsletter_popup_dismissed";
const DELAY_MS = 6000; // 6 secondes après le chargement

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<"weekly" | "monthly">("weekly");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Ne pas afficher si déjà fermé/soumis
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), frequency }),
    });

    const data = await res.json();

    if (res.ok || res.status === 200) {
      setStatus("success");
      localStorage.setItem(STORAGE_KEY, "1");
      setTimeout(() => setVisible(false), 2800);
    } else {
      setStatus("error");
      setErrorMsg(data.error ?? "Une erreur est survenue.");
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="fixed z-50 inset-0 flex items-center justify-center px-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-in zoom-in-95 fade-in duration-300 overflow-hidden">

          {/* Header coloré */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-6 pb-10 relative">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/70 hover:text-white rounded-full p-1 hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white rounded-lg p-1.5">
                <Briefcase className="text-orange-500" size={18} />
              </div>
              <span className="text-white font-bold text-lg">KTZ Emploi</span>
            </div>
            <h2 className="text-white font-bold text-2xl leading-tight">
              Ne ratez plus aucune offre !
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              Recevez les meilleures offres d&apos;emploi en RCA directement dans votre boîte mail.
            </p>
          </div>

          {/* Icône centrée sur la jonction */}
          <div className="flex justify-center -mt-6">
            <div className="bg-white rounded-full p-2 shadow-md border-2 border-orange-100">
              <Mail className="text-orange-500" size={28} />
            </div>
          </div>

          {/* Corps */}
          <div className="px-6 pb-6 pt-3">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="text-green-500" size={44} />
                <p className="text-gray-800 font-semibold text-lg">Vous êtes abonné !</p>
                <p className="text-gray-500 text-sm">Vous recevrez bientôt les nouvelles offres.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Votre adresse email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Fréquence de réception</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["weekly", "monthly"] as const).map((f) => (
                      <label
                        key={f}
                        className={`flex items-center justify-center gap-2 border-2 rounded-xl py-2.5 cursor-pointer text-sm font-medium transition-colors ${
                          frequency === f
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="popup-freq"
                          value={f}
                          checked={frequency === f}
                          onChange={() => setFrequency(f)}
                          className="sr-only"
                        />
                        {f === "weekly" ? "Chaque semaine" : "Chaque mois"}
                      </label>
                    ))}
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-500 text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Mail size={16} />
                  )}
                  {status === "loading" ? "Inscription..." : "Recevoir les offres"}
                </button>

                <p className="text-xs text-center text-gray-400">
                  Gratuit · Désabonnement en 1 clic · Aucun spam
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
