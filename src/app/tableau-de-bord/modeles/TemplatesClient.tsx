"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowRight, Loader2, X, FileText, CheckCircle, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { JOB_TYPES, JOB_CATEGORIES, RCA_LOCATIONS } from "@/lib/utils";
import { JOB_TEMPLATE_PRESETS, type JobTemplatePreset } from "@/lib/job-template-presets";

export interface JobTemplate {
  id: string;
  name: string;
  title: string;
  type: string;
  category: string;
  location: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  createdAt: string;
}

interface TemplateFormData {
  name: string;
  title: string;
  type: string;
  category: string;
  location: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: string;
  salaryMax: string;
}

const EMPTY_FORM: TemplateFormData = {
  name: "",
  title: "",
  type: JOB_TYPES[0].value,
  category: JOB_CATEGORIES[0],
  location: RCA_LOCATIONS[0],
  description: "",
  requirements: "",
  benefits: "",
  salaryMin: "",
  salaryMax: "",
};

interface Props {
  initialTemplates: JobTemplate[];
}

export default function TemplatesClient({ initialTemplates }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<JobTemplate[]>(initialTemplates);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [importingPreset, setImportingPreset] = useState<string | null>(null);

  function update(field: keyof TemplateFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openModal(preset?: JobTemplatePreset) {
    setForm(
      preset
        ? {
            name: preset.name,
            title: preset.title,
            type: preset.type,
            category: preset.category,
            location: preset.location,
            description: preset.description,
            requirements: preset.requirements,
            benefits: preset.benefits,
            salaryMin: preset.salaryMin ? String(preset.salaryMin) : "",
            salaryMax: preset.salaryMax ? String(preset.salaryMax) : "",
          }
        : EMPTY_FORM
    );
    setFormError(null);
    setSaved(false);
    setModalOpen(true);
  }

  async function handleImportPreset(preset: JobTemplatePreset) {
    setImportingPreset(preset.name);
    try {
      const res = await fetch("/api/job-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          title: preset.title,
          type: preset.type,
          category: preset.category,
          location: preset.location,
          description: preset.description,
          requirements: preset.requirements,
          benefits: preset.benefits,
          salaryMin: preset.salaryMin,
          salaryMax: preset.salaryMax,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates((prev) => [data.template, ...prev]);
      }
    } finally {
      setImportingPreset(null);
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.title.trim() || !form.description.trim()) {
      setFormError("Nom du modèle, intitulé et description sont requis.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/job-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          type: form.type,
          category: form.category,
          location: form.location,
          description: form.description,
          requirements: form.requirements || undefined,
          benefits: form.benefits || undefined,
          salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : undefined,
          salaryMax: form.salaryMax ? parseInt(form.salaryMax, 10) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error ?? "Erreur lors de la création.");
        return;
      }

      const data = await res.json();
      setTemplates((prev) => [data.template, ...prev]);
      setSaved(true);
      setTimeout(() => {
        setModalOpen(false);
        setSaved(false);
      }, 1200);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce modèle ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/job-templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleUse(id: string) {
    router.push(`/tableau-de-bord/publier?template=${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <FileText className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Modèles d&apos;offres</h1>
            <p className="text-sm text-gray-500">Créez des modèles réutilisables pour publier plus vite</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          Créer un modèle
        </button>
      </div>

      {/* Suggested presets */}
      <div className="mb-8 bg-orange-50 border border-orange-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setPresetsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-orange-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-gray-800 text-sm">
              Modèles suggérés par KTZ Emploi
            </span>
            <span className="text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {JOB_TEMPLATE_PRESETS.length} modèles
            </span>
          </div>
          {presetsOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {presetsOpen && (
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-500 mb-4">
              Importez un modèle en un clic ou personnalisez-le avant de l&apos;enregistrer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {JOB_TEMPLATE_PRESETS.map((preset) => {
                const alreadyImported = templates.some(
                  (t) => t.name === preset.name
                );
                const isImporting = importingPreset === preset.name;
                return (
                  <div
                    key={preset.name}
                    className="bg-white rounded-xl border border-orange-100 p-4 flex flex-col gap-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{preset.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full">
                          {preset.type}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                          {preset.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleImportPreset(preset)}
                        disabled={alreadyImported || isImporting}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                      >
                        {isImporting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : alreadyImported ? (
                          <CheckCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        {alreadyImported ? "Importé" : isImporting ? "..." : "Importer"}
                      </button>
                      <button
                        onClick={() => openModal(preset)}
                        className="flex items-center gap-1.5 border border-gray-200 hover:border-orange-200 text-gray-600 hover:text-orange-600 text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Template list */}
      {templates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">Aucun modèle créé</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Créez un modèle pour accélérer la publication de vos offres
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Créer mon premier modèle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-orange-200 hover:shadow-sm transition-all p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{tpl.name}</p>
                  <p className="text-sm text-gray-600 truncate">{tpl.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                  {tpl.type}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                  {tpl.category}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {tpl.location}
                </span>
              </div>

              {tpl.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tpl.description}</p>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUse(tpl.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors"
                >
                  Utiliser <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(tpl.id)}
                  disabled={deletingId === tpl.id}
                  className="flex items-center gap-1.5 border border-gray-200 hover:border-red-200 hover:text-red-500 text-gray-500 text-sm px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {deletingId === tpl.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-900 text-lg">Créer un modèle d&apos;offre</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              {/* Template name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du modèle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ex: Offre comptable standard"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {/* Job title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Intitulé du poste <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Ex: Comptable junior"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type de contrat
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lieu
                </label>
                <select
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {RCA_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  placeholder="Décrivez le poste, les missions, le contexte..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prérequis
                </label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => update("requirements", e.target.value)}
                  rows={3}
                  placeholder="Diplômes, expériences, compétences requises..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Avantages
                </label>
                <textarea
                  value={form.benefits}
                  onChange={(e) => update("benefits", e.target.value)}
                  rows={3}
                  placeholder="Transport, assurance, bonus, mutuelle..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Salary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Salaire min (XAF)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.salaryMin}
                    onChange={(e) => update("salaryMin", e.target.value)}
                    placeholder="150000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Salaire max (XAF)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.salaryMax}
                    onChange={(e) => update("salaryMax", e.target.value)}
                    placeholder="400000"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving || saved}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saved && <CheckCircle className="h-4 w-4" />}
                  {saved ? "Modèle créé !" : saving ? "Création..." : "Créer le modèle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
