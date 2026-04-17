"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Eye, EyeOff, Loader2, CheckCircle, XCircle, KeyRound } from "lucide-react";

function getStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  if (pwd.length < 6) return { score: 1, label: "Trop court", color: "bg-red-400" };
  let s = 1;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return {
    score: s,
    label: ["", "Faible", "Faible", "Moyen", "Fort", "Très fort"][s],
    color: ["", "bg-red-400", "bg-red-400", "bg-yellow-400", "bg-orange-400", "bg-green-500"][s],
  };
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const strength = getStrength(password);
  const match = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) { setError("Les mots de passe ne correspondent pas."); return; }
    if (!token) { setError("Lien invalide."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setDone(true);
        setTimeout(() => router.push("/connexion"), 3000);
      }
    } finally {
      setLoading(false);
    }
  }

  // Token absent dans l'URL
  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
        <p className="text-gray-500 text-sm mb-6">
          Ce lien de réinitialisation est invalide ou a expiré.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Mot de passe mis à jour !</h1>
        <p className="text-gray-500 text-sm mb-1">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <p className="text-sm text-gray-400 mb-6">Redirection vers la connexion...</p>
        <Link
          href="/connexion"
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-colors"
        >
          Se connecter maintenant
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound className="h-7 w-7 text-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h1>
        <p className="text-gray-500 text-sm">Choisissez un mot de passe sécurisé d&apos;au moins 6 caractères.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-11 transition"
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {/* Jauge de force */}
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
            </div>
          )}
        </div>

        {/* Confirmation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 pr-11 transition ${
                mismatch ? "border-red-300 focus:ring-red-300" :
                match ? "border-green-300 focus:ring-green-300" :
                "border-gray-300 focus:ring-orange-400"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {mismatch && <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>}
          {match && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Les mots de passe correspondent</p>}
        </div>

        <button
          type="submit"
          disabled={loading || mismatch || password.length < 6}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer le nouveau mot de passe
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div className="text-center text-gray-400">Chargement...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
