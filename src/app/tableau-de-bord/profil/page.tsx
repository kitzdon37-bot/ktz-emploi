"use client";

import { useState, useEffect, useRef } from "react";
import { User, MapPin, Phone, Briefcase, FileText, Star, Loader2, CheckCircle, Paperclip, X, Upload, Eye, EyeOff, MessageCircle, Bell } from "lucide-react";
import AutocompleteInput from "@/components/AutocompleteInput";
import { SUGGESTED_JOB_TITLES, SUGGESTED_LOCATIONS } from "@/lib/suggestions";

const SECTORS = [
  "Technologie", "Finance", "Santé", "Éducation", "Commerce", "BTP",
  "Agriculture", "Transport", "Hôtellerie", "ONG / Humanitaire",
  "Administration", "Mines & Énergie", "Télécoms", "Autre",
];

interface Profile {
  title?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  skills?: string | null;
  experience?: string | null;
  education?: string | null;
  cv?: string | null;
  cvPublic?: boolean;
  smsOptIn?: boolean;
  whatsappOptIn?: boolean;
  notifCategories?: string | null; // JSON array
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvSaved, setCvSaved] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvPublicSaving, setCvPublicSaving] = useState(false);
  const [cvInputMode, setCvInputMode] = useState<"upload" | "url">("upload");
  const [cvUrlDraft, setCvUrlDraft] = useState("");
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [notifSaving, setNotifSaving] = useState(false);

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

  async function handleCvPublicToggle() {
    const newValue = !profile.cvPublic;
    setCvPublicSaving(true);
    setProfile((p) => ({ ...p, cvPublic: newValue }));
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvPublic: newValue }),
    });
    setCvPublicSaving(false);
  }

  async function handleCvUpload(file: File) {
    setCvUploading(true);
    setCvError("");
    const formData = new FormData();
    formData.append("cv", file);
    const res = await fetch("/api/upload/cv", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      const newProfile = { ...profile, cv: data.url };
      setProfile(newProfile);
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: data.url }),
      });
      setCvSaved(true);
      setTimeout(() => setCvSaved(false), 3000);
    } else {
      setCvError(data.error || "Erreur lors de l'upload du CV");
    }
    setCvUploading(false);
  }

  async function saveNotifPrefs(patch: Partial<Pick<Profile, "smsOptIn" | "whatsappOptIn" | "notifCategories">>) {
    setNotifSaving(true);
    setProfile((p) => ({ ...p, ...patch }));
    const body: Record<string, unknown> = {};
    if ("smsOptIn" in patch) body.smsOptIn = patch.smsOptIn;
    if ("whatsappOptIn" in patch) body.whatsappOptIn = patch.whatsappOptIn;
    if ("notifCategories" in patch) {
      const cats = patch.notifCategories ? JSON.parse(patch.notifCategories as string) : [];
      body.notifCategories = cats;
    }
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setNotifSaving(false);
  }

  function toggleNotifCategory(sector: string) {
    const current: string[] = profile.notifCategories ? JSON.parse(profile.notifCategories) : [];
    const updated = current.includes(sector)
      ? current.filter((s) => s !== sector)
      : [...current, sector];
    saveNotifPrefs({ notifCategories: updated.length > 0 ? JSON.stringify(updated) : null });
  }

  // Completion score (8 fields × 12.5% each)
  const fields: (keyof Profile)[] = ["title", "bio", "phone", "location", "cv", "skills", "experience", "education"];
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
        {pct < 50 && (
          <p className="text-xs text-orange-500 mt-2 font-medium">
            Votre profil est encore incomplet — complétez-le pour multiplier vos chances d&apos;être contacté !
          </p>
        )}
        {pct >= 50 && pct < 100 && (
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
              <AutocompleteInput
                value={profile.title || ""}
                onChange={(val) => update("title", val)}
                placeholder="Ex: Comptable, Développeur web, Logisticien..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                staticSuggestions={SUGGESTED_JOB_TITLES}
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
                <Phone className="h-3.5 w-3.5 inline mr-1" />Téléphone / WhatsApp
              </label>
              <input
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+236 77 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                Si vous avez WhatsApp sur ce numéro, les recruteurs pourront vous contacter directement.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="h-3.5 w-3.5 inline mr-1" />Localisation
              </label>
              <AutocompleteInput
                value={profile.location || ""}
                onChange={(val) => update("location", val)}
                placeholder="Bangui, Berbérati..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                staticSuggestions={SUGGESTED_LOCATIONS}
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

        {/* CV */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-orange-500" /> Mon CV
          </h2>
          <p className="text-xs text-gray-400 mb-4">PDF ou Word · max 5 Mo · votre CV sera joint automatiquement lors de vos candidatures</p>

          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); }}
          />

          {/* Mode toggle */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => setCvInputMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cvInputMode === "upload" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              <Upload className="h-3.5 w-3.5" /> Téléverser un fichier
            </button>
            <button
              type="button"
              onClick={() => setCvInputMode("url")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cvInputMode === "url" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              <Paperclip className="h-3.5 w-3.5" /> Coller une URL
            </button>
          </div>

          {cvInputMode === "url" ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={cvUrlDraft}
                onChange={(e) => setCvUrlDraft(e.target.value)}
                placeholder="https://exemple.com/mon-cv.pdf"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                disabled={!cvUrlDraft}
                onClick={async () => {
                  const newProfile = { ...profile, cv: cvUrlDraft };
                  setProfile(newProfile);
                  await fetch("/api/profile", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cv: cvUrlDraft }),
                  });
                  setCvUrlDraft("");
                  setCvSaved(true);
                  setTimeout(() => setCvSaved(false), 3000);
                }}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-200 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Valider
              </button>
            </div>
          ) : (
            <>
              {profile.cv ? (
                <div className="flex items-center gap-3">
                  <a
                    href={profile.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-600 hover:bg-orange-100 transition-colors flex-1"
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{profile.cv.split("/").pop()}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    disabled={cvUploading}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    {cvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Remplacer
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setProfile(p => ({ ...p, cv: null }));
                      await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cv: null }) });
                    }}
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={cvUploading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors w-full"
                >
                  {cvUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {cvUploading ? "Upload en cours..." : "Téléverser mon CV (PDF)"}
                </button>
              )}
            </>
          )}

          {cvSaved && (
            <p className="flex items-center gap-1.5 text-sm text-green-600 mt-2">
              <CheckCircle className="h-4 w-4" /> CV sauvegardé avec succès
            </p>
          )}
          {cvError && (
            <p className="text-sm text-red-500 mt-2">{cvError}</p>
          )}

          {/* Toggle visibilité CV */}
          {profile.cv && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCvPublicToggle}
                disabled={cvPublicSaving}
                className="flex items-center justify-between w-full group"
              >
                <div className="flex items-center gap-2.5">
                  {profile.cvPublic ? (
                    <Eye className="h-4 w-4 text-orange-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800">
                      Rendre mon CV visible aux recruteurs
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {profile.cvPublic
                        ? "Votre CV est visible dans la CVthèque — les recruteurs peuvent le consulter."
                        : "Votre CV est privé. Activez pour apparaître dans la CVthèque."}
                    </p>
                  </div>
                </div>
                <div className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ml-4 ${profile.cvPublic ? "bg-orange-500" : "bg-gray-200"}`}
                  style={{ height: "22px", minWidth: "40px" }}>
                  <span
                    className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${profile.cvPublic ? "translate-x-[18px]" : "translate-x-0"}`}
                    style={{ width: "18px", height: "18px" }}
                  />
                  {cvPublicSaving && (
                    <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin text-white" />
                  )}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications SMS / WhatsApp */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-500" /> Notifications d&apos;offres
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            Recevez les nouvelles offres par SMS ou WhatsApp. Votre numéro de téléphone doit être renseigné.
          </p>

          {!profile.phone && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 text-sm mb-4">
              Renseignez d&apos;abord votre numéro de téléphone pour activer les notifications.
            </div>
          )}

          <div className="space-y-3">
            {/* SMS toggle */}
            <button
              type="button"
              disabled={!profile.phone || notifSaving}
              onClick={() => saveNotifPrefs({ smsOptIn: !profile.smsOptIn })}
              className="flex items-center justify-between w-full disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Notifications SMS</p>
                  <p className="text-xs text-gray-400">Recevez les offres par message texte (SMS)</p>
                </div>
              </div>
              <div
                className={`relative rounded-full transition-colors flex-shrink-0 ml-4 ${profile.smsOptIn ? "bg-orange-500" : "bg-gray-200"}`}
                style={{ width: "40px", height: "22px" }}
              >
                <span
                  className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${profile.smsOptIn ? "translate-x-[18px]" : "translate-x-0.5"}`}
                  style={{ width: "18px", height: "18px", left: "0" }}
                />
              </div>
            </button>

            {/* WhatsApp toggle */}
            <button
              type="button"
              disabled={!profile.phone || notifSaving}
              onClick={() => saveNotifPrefs({ whatsappOptIn: !profile.whatsappOptIn })}
              className="flex items-center justify-between w-full disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800">Notifications WhatsApp</p>
                  <p className="text-xs text-gray-400">Recevez les offres via WhatsApp</p>
                </div>
              </div>
              <div
                className={`relative rounded-full transition-colors flex-shrink-0 ml-4 ${profile.whatsappOptIn ? "bg-emerald-500" : "bg-gray-200"}`}
                style={{ width: "40px", height: "22px" }}
              >
                <span
                  className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${profile.whatsappOptIn ? "translate-x-[18px]" : "translate-x-0.5"}`}
                  style={{ width: "18px", height: "18px", left: "0" }}
                />
              </div>
            </button>
          </div>

          {/* Filtrer par secteur */}
          {(profile.smsOptIn || profile.whatsappOptIn) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Secteurs d&apos;intérêt{" "}
                <span className="text-xs text-gray-400 font-normal">(laissez vide = tous les secteurs)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((sector) => {
                  const active = profile.notifCategories
                    ? JSON.parse(profile.notifCategories).includes(sector)
                    : false;
                  return (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleNotifCategory(sector)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? "bg-orange-100 text-orange-600 border border-orange-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {sector}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
