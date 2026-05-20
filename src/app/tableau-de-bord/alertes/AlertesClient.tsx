"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus, X, Briefcase, MapPin, Loader2 } from "lucide-react";
import AutocompleteInput from "@/components/AutocompleteInput";
import { SUGGESTED_JOB_TITLES, SUGGESTED_LOCATIONS } from "@/lib/suggestions";

interface Alert {
  id: string;
  keywords: string;
  location: string | null;
  frequency: string;
  createdAt: string;
}

interface Props {
  initialAlerts: Alert[];
}

const FREQ_LABELS: Record<string, string> = {
  instant: "Immédiat",
  daily: "Quotidien",
  weekly: "Hebdomadaire",
};

export default function AlertesClient({ initialAlerts }: Props) {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!keywords.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: keywords.trim(), location: location.trim() || null, frequency }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la création");
        return;
      }

      setAlerts((prev) => [data.alert, ...prev]);
      setKeywords("");
      setLocation("");
      setFrequency("daily");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAlert(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la suppression");
        return;
      }

      setAlerts((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes alertes emploi</h1>
          <p className="text-gray-500 mt-0.5">Soyez notifié dès qu&apos;une offre correspond à votre recherche.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Créer une alerte
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Nouvelle alerte</h2>
          <form onSubmit={addAlert} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> Mots-clés
                  </span>
                </label>
                <AutocompleteInput
                  value={keywords}
                  onChange={setKeywords}
                  required
                  placeholder="Comptable, CDI, ONG..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  staticSuggestions={SUGGESTED_JOB_TITLES}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Lieu
                  </span>
                </label>
                <AutocompleteInput
                  value={location}
                  onChange={setLocation}
                  placeholder="Bangui, toute la RCA..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  staticSuggestions={SUGGESTED_LOCATIONS}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fréquence de notification</label>
              <div className="flex gap-2">
                {[
                  { value: "instant", label: "Immédiat" },
                  { value: "daily", label: "Quotidien" },
                  { value: "weekly", label: "Hebdomadaire" },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrequency(f.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      frequency === f.value
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "border-gray-200 text-gray-600 hover:border-orange-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Créer l&apos;alerte
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des alertes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">
          Vos alertes actives{" "}
          <span className="text-sm font-normal text-gray-400">({alerts.length})</span>
        </h2>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{alert.keywords}</p>
                  <p className="text-xs text-gray-500">
                    {alert.location ? `📍 ${alert.location} · ` : ""}
                    🔔 {FREQ_LABELS[alert.frequency] ?? alert.frequency}
                  </p>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  disabled={deletingId === alert.id}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
                  title="Supprimer l'alerte"
                >
                  {deletingId === alert.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Aucune alerte configurée</p>
            <p className="text-sm mt-1">Créez une alerte pour recevoir les nouvelles offres en temps réel</p>
          </div>
        )}
      </div>
    </div>
  );
}
