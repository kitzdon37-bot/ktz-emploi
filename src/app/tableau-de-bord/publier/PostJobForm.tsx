"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Lock, Zap, Star, ArrowRight, ImagePlus, X, Bell } from "lucide-react";
import Link from "next/link";
import { JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS, RCA_LOCATIONS } from "@/lib/utils";

interface Props {
  companyId: string;
  limitReached?: boolean;
  activeJobs?: number;
  maxJobs?: number;
  planName?: string;
}

function UpgradeModal({ activeJobs = 0, maxJobs = 1, planName = "Gratuit" }: { activeJobs?: number; maxJobs?: number; planName?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop flouté */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center animate-in zoom-in-95 duration-200">
        {/* Icône */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Lock className="h-10 w-10 text-orange-500" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Limite atteinte
        </h2>
        <p className="text-gray-500 mb-1">
          Votre plan <span className="font-semibold text-gray-800">{planName}</span> autorise{" "}
          <span className="font-semibold text-gray-800">{maxJobs} offre{maxJobs > 1 ? "s" : ""} active{maxJobs > 1 ? "s" : ""}</span>.
        </p>
        <p className="text-gray-500 mb-8">
          Vous en avez déjà <span className="font-semibold text-orange-500">{activeJobs}</span>. Passez à un plan supérieur pour continuer à recruter sans limite.
        </p>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/tableau-de-bord/abonnement?plan=STARTER"
            className="group flex flex-col items-center gap-1.5 border-2 border-blue-200 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 px-5 py-4 rounded-2xl font-semibold transition-all"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-base">Starter</span>
            </div>
            <span className="text-xl font-extrabold">5 000 XAF<span className="text-sm font-normal">/mois</span></span>
            <span className="text-xs text-blue-500">5 offres · CVthèque</span>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/tableau-de-bord/abonnement?plan=PRO"
            className="group flex flex-col items-center gap-1.5 border-2 border-orange-300 hover:border-orange-500 bg-orange-50 hover:bg-orange-100 text-orange-700 px-5 py-4 rounded-2xl font-semibold transition-all"
          >
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
              <span className="text-base">Pro</span>
            </div>
            <span className="text-xl font-extrabold">20 000 XAF<span className="text-sm font-normal">/mois</span></span>
            <span className="text-xs text-orange-500">Illimité · Badge Super Recruteur</span>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        <Link href="/tarifs" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Voir tous les tarifs et fonctionnalités →
        </Link>
      </div>
    </div>
  );
}

export default function PostJobForm({ companyId, limitReached = false, activeJobs = 0, maxJobs = 1, planName = "Gratuit" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(limitReached);

  const [form, setForm] = useState({
    title: "",
    type: "CDI",
    category: "",
    location: "Bangui",
    remote: false,
    description: "",
    requirements: "",
    benefits: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    deadline: "",
    coverImage: "",
  });
  const [notifyOnApproval, setNotifyOnApproval] = useState(true);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function set(k: string, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "job-cover");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        set("coverImage", data.url);
        setCoverPreview(data.url);
      }
    } finally {
      setUploadingCover(false);
    }
  }

  function removeCover() {
    set("coverImage", "");
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyId,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin) : null,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax) : null,
          notifyOnApproval,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.upgradeRequired) {
          setUpgradeRequired(true);
          return;
        }
        setError(data.error || "Erreur lors de la publication");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push(`/tableau-de-bord`), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Offre publiée !</h2>
        <p className="text-gray-500 text-sm">
          Votre offre est en ligne et visible par les candidats.
          {notifyOnApproval && " Les candidats ont été notifiés par WhatsApp et email."}
        </p>
      </div>
    );
  }

  return (
    <>
      {upgradeRequired && (
        <UpgradeModal activeJobs={activeJobs} maxJobs={maxJobs} planName={planName} />
      )}
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-orange-50 border border-orange-200 text-orange-600 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Informations générales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre du poste *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="ex: Développeur Web Senior"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type de contrat *</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d&apos;activité *</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Choisir un secteur</option>
                {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation *</label>
              <select
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {RCA_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau d&apos;expérience</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => set("experienceLevel", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                <option value="">Non précisé</option>
                {EXPERIENCE_LEVELS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={form.remote}
              onChange={(e) => set("remote", e.target.checked)}
              className="rounded text-orange-500 focus:ring-orange-400"
            />
            <label htmlFor="remote" className="text-sm text-gray-700">Télétravail possible</label>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Rémunération (optionnel)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Salaire minimum (XAF)</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={(e) => set("salaryMin", e.target.value)}
              placeholder="ex: 150000"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Salaire maximum (XAF)</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={(e) => set("salaryMax", e.target.value)}
              placeholder="ex: 300000"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Afficher la rémunération augmente le nombre de candidatures de 30%</p>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Description du poste</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
              rows={6}
              placeholder="Décrivez les missions, responsabilités et contexte du poste..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Profil recherché</label>
            <textarea
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              rows={4}
              placeholder="Formation requise, compétences techniques, soft skills..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Avantages offerts</label>
            <textarea
              value={form.benefits}
              onChange={(e) => set("benefits", e.target.value)}
              rows={3}
              placeholder="Transport, assurance santé, tickets restaurant, formation..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Cover image */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Image de couverture <span className="text-gray-400 font-normal text-sm">(optionnel)</span></h2>
        <p className="text-xs text-gray-400 mb-4">Ajoutez une photo pour rendre votre offre plus visible (JPG, PNG, WEBP — max 5 Mo)</p>
        {coverPreview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPreview} alt="Aperçu couverture" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeCover}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="w-full h-36 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-60"
          >
            {uploadingCover ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-7 w-7" />
            )}
            <span className="text-sm font-medium">
              {uploadingCover ? "Chargement..." : "Cliquer pour ajouter une image"}
            </span>
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleCoverUpload}
        />
      </div>

      {/* Deadline */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Date limite de candidature (optionnel)</h2>
        <input
          type="date"
          value={form.deadline}
          onChange={(e) => set("deadline", e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <button
          type="button"
          onClick={() => setNotifyOnApproval(v => !v)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Notifier les candidats</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Dès validation, tous les candidats inscrits reçoivent l&apos;offre par <strong>WhatsApp</strong> et <strong>email</strong>. Les numéros restent confidentiels.
              </p>
            </div>
          </div>
          <div
            className={`relative rounded-full transition-colors flex-shrink-0 ml-4 ${notifyOnApproval ? "bg-emerald-500" : "bg-gray-200"}`}
            style={{ width: "44px", height: "24px" }}
          >
            <span
              className={`absolute top-0.5 bg-white rounded-full shadow transition-transform ${notifyOnApproval ? "translate-x-[20px]" : "translate-x-0.5"}`}
              style={{ width: "20px", height: "20px" }}
            />
          </div>
        </button>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 sm:flex-none sm:px-8 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Publier l&apos;offre
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
      </div>
    </form>
    </>
  );
}

