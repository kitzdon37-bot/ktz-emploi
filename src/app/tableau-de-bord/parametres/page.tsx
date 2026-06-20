"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Settings, Shield, Bell, Trash2, CheckCircle } from "lucide-react";

type Prefs = {
  cvPublic: boolean;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
};

export default function ParametresPage() {
  const { data: session } = useSession();
  const isEmployer = (session?.user as { role?: string })?.role === "EMPLOYER";
  const [prefs, setPrefs] = useState<Prefs>({ cvPublic: false, whatsappOptIn: false, smsOptIn: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setPrefs({
            cvPublic: data.profile.cvPublic ?? false,
            whatsappOptIn: data.profile.whatsappOptIn ?? false,
            smsOptIn: data.profile.smsOptIn ?? false,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggle(key: keyof Prefs) {
    const newVal = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: newVal }));
    setSaving(key);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: newVal }),
      });
      if (!res.ok) throw new Error();
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      // rollback en cas d'erreur
      setPrefs((p) => ({ ...p, [key]: !newVal }));
    } finally {
      setSaving(null);
    }
  }

  function Toggle({ field }: { field: keyof Prefs }) {
    const on = prefs[field];
    const isSaving = saving === field;
    return (
      <button
        type="button"
        onClick={() => toggle(field)}
        disabled={loading || isSaving}
        aria-checked={on}
        role="switch"
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${
          on ? "bg-orange-500" : "bg-gray-200"
        } disabled:opacity-60`}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    );
  }

  function SavedBadge({ field }: { field: string }) {
    if (savedKey !== field) return null;
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium animate-fade-in">
        <CheckCircle className="h-3.5 w-3.5" /> Sauvegardé
      </span>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Paramètres</h1>
      <p className="text-gray-500 mb-6">Gérez votre compte et vos préférences.</p>

      <div className="space-y-4">

        {/* ── Mon compte ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-4 w-4 text-orange-500" /> Mon compte
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">Nom</p>
                <p className="text-sm text-gray-500">{session?.user?.name ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">Email</p>
                <p className="text-sm text-gray-500">{session?.user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Mot de passe</p>
                <p className="text-sm text-gray-500">••••••••</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Confidentialité — candidats uniquement ─────────────────── */}
        {!isEmployer && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" /> Confidentialité
            </h2>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-gray-800">Profil visible par les recruteurs</p>
                  <p className="text-xs text-gray-400">Les recruteurs peuvent trouver votre CV dans la CVthèque</p>
                </div>
                <div className="flex items-center gap-3">
                  <SavedBadge field="cvPublic" />
                  <Toggle field="cvPublic" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Notifications ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-500" /> Notifications
          </h2>
          <div className="space-y-1">

            {/* WhatsApp */}
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-800">Notifications WhatsApp</p>
                <p className="text-xs text-gray-400">
                  {isEmployer
                    ? "Recevez une alerte WhatsApp à chaque nouvelle candidature"
                    : "Recevez les mises à jour de vos candidatures et nouvelles offres sur WhatsApp"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SavedBadge field="whatsappOptIn" />
                <Toggle field="whatsappOptIn" />
              </div>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between py-3">
              <div className="flex-1 pr-4">
                <p className="text-sm font-medium text-gray-800">Notifications SMS</p>
                <p className="text-xs text-gray-400">
                  {isEmployer
                    ? "Recevez des alertes SMS pour les nouvelles candidatures reçues"
                    : "Recevez des alertes emploi par SMS (si votre numéro est renseigné)"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SavedBadge field="smsOptIn" />
                <Toggle field="smsOptIn" />
              </div>
            </div>

          </div>
        </div>

        {/* ── Zone de danger ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h2 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Zone de danger
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront effacées.
          </p>
          <button className="text-sm text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
            Supprimer mon compte
          </button>
        </div>

      </div>
    </div>
  );
}
