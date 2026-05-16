"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Briefcase, Eye, EyeOff, Loader2, MessageCircle, Mail, X } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { JOB_CATEGORIES, RCA_LOCATIONS } from "@/lib/utils";

const CONTRACT_TYPES = ["CDI", "CDD", "Stage", "Alternance", "Freelance", "Bénévolat"];

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: "", color: "" };
  if (pwd.length < 6) return { score: 1, label: "Trop court", color: "bg-red-400" };
  let score = 1;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const labels = ["", "Faible", "Faible", "Moyen", "Fort", "Très fort"];
  const colors = ["", "bg-red-400", "bg-red-400", "bg-yellow-400", "bg-orange-400", "bg-green-500"];
  return { score, label: labels[score], color: colors[score] };
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "employer" ? "employer" : "jobseeker";
  const defaultEmail = searchParams.get("email") ?? "";
  const defaultPhone = searchParams.get("phone") ?? "";
  const phonePreVerified = searchParams.get("verified") === "1";

  // Méthode d'inscription
  const [method, setMethod] = useState<"email" | "whatsapp">(defaultPhone ? "whatsapp" : "email");

  // WhatsApp OTP
  const [waPhone, setWaPhone] = useState(defaultPhone);
  const [otpStep, setOtpStep] = useState(phonePreVerified);
  const [phoneVerified, setPhoneVerified] = useState(phonePreVerified);
  const [otp, setOtp] = useState("");

  const [role, setRole] = useState(defaultRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [companyLocation, setCompanyLocation] = useState("Bangui");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWaPopup, setShowWaPopup] = useState(false);

  useEffect(() => {
    if (role !== "jobseeker" || method !== "email") return;
    const timer = setTimeout(() => setShowWaPopup(true), 1500);
    return () => clearTimeout(timer);
  }, [role, method]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waPhone }),
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
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waPhone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Code invalide"); return; }
      if (data.exists) {
        // Compte déjà existant → connexion
        router.push(`/connexion?phone=${encodeURIComponent(waPhone)}`);
        return;
      }
      setPhoneVerified(true);
    } catch {
      setError("Erreur de vérification.");
    } finally {
      setLoading(false);
    }
  }

  const strength = getPasswordStrength(password);

  function toggleContract(type: string) {
    setContractTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptCgu) { setError("Vous devez accepter les CGU pour continuer."); return; }
    setError("");
    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();

      // ── Inscription WhatsApp ───────────────────────────────────────────────
      if (method === "whatsapp" && phoneVerified) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, phone: waPhone, phoneVerified: true, role,
            companyName, companySector, companyLocation, companyWebsite, companyDescription,
            jobTitle, location, contractTypes: contractTypes.join(","), isDisabled: role === "jobseeker" ? isDisabled : false,
          }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur inscription"); return; }

        // Connecter via provider phone — on envoie un OTP de session
        const sendRes = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: waPhone }),
        });
        const sendData = await sendRes.json();
        if (!sendRes.ok) { setError("Compte créé ! Connectez-vous depuis /connexion"); return; }

        // Afficher l'entrée OTP pour la connexion finale
        setOtpStep(true);
        setPhoneVerified(false); // reset pour flux connexion
        setOtp("");
        setError("Compte créé ! Un code WhatsApp vous a été envoyé pour vous connecter.");
        return;
      }

      // ── Inscription Email ─────────────────────────────────────────────────
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password, role,
          phone: phone.trim() || null,
          whatsappOptIn: role === "jobseeker" ? whatsappOptIn : false,
          companyName, companySector, companyLocation, companyWebsite, companyDescription,
          jobTitle, location, contractTypes: contractTypes.join(","),
          isDisabled: role === "jobseeker" ? isDisabled : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur lors de l'inscription"); return; }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-start justify-center px-4 pt-10 pb-16">

      {/* WhatsApp info popup */}
      {showWaPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowWaPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* WhatsApp icon */}
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 mx-auto mb-4">
              <MessageCircle className="h-7 w-7 text-emerald-600" />
            </div>

            <h2 className="text-center text-gray-900 font-bold text-lg mb-2">
              Recevez les offres sur WhatsApp 🎉
            </h2>
            <p className="text-center text-gray-500 text-sm leading-relaxed mb-5">
              Saviez-vous que vous pouvez recevoir les nouvelles offres d&apos;emploi{" "}
              <strong className="text-gray-700">directement sur WhatsApp</strong> ?<br /><br />
              Ajoutez simplement votre numéro lors de l&apos;inscription et activez l&apos;option — vous serez alerté en temps réel !
            </p>

            <button
              onClick={() => setShowWaPopup(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              J&apos;ai compris !
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-[520px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-orange-500 p-2 rounded-xl">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">KTZ<span className="text-orange-500"> Emploi</span></span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="flex-1 text-center pb-3 text-sm font-semibold text-gray-900 border-b-2 border-gray-900 -mb-px">
            S&apos;inscrire
          </button>
          <Link
            href="/connexion"
            className="flex-1 text-center pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>

        {/* Info banner */}
        {defaultEmail ? (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6 text-sm text-orange-800 leading-relaxed">
            Aucun compte trouvé pour <strong>{defaultEmail}</strong>. Créez votre compte en quelques secondes.
          </div>
        ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6 text-sm text-indigo-800 leading-relaxed">
          En vous inscrivant à KTZ Emploi, nous vous aidons à trouver <strong>VOTRE</strong> job :
          <br />
          <strong>Offres personnalisées, gestion des candidatures, messages directs des recruteurs...</strong>
        </div>
        )}

        {/* Méthode : Email ou WhatsApp */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button type="button" onClick={() => { setMethod("email"); setError(""); setOtpStep(false); setPhoneVerified(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              method === "email" ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <Mail className="h-4 w-4" /> Email
          </button>
          <button type="button" onClick={() => { setMethod("whatsapp"); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              method === "whatsapp" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>

        {/* Étape OTP WhatsApp — avant le formulaire complet */}
        {method === "whatsapp" && !phoneVerified && (
          <div className="mb-6">
            {!otpStep ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
                  Entrez votre numéro WhatsApp. Nous vous enverrons un code de vérification.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro WhatsApp</label>
                  <input type="tel" value={waPhone} onChange={(e) => setWaPhone(e.target.value)} required placeholder="+236 77 00 00 00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  Envoyer le code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
                  Code envoyé sur <strong>{waPhone}</strong>. Valable 10 minutes.
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Code à 6 chiffres</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required placeholder="· · · · · ·"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-center tracking-[0.5em] text-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition" />
                </div>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Vérifier le code
                </button>
                <button type="button" onClick={() => { setOtpStep(false); setOtp(""); setError(""); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">← Changer de numéro</button>
              </form>
            )}
          </div>
        )}

        {/* Google — seulement pour l'inscription email */}
        {method === "email" && <GoogleSignInButton label="S'inscrire avec Google" />}

        {method === "email" && <div className="flex items-center gap-3 my-1">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400 font-medium">ou</span>
          <hr className="flex-1 border-gray-200" />
        </div>}

        {/* Role switcher */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole("jobseeker")}
            className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              role === "jobseeker"
                ? "border-orange-400 bg-orange-50 text-orange-600"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Je cherche un emploi
          </button>
          <button
            type="button"
            onClick={() => setRole("employer")}
            className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
              role === "employer"
                ? "border-orange-400 bg-orange-50 text-orange-600"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            Je recrute
          </button>
        </div>

        {/* Formulaire principal — visible si email OU si WhatsApp vérifié */}
        {(method === "email" || (method === "whatsapp" && phoneVerified)) && <>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email + Password — seulement pour méthode email */}
          {method === "email" && <div className="grid grid-cols-2 gap-3">
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
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{strength.label}</p>
                </div>
              )}
            </div>
          </div>}

          {/* Indicateur numéro vérifié pour WhatsApp */}
          {method === "whatsapp" && phoneVerified && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              Numéro <strong>{waPhone}</strong> vérifié ✓
            </div>
          )}

          {role === "employer" ? (
            <div className="space-y-4">
              {/* Nom entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Ex : Ecobank RCA, ONG Espoir..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              {/* Secteur + Localisation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d&apos;activité</label>
                  <select
                    value={companySector}
                    onChange={(e) => setCompanySector(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition"
                  >
                    <option value="">Choisir...</option>
                    {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
                  <select
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white transition"
                  >
                    {RCA_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Site web */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site web <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://www.monentreprise.cf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Présentation de l&apos;entreprise <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez votre entreprise, sa mission, ses valeurs... (visible sur votre profil public)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Métier + Localité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Métier recherché</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Comptable, Développeur..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Localité recherchée</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bangui, Berberati..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Téléphone WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro WhatsApp <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+236 77 00 00 00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />

                {/* Opt-in WhatsApp — apparaît seulement si numéro saisi */}
                {phone.trim().length >= 8 && (
                  <button
                    type="button"
                    onClick={() => setWhatsappOptIn(v => !v)}
                    className="flex items-center gap-3 mt-3 w-full group"
                  >
                    {/* Toggle */}
                    <div
                      className={`relative rounded-full transition-colors flex-shrink-0 ${whatsappOptIn ? "bg-emerald-500" : "bg-gray-200"}`}
                      style={{ width: "40px", height: "22px" }}
                    >
                      <span
                        className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${whatsappOptIn ? "translate-x-[18px]" : "translate-x-0.5"}`}
                        style={{ width: "18px", height: "18px" }}
                      />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium transition-colors ${whatsappOptIn ? "text-emerald-700" : "text-gray-700"}`}>
                        Recevoir les offres par WhatsApp
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {whatsappOptIn
                          ? "✅ Vous recevrez les nouvelles offres directement sur WhatsApp"
                          : "Soyez alerté dès qu'une offre correspond à votre profil"}
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Contract types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type(s) de contrat</label>
                <div className="flex flex-wrap gap-2">
                  {CONTRACT_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleContract(type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        contractTypes.includes(type)
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-300 text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut travailleur handicapé */}
              <div className="flex items-start gap-2.5">
                <input
                  id="isDisabled"
                  type="checkbox"
                  checked={isDisabled}
                  onChange={(e) => setIsDisabled(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="isDisabled" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  Je bénéficie d&apos;une <strong className="text-gray-800">Reconnaissance de Qualité de Travailleur Handicapé (RQTH)</strong>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    Cette information est confidentielle et nous permet de vous orienter vers des offres adaptées.
                  </span>
                </label>
              </div>
            </>
          )}

          {/* CGU */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="cgu"
              type="checkbox"
              checked={acceptCgu}
              onChange={(e) => setAcceptCgu(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="cgu" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
              J&apos;accepte les{" "}
              <Link href="/cgu" className="text-orange-500 hover:underline font-medium">CGU</Link>{" "}
              et déclare avoir pris connaissance de la{" "}
              <Link href="/confidentialite" className="text-orange-500 hover:underline font-medium">
                politique de protection des données
              </Link>{" "}
              de KTZ Emploi.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !acceptCgu}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white py-3.5 rounded-full font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Je m&apos;inscris
          </button>
        </form>
        </> }
      </div>
    </div>
  );
}

export default function InscriptionPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
