"use client";

import { useState } from "react";
import { Bell, Plus, X, Briefcase, MapPin } from "lucide-react";

interface Alert {
  id: number;
  keywords: string;
  location: string;
  frequency: string;
}

export default function AlertesPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [showForm, setShowForm] = useState(false);

  function addAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!keywords.trim()) return;
    setAlerts((prev) => [
      ...prev,
      { id: Date.now(), keywords: keywords.trim(), location: location.trim(), frequency },
    ]);
    setKeywords("");
    setLocation("");
    setFrequency("daily");
    setShowForm(false);
  }

  function deleteAlert(id: number) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  const freqLabels: Record<string, string> = {
    instant: "Immédiat",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes alertes emploi</h1>
          <p className="text-gray-500 mt-0.5">Soyez notifié dès qu&apos;une offre correspond à votre recherche.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Créer une alerte
        </button>
      </div>

      {/* Create alert form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Nouvelle alerte</h2>
          <form onSubmit={addAlert} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Mots-clés
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  required
                  placeholder="Comptable, CDI, ONG..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> Lieu
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bangui, toute la RCA..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
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

      {/* Alerts list */}
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
                    🔔 {freqLabels[alert.frequency]}
                  </p>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="h-4 w-4" />
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
