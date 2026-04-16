"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  label?: string;
  callbackUrl?: string;
}

export default function GoogleSignInButton({ label = "Continuer avec Google", callbackUrl = "/tableau-de-bord" }: Props) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null); // null = checking

  // Vérifie si le provider Google est bien configuré côté serveur
  useEffect(() => {
    getProviders().then((providers) => {
      setAvailable(!!providers?.google);
    });
  }, []);

  async function handleClick() {
    if (!available) return;
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setLoading(false);
    }
  }

  // Ne pas afficher le bouton si Google n'est pas configuré
  if (available === false) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || available === null}
      className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {label}
    </button>
  );
}

// Bannière affichée à la place du bouton quand Google n'est pas encore configuré (dev uniquement)
export function GoogleNotConfigured() {
  return (
    <div className="w-full flex items-center gap-3 border border-yellow-200 bg-yellow-50 text-yellow-700 px-4 py-3 rounded-xl text-sm">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>Connexion Google non configurée — ajoutez <strong>GOOGLE_CLIENT_ID</strong> dans votre <code className="bg-yellow-100 px-1 rounded">.env</code></span>
    </div>
  );
}
