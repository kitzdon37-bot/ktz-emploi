"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

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

  const [role, setRole] = useState(defaultRole);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [acceptCgu, setAcceptCgu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  function toggleContract(type: string) {
    setContractTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptCgu) {
      setError("Vous devez accepter les CGU pour continuer.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName,
          jobTitle,
          location,
          contractTypes: contractTypes.join(","),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/tableau-de-bord");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-start justify-center px-4 pt-10 pb-16">
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
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6 text-sm text-indigo-800 leading-relaxed">
          En vous inscrivant à KTZ Emploi, nous vous aidons à trouver <strong>VOTRE</strong> job :
          <br />
          <strong>Offres personnalisées, gestion des candidatures, messages directs des recruteurs...</strong>
        </div>

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

          {/* Email + Password */}
          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {role === "employer" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                placeholder="Ex : Ecobank RCA, ONG Espoir..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
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
