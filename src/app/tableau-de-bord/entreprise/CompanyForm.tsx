"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Upload, X, Building2, MessageCircle } from "lucide-react";
import { COMPANY_SIZES, RCA_LOCATIONS, JOB_CATEGORIES } from "@/lib/utils";

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  website?: string | null;
  videoUrl?: string | null;
  description?: string | null;
  sector?: string | null;
  size?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  allowContact?: boolean;
}

export default function CompanyForm({ company }: { company: CompanyData | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");

  const [form, setForm] = useState({
    name: company?.name || "",
    website: company?.website || "",
    videoUrl: company?.videoUrl || "",
    description: company?.description || "",
    sector: company?.sector || "",
    size: company?.size || "",
    location: company?.location || "Bangui",
    phone: company?.phone || "",
    email: company?.email || "",
    logo: company?.logo || "",
    banner: company?.banner || "",
    allowContact: company?.allowContact ?? false,
  });

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError("");
    setLogoUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setLogoError(data.error || "Erreur lors de l'upload");
        return;
      }

      set("logo", data.url);
    } finally {
      setLogoUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerError("");
    setBannerUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setBannerError(data.error || "Erreur lors de l'upload");
        return;
      }

      set("banner", data.url);
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la sauvegarde");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl text-sm">
          <CheckCircle className="h-4 w-4" /> Profil sauvegardé avec succès !
        </div>
      )}

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Logo de l&apos;entreprise</h2>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">Apparaît sur toutes vos offres d&apos;emploi</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Prévisualisation */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
              {form.logo ? (
                <img
                  src={form.logo}
                  alt="Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 className="h-10 w-10 text-gray-300" />
              )}
            </div>
            {form.logo && (
              <button
                type="button"
                onClick={() => set("logo", "")}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                title="Supprimer le logo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Zone upload */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-3">
              Format JPG, PNG, SVG ou WEBP — 2 Mo maximum
            </p>
            {logoError && (
              <p className="text-xs text-red-500 mb-2">{logoError}</p>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={logoUploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {logoUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {logoUploading ? "Chargement..." : form.logo ? "Changer le logo" : "Choisir un logo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Bannière */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Bannière de l&apos;entreprise</h2>

        {/* Prévisualisation */}
        <div className="relative mb-4">
          <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            {form.banner ? (
              <img
                src={form.banner}
                alt="Bannière"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-400">Aucune bannière — format paysage recommandé (1200×300)</span>
            )}
          </div>
          {form.banner && (
            <button
              type="button"
              onClick={() => set("banner", "")}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              title="Supprimer la bannière"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-3">Format JPG, PNG ou WEBP — 5 Mo maximum</p>
          {bannerError && <p className="text-xs text-red-500 mb-2">{bannerError}</p>}
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={bannerUploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
          >
            {bannerUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {bannerUploading ? "Chargement..." : form.banner ? "Changer la bannière" : "Choisir une bannière"}
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleBannerChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Informations générales */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Informations générales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l&apos;entreprise *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d&apos;activité</label>
              <select
                value={form.sector}
                onChange={(e) => set("sector", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Non précisé</option>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Taille de l&apos;entreprise</label>
              <select
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Non précisé</option>
                {COMPANY_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
            <select
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              {RCA_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Présentez votre entreprise, sa mission, ses valeurs..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Coordonnées</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Site web</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://www.monentreprise.cf"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vidéo de présentation (YouTube)</label>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(e) => set("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">Une vidéo de présentation augmente les candidatures de 40%</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email de contact</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="rh@monentreprise.cf"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+236 75 00 00 00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Option contact */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-orange-500" />
          Autoriser les candidats à me contacter
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Si activé, les candidats verront un bouton WhatsApp / Email directement sur vos offres d&apos;emploi.
        </p>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, allowContact: !p.allowContact }))}
          className="flex items-center gap-3 group"
        >
          <div
            className={`relative rounded-full transition-colors flex-shrink-0 ${form.allowContact ? "bg-emerald-500" : "bg-gray-200"}`}
            style={{ width: "40px", height: "22px" }}
          >
            <span
              className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${form.allowContact ? "translate-x-[18px]" : "translate-x-0.5"}`}
              style={{ width: "18px", height: "18px" }}
            />
          </div>
          <span className={`text-sm font-medium ${form.allowContact ? "text-emerald-700" : "text-gray-500"}`}>
            {form.allowContact ? "Activé — les candidats peuvent vous contacter directement" : "Désactivé"}
          </span>
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || logoUploading || bannerUploading}
        className="w-full sm:w-auto px-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Sauvegarder le profil
      </button>
    </form>
  );
}
