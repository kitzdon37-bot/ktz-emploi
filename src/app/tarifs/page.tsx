import Link from "next/link";
import { Check, X, Zap, Building2, Star, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PLAN_ICONS = {
  FREE: Building2,
  MICRO: Sparkles,
  STARTER: Zap,
  PRO: Star,
};

const PLAN_STYLES = {
  FREE:    { border: "border-gray-200",                              badge: "bg-gray-100 text-gray-700",   btn: "bg-gray-800 hover:bg-gray-900 text-white" },
  MICRO:   { border: "border-green-200 ring-1 ring-green-200",       badge: "bg-green-100 text-green-700", btn: "bg-green-600 hover:bg-green-700 text-white" },
  STARTER: { border: "border-blue-200 ring-1 ring-blue-200",         badge: "bg-blue-100 text-blue-700",   btn: "bg-blue-600 hover:bg-blue-700 text-white" },
  PRO:     { border: "border-orange-300 ring-2 ring-orange-400",     badge: "bg-orange-100 text-orange-700", btn: "bg-orange-500 hover:bg-orange-600 text-white" },
};

export default async function TarifsPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block bg-orange-50 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full border border-orange-200 mb-4">
          Tarifs simples et transparents
        </span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Recrutez les meilleurs talents en RCA
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Des tarifs adaptés à toutes les tailles d&apos;entreprise. Dès <strong className="text-green-600">10 000 XAF / mois</strong>.<br />
          Paiement par Orange Money ou Airtel Money.
        </p>
      </div>

      {/* Plans — 4 colonnes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const style = PLAN_STYLES[key];
          const Icon = PLAN_ICONS[key];
          const isPopular = key === "PRO";
          const isBest = key === "MICRO";

          return (
            <div
              key={key}
              className={`relative bg-white rounded-2xl border p-6 flex flex-col ${style.border} ${isPopular ? "shadow-lg" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow whitespace-nowrap">
                  LE PLUS POPULAIRE
                </div>
              )}
              {isBest && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow whitespace-nowrap">
                  PETITES ENTREPRISES
                </div>
              )}

              {/* Header */}
              <div className="mb-5">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${style.badge}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {plan.price === 0 ? "Gratuit" : plan.price.toLocaleString()}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 text-sm mb-1"> XAF/mois</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </div>
                ))}
                {plan.limits.map((l) => (
                  <div key={l} className="flex items-start gap-2 text-sm text-gray-400">
                    <X className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    {l}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href={
                  key === "FREE"
                    ? isLoggedIn ? "/tableau-de-bord" : "/inscription?role=employer"
                    : `/tableau-de-bord/abonnement?plan=${key}`
                }
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${style.btn}`}
              >
                {key === "FREE"
                  ? isLoggedIn ? "Accéder au tableau de bord" : "Commencer gratuitement"
                  : `Choisir ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Comparaison rapide */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 mb-12 overflow-x-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">Comparaison des plans</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Fonctionnalité</th>
              {Object.entries(PLANS).map(([key, plan]) => (
                <th key={key} className="text-center py-2 px-3 font-bold text-gray-900">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { label: "Offres actives", values: ["1", "3", "10", "Illimitées"] },
              { label: "Durée de visibilité", values: ["15 j", "30 j", "30 j", "60 j"] },
              { label: "Prix/mois", values: ["Gratuit", "10 000 XAF", "70 000 XAF", "100 000 XAF"] },
              { label: "CVthèque", values: [false, false, true, true] },
              { label: "Offres à la une", values: [false, false, false, true] },
              { label: "Analytics", values: [false, false, true, true] },
              { label: "Modèles d'offres", values: [false, false, true, true] },
              { label: "Badge Super Recruteur", values: [false, false, false, true] },
            ].map(({ label, values }) => (
              <tr key={label}>
                <td className="py-2.5 pr-4 text-gray-600">{label}</td>
                {values.map((v, i) => (
                  <td key={i} className="text-center py-2.5 px-3">
                    {typeof v === "boolean"
                      ? v ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-gray-300 mx-auto" />
                      : <span className="font-medium text-gray-800">{v}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Paiement facile via Mobile Money</h2>
        <p className="text-gray-500 text-sm mb-6">
          Payez par Orange Money ou Airtel Money. L&apos;activation est manuelle sous 24h après réception.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
            <span className="text-2xl">🟠</span>
            <span className="font-semibold text-gray-700">Orange Money</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3">
            <span className="text-2xl">🔴</span>
            <span className="font-semibold text-gray-700">Airtel Money</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "Comment payer ?",
              a: "Choisissez votre plan, puis envoyez le montant par Orange Money ou Airtel Money au numéro indiqué. Entrez votre référence de transaction dans le formulaire. L'activation se fait sous 24h.",
            },
            {
              q: "Le plan Micro est-il fait pour moi ?",
              a: "Oui si vous êtes une boutique, un restaurant, un salon, une petite association ou un entrepreneur individuel. 10 000 XAF/mois pour publier jusqu'à 3 offres, c'est le tarif le plus accessible du marché.",
            },
            {
              q: "Puis-je changer de plan ?",
              a: "Oui, vous pouvez passer à un plan supérieur à tout moment. Le nouveau plan démarre dès validation du paiement.",
            },
            {
              q: "Y a-t-il un engagement ?",
              a: "Non, tous les abonnements sont mensuels et sans engagement. Vous pouvez arrêter à tout moment.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
