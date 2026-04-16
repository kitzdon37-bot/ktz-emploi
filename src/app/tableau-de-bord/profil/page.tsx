"use client";

import { useState, useEffect } from "react";
import { User, MapPin, Phone, Briefcase, FileText, Star, Loader2, CheckCircle } from "lucide-react";

interface Profile {
  title?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  skills?: string | null;
  experience?: string | null;
  education?: string | null;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function update(field: keyof Profile, value: string) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  // Completion score
  const fields: (keyof Profile)[] = ["title", "bio", "phone", "location", "skills", "experience", "education"];
  const filled = fields.filter((f) => !!profile[f]).length;
  const pct = Math.round((filled / fields.length) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mon profil</h1>
      <p className="text-gray-500 mb-6">Un profil complet augmente vos chances d&apos;être contacté par les recruteurs.</p>

      {/* Completion bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Complétude du profil</span>
          <span className="text-sm font-bold text-orange-500">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct < 100 && (
          <p className="text-xs text-gray-400 mt-2">
            Complétez les {fields.length - filled} champ(s) restant(s) pour un profil 100% visible.
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Titre / poste */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-orange-500" /> Informations professionnelles
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intitulé de poste</label>
              <input
                type="text"
                value={profile.title || ""}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Ex: Comptable, Développeur web, Logisticien..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Résumé professionnel</label>
              <textarea
                value={profile.bio || ""}
                onChange={(e) => update("bio", e.target.value)}
                rows={4}
                placeholder="Décrivez votre parcours, vos compétences clés et vos objectifs professionnels..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-orange-500" /> Coordonnées
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="h-3.5 w-3.5 inline mr-1" />Téléphone
              </label>
              <input
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+236 77 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />Localisation
              </label>
              <input
                type="text"
                value={profile.location || ""}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Bangui, Berberati..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Compétences */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-orange-500" /> Compétences
          </h2>
          <textarea
            value={profile.skills || ""}
            onChange={(e) => update("skills", e.target.value)}
            rows={3}
            placeholder="Ex: Excel, SAP, Gestion de projet, Français (courant), Anglais (intermédiaire)..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Expériences */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" /> Expériences professionnelles
          </h2>
          <textarea
            value={profile.experience || ""}
            onChange={(e) => update("experience", e.target.value)}
            rows={5}
            placeholder="Décrivez vos expériences : poste, entreprise, durée, réalisations..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        {/* Formation */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-500" /> Formation
          </h2>
          <textarea
            value={profile.education || ""}
            onChange={(e) => update("education", e.target.value)}
            rows={3}
            placeholder="Ex: Licence Comptabilité, Université de Bangui, 2021..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saved && <CheckCircle className="h-4 w-4" />}
          {saved ? "Profil sauvegardé !" : "Sauvegarder mon profil"}
        </button>
      </form>
    </div>
  );
}
