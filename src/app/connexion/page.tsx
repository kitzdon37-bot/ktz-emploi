"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Eye, EyeOff, Loader2, Zap } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const TEST_ACCOUNTS = [
  { label: "Candidat", email: "amara.kette@gmail.com", password: "seeker123", color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { label: "Recruteur", email: "rh@ong-humanitas.cf", password: "employer123", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tableau-de-bord";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(acc: typeof TEST_ACCOUNTS[0]) {
    setQuickLoading(acc.label);
    const result = await signIn("credentials", {
      email: acc.email,
      password: acc.password,
      redirect: false,
    });
    if (result?.ok) {
      router.push("/tableau-de-bord");
      router.refresh();
    } else {
      setQuickLoading(null);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-start justify-center px-4 pt-10 pb-16">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-orange-500 p-2 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">KTZ<span className="text-orange-500"> Emploi</span></span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link href="/inscription" className="flex-1 text-center pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            S&apos;inscrire
          </Link>
          <button className="flex-1 text-center pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
            Se connecter
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5 text-sm text-indigo-800 leading-relaxed">
          <span className="font-semibold">Ravi de vous retrouver sur KTZ Emploi !</span>
          <br />Retrouvez toutes vos offres et candidatures en vous connectant.
        </div>

        {/* Google */}
        <GoogleSignInButton label="Se connecter avec Google" callbackUrl={callbackUrl} />

        {/* Séparateur */}
        <div className="flex items-center gap-3 my-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* Comptes de test rapides */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" /> Connexion rapide (comptes de démonstration)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => quickLogin(acc)}
                disabled={!!quickLoading}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${acc.color} disabled:opacity-60`}
              >
                {quickLoading === acc.label ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Séparateur */}
        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou avec votre email</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-11 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rememberMe ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${rememberMe ? "translate-x-4" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-gray-600">Rester connecté·e</span>
            </label>
            <Link href="/mot-de-passe-oublie" className="text-sm text-orange-500 hover:underline font-medium">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Je me connecte
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
