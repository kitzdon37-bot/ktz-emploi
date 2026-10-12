"use client";

import { useState } from "react";
import { KeyRound, Loader2, X, Copy, Check, Mail, Wand2, Eye, EyeOff } from "lucide-react";

interface Props {
  user: { id: string; name: string | null; email: string | null; hasPassword?: boolean };
  onClose: () => void;
}

export default function PasswordModal({ user, onClose }: Props) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<"set" | "link" | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ mode: "set" | "link"; password?: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(mode: "set" | "link") {
    setError("");
    if (mode === "set" && password && password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (mode === "link" && !confirm(`Envoyer un lien de réinitialisation à ${user.email} ?`)) return;

    setLoading(mode);
    try {
      const res = await fetch("/api/admin/users/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, mode, ...(mode === "set" && password ? { password } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur serveur"); return; }
      setResult(data);
      setPassword("");
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* presse-papiers indisponible */ }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900">Mot de passe</h3>
              <p className="text-sm text-gray-500 truncate">{user.name ?? "—"} · {user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          result.mode === "set" ? (
            <div className="space-y-3">
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                Mot de passe modifié. Transmettez-le à l&apos;utilisateur : il ne sera plus affiché ensuite.
              </p>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                <code className="flex-1 text-sm font-mono text-gray-900 break-all">{result.password}</code>
                <button
                  onClick={() => copy(`Email : ${result.email}\nMot de passe : ${result.password}`)}
                  className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Conseillez-lui de le changer dès sa connexion (Paramètres → Mot de passe).
              </p>
            </div>
          ) : (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              Lien envoyé à <strong>{result.email}</strong>. Il est valable 1 heure.
            </p>
          )
        ) : (
          <div className="space-y-5">
            {!user.hasPassword && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                Ce compte n&apos;a pas encore de mot de passe (connexion Google). En définir un lui permettra aussi de se connecter par email.
              </p>
            )}

            {/* Option 1 : lien par email (recommandé) */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Option recommandée</p>
              <p className="text-xs text-gray-500 mb-2">L&apos;utilisateur choisit lui-même son nouveau mot de passe via un lien reçu par email.</p>
              <button
                onClick={() => submit("link")}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading === "link" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Envoyer un lien de réinitialisation
              </button>
            </div>

            <div className="border-t border-gray-100" />

            {/* Option 2 : définir directement */}
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Définir un nouveau mot de passe</p>
              <p className="text-xs text-gray-500 mb-2">Laissez vide pour en générer un automatiquement.</p>
              <div className="relative mb-2">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe (8 caractères min.)"
                  autoComplete="new-password"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={() => submit("set")}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading === "set" ? <Loader2 className="h-4 w-4 animate-spin" /> : password ? <KeyRound className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                {password ? "Enregistrer ce mot de passe" : "Générer un mot de passe"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
        )}
      </div>
    </div>
  );
}
