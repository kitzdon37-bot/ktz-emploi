"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Eye, EyeOff, Loader2, MessageCircle, Mail } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [method, setMethod] = useState<"email" | "whatsapp">("email");

  // Email login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // WhatsApp login
  const [phone, setPhone] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result) { setError("Erreur de connexion."); return; }
      if (result.error) {
        if (result.error === "UserNotFound") {
          router.push(`/inscription?email=${encodeURIComponent(email)}`);
          return;
        }
        setError("Email ou mot de passe incorrect.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur envoi OTP"); return; }
      setOtpStep(true);
    } catch {
      setError("Impossible d'envoyer le code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Vérifier l'OTP via l'API
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) { setError(verifyData.error || "Code invalide"); return; }

      if (!verifyData.exists) {
        // Compte inexistant → rediriger vers inscription
        router.push(`/inscription?phone=${encodeURIComponent(phone)}&verified=1`);
        return;
      }

      // Compte existant → connecter via le provider phone
      // On renvoie un nouvel OTP de session pour le signIn
      const sendRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!sendRes.ok) { setError("Erreur de connexion"); return; }

      // On demande à l'utilisateur de saisir à nouveau le code
      setOtp("");
      setError("Un nouveau code a été envoyé pour confirmer la connexion.");

    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
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

        {/* Tabs S'inscrire / Se connecter */}
        <div className="flex border-b border-gray-200 mb-6">
          <Link href="/inscription" className="flex-1 text-center pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            S&apos;inscrire
          </Link>
          <button className="flex-1 text-center pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
            Se connecter
          </button>
        </div>

        {/* Méthode : Email ou WhatsApp */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => { setMethod("email"); setError(""); setOtpStep(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              method === "email" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button
            type="button"
            onClick={() => { setMethod("whatsapp"); setError(""); setOtpStep(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              method === "whatsapp" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>

        {method === "email" && (
          <>
            <GoogleSignInButton label="Se connecter avec Google" callbackUrl={callbackUrl} />
            <div className="flex items-center gap-3 my-4">
              <hr className="flex-1 border-gray-200" />
              <span className="text-xs text-gray-400 font-medium">ou</span>
              <hr className="flex-1 border-gray-200" />
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* Formulaire email */}
        {method === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="current-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-11 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <button type="button" onClick={() => setRememberMe(!rememberMe)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${rememberMe ? "bg-orange-500" : "bg-gray-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${rememberMe ? "translate-x-4" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-gray-600">Rester connecté·e</span>
              </label>
              <Link href="/mot-de-passe-oublie" className="text-sm text-orange-500 hover:underline font-medium">Mot de passe oublié ?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Je me connecte
            </button>
          </form>
        )}

        {/* Formulaire WhatsApp */}
        {method === "whatsapp" && !otpStep && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
              Entrez votre numéro WhatsApp — vous recevrez un code à 6 chiffres pour vous connecter.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+236 77 00 00 00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Envoyer le code
            </button>
          </form>
        )}

        {method === "whatsapp" && otpStep && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
              Code envoyé sur <strong>{phone}</strong> via WhatsApp. Valable 10 minutes.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code à 6 chiffres</label>
              <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required placeholder="· · · · · ·"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center tracking-[0.5em] text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
            </div>
            <button type="submit" disabled={loading || otp.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Vérifier le code
            </button>
            <button type="button" onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
              ← Changer de numéro
            </button>
          </form>
        )}
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
