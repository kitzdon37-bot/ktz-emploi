"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLANS, PlanKey } from "@/lib/plans";
import { Check, X, CreditCard, Clock, CheckCircle, AlertCircle, Loader2, Star, Zap, Building2 } from "lucide-react";
import Link from "next/link";

interface Props {
  currentPlan: string;
  status: string;
  endDate: string | null;
  paymentRef: string | null;
  activeJobs: number;
  defaultPlan: string | null;
}

const ORANGE_MONEY_NUMBER = "+236 75 00 00 00"; // À remplacer par le vrai numéro
const AIRTEL_MONEY_NUMBER = "+236 70 00 00 00"; // À remplacer par le vrai numéro

const PLAN_ICONS: Record<string, React.ElementType> = {
  FREE: Building2,
  STARTER: Zap,
  PRO: Star,
};

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: "Actif", color: "bg-green-100 text-green-700", icon: CheckCircle },
  PENDING: { label: "En attente de validation", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  EXPIRED: { label: "Expiré", color: "bg-red-100 text-red-700", icon: AlertCircle },
  CANCELLED: { label: "Annulé", color: "bg-gray-100 text-gray-500", icon: X },
};

export default function AbonnementClient({ currentPlan, status, endDate, paymentRef, activeJobs, defaultPlan }: Props) {
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(
    defaultPlan && ["STARTER", "PRO"].includes(defaultPlan) ? (defaultPlan as PlanKey) : null
  );
  const [paymentMethod, setPaymentMethod] = useState<"orange_money" | "airtel_money">("orange_money");
  const [ref, setRef] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const plan = PLANS[currentPlan as PlanKey] ?? PLANS.FREE;
  const st = STATUS_BADGE[status] ?? STATUS_BADGE.ACTIVE;
  const StatusIcon = st.icon;
  const PlanIcon = PLAN_ICONS[currentPlan] ?? Building2;

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan || !ref.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, paymentRef: ref.trim(), paymentMethod }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erreur");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon abonnement</h1>

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
              <PlanIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Plan actuel</p>
              <p className="text-xl font-bold text-gray-900">{plan.name}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${st.color}`}>
            <StatusIcon className="h-4 w-4" />
            {st.label}
          </span>
        </div>

        {endDate && status === "ACTIVE" && (
          <p className="text-sm text-gray-500 mt-4">
            Renouvellement le <strong>{new Date(endDate).toLocaleDateString("fr-FR")}</strong>
          </p>
        )}

        {status === "PENDING" && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <strong>Paiement en cours de vérification.</strong> Votre abonnement sera activé sous 24h après confirmation du paiement.
            {paymentRef && <span className="block mt-1 text-yellow-700">Référence : <code className="font-mono">{paymentRef}</code></span>}
          </div>
        )}

        {/* Usage */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Offres actives</p>
            <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
            <p className="text-xs text-gray-400">/ {plan.maxJobs === 999 ? "∞" : plan.maxJobs} autorisées</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">CVthèque</p>
            <p className="text-sm font-semibold mt-1">{plan.cvtheque ? <span className="text-green-600">✓ Inclus</span> : <span className="text-gray-400">✗ Non inclus</span>}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Offres à la une</p>
            <p className="text-sm font-semibold mt-1">{plan.featured ? <span className="text-green-600">✓ Inclus</span> : <span className="text-gray-400">✗ Non inclus</span>}</p>
          </div>
        </div>
      </div>

      {/* Upgrade section */}
      {currentPlan !== "PRO" && status !== "PENDING" && !success && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">Passer à un plan supérieur</h2>

          {/* Plan selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {(["STARTER", "PRO"] as PlanKey[]).filter(k => {
              if (currentPlan === "STARTER") return k === "PRO";
              return true;
            }).map((key) => {
              const p = PLANS[key];
              const Icon = PLAN_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPlan(key)}
                  className={`text-left border-2 rounded-2xl p-5 transition-all ${
                    selectedPlan === key
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${selectedPlan === key ? "text-orange-500" : "text-gray-500"}`} />
                    <span className="font-semibold text-gray-900">{p.name}</span>
                    <span className="ml-auto text-lg font-bold text-gray-900">{p.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">XAF/mois</span></span>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {p.features.slice(0, 3).map(f => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment form */}
          {selectedPlan && (
            <form onSubmit={handleSubscribe} className="space-y-5 border-t border-gray-100 pt-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>Comment payer ?</strong>
                <ol className="mt-2 space-y-1 list-decimal list-inside text-blue-700">
                  <li>Envoyez <strong>{PLANS[selectedPlan].price.toLocaleString()} XAF</strong> par Mobile Money</li>
                  <li>Orange Money : <strong>{ORANGE_MONEY_NUMBER}</strong></li>
                  <li>Airtel Money : <strong>{AIRTEL_MONEY_NUMBER}</strong></li>
                  <li>Entrez votre référence de transaction ci-dessous</li>
                </ol>
              </div>

              {/* Payment method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "orange_money", label: "Orange Money", emoji: "🟠" },
                    { value: "airtel_money", label: "Airtel Money", emoji: "🔴" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPaymentMethod(opt.value as "orange_money" | "airtel_money")}
                      className={`flex items-center gap-2 border-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        paymentMethod === opt.value
                          ? "border-orange-400 bg-orange-50 text-orange-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ref */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Référence de transaction <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ref}
                  onChange={e => setRef(e.target.value)}
                  required
                  placeholder="Ex : MM240120123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-gray-400 mt-1">Le numéro de confirmation reçu par SMS après le paiement.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !ref.trim()}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <CreditCard className="h-4 w-4" />
                Envoyer ma demande d&apos;abonnement
              </button>
            </form>
          )}
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800 mb-1">Demande envoyée !</h3>
          <p className="text-green-700 text-sm">Votre abonnement sera activé sous 24h après vérification du paiement.</p>
        </div>
      )}

      {/* See all plans */}
      <div className="text-center mt-4">
        <Link href="/tarifs" className="text-sm text-orange-500 hover:underline">
          Voir tous les tarifs →
        </Link>
      </div>
    </div>
  );
}
