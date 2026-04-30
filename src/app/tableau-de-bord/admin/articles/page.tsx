"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Plus, Edit2, Trash2, Eye, EyeOff, Loader2,
  CheckCircle, XCircle, ArrowLeft, BookOpen, Tag, AlignLeft,
} from "lucide-react";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-2xl min-h-[400px] flex items-center justify-center text-gray-400 text-sm bg-gray-50">
      Chargement de l&apos;éditeur…
    </div>
  ),
});

const CATEGORIES = [
  "Conseils", "Marché de l'emploi", "Formation", "Entreprises",
  "Recrutement", "Carrière", "Actualités", "Technologie",
];

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  published: boolean;
  createdAt: string;
  author: { name: string | null };
}

const EMPTY_FORM = { title: "", excerpt: "", content: "", category: "Conseils", published: true };

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} j.`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Article | null>(null);
  const [filterPublished, setFilterPublished] = useState<"all" | "published" | "draft">("all");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    // Admin peut voir tous les articles (published + drafts)
    const res = await fetch("/api/blog?all=1");
    const data = await res.json();
    setArticles(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingSlug(null);
    setSaved(false);
    setSaveError("");
    setView("editor");
  }

  function openEdit(a: Article) {
    setForm({
      title: a.title,
      excerpt: a.excerpt ?? "",
      content: a.content,
      category: a.category,
      published: a.published,
    });
    setEditingSlug(a.slug);
    setSaved(false);
    setSaveError("");
    setView("editor");
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      setSaveError("Le titre et le contenu sont obligatoires.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = editingSlug
        ? await fetch(`/api/blog/${editingSlug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/blog", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSaved(true);
      await fetchArticles();
      setTimeout(() => { setSaved(false); setView("list"); }, 1500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    setDeletingSlug(null);
    setConfirmDelete(null);
    await fetchArticles();
  }

  async function togglePublished(a: Article) {
    await fetch(`/api/blog/${a.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !a.published }),
    });
    await fetchArticles();
  }

  const filtered = articles.filter((a) => {
    if (filterPublished === "published") return a.published;
    if (filterPublished === "draft") return !a.published;
    return true;
  });

  // ── Éditeur ───────────────────────────────────────────────────────────────
  if (view === "editor") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux articles
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          {editingSlug ? "Modifier l'article" : "Nouvel article"}
        </h1>

        <div className="space-y-5">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex : 5 conseils pour réussir un entretien en RCA"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 font-medium"
            />
          </div>

          {/* Catégorie + Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Catégorie
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Statut</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  form.published
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                {form.published
                  ? <><Eye className="h-4 w-4" /> Publié</>
                  : <><EyeOff className="h-4 w-4" /> Brouillon</>}
              </button>
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
              <AlignLeft className="h-3.5 w-3.5" /> Résumé <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              placeholder="Court résumé affiché dans la liste des articles…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Contenu <span className="text-red-400">*</span>
            </label>
            <TiptapEditor
              content={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Commencez à rédiger votre article…"
            />
          </div>

          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
              {saveError}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setView("list")}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : null}
              {saved ? "Sauvegardé !" : saving ? "Enregistrement…" : editingSlug ? "Mettre à jour" : "Publier l'article"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Liste ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" /> Articles & Blog
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length} article{articles.length > 1 ? "s" : ""} au total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterPublished(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterPublished === f
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "Tous" : f === "published" ? "Publiés" : "Brouillons"}
            <span className="ml-1.5 opacity-70">
              ({f === "all" ? articles.length : f === "published" ? articles.filter(a => a.published).length : articles.filter(a => !a.published).length})
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-orange-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun article pour l'instant.</p>
          <button onClick={openCreate} className="mt-3 text-orange-500 text-sm hover:underline">
            Écrire le premier article →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-start gap-4 hover:border-orange-200 transition-colors"
            >
              {/* Statut badge */}
              <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${a.published ? "bg-emerald-500" : "bg-gray-300"}`} />

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{a.title}</p>
                    {a.excerpt && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.excerpt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle publié */}
                    <button
                      onClick={() => togglePublished(a)}
                      className={`p-1.5 rounded-lg transition-colors text-xs ${
                        a.published
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={a.published ? "Dépublier" : "Publier"}
                    >
                      {a.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    {/* Modifier */}
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {/* Supprimer */}
                    <button
                      onClick={() => setConfirmDelete(a)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      {deletingSlug === a.slug
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                    {a.category}
                  </span>
                  <span className="text-xs text-gray-400">{timeAgo(a.createdAt)}</span>
                  <span className={`text-xs font-medium ${a.published ? "text-emerald-600" : "text-gray-400"}`}>
                    {a.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Supprimer l'article ?</p>
                <p className="text-xs text-gray-500">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-2.5 mb-4 line-clamp-2">
              « {confirmDelete.title} »
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.slug)}
                disabled={!!deletingSlug}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deletingSlug ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
