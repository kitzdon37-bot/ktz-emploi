"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, CheckCircle, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-start justify-center px-4 pt-16 pb-16">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-orange-500 p-2 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">KTZ<span className="text-orange-500"> Emploi</span></span>
        </div>

        {sent ? (
          /* ─── Email envoyé ─── */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
            <p className="text-gray-500 mb-2">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-sm text-gray-400 mb-8">
              Vérifiez aussi vos spams.
            </p>

            {/* Dev helper : lien visible dans console */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-semibold text-amber-700 mb-1">Mode développement</p>
              <p className="text-xs text-amber-600">
                Si le SMTP n&apos;est pas configuré, le lien de réinitialisation s&apos;affiche dans le <strong>terminal</strong> (console du serveur).
              </p>
            </div>

            <Link
              href="/connexion"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* ─── Formulaire ─── */
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié ?</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Envoyer le lien de réinitialisation
              </button>
            </form>

            <div className="text-center mt-6">
              <Link
                href="/connexion"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
