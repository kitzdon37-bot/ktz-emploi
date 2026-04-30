"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail, Users, Send, Trash2, RefreshCw, CheckCircle,
  XCircle, Loader2, Zap, Calendar, BarChart2, LayoutTemplate,
  Plus, Star, Copy, BookOpen, Megaphone, Gift, Newspaper,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  frequency: string;
  active: boolean;
  createdAt: string;
}

interface SendResult {
  email: string;
  sent: boolean;
  error?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  isBuiltin?: boolean;
  icon?: string;
}

// ─── Templates pré-conçus ────────────────────────────────────────────────────
const BUILTIN_TEMPLATES: Template[] = [
  {
    id: "builtin-offres",
    name: "Nouvelles offres d'emploi",
    icon: "briefcase",
    subject: "🎯 Les meilleures offres d'emploi cette semaine — KTZ Emploi",
    content: `Bonjour [PRENOM],

Nous avons sélectionné pour vous les meilleures offres d'emploi publiées cette semaine sur KTZ Emploi.

🔥 Ne manquez pas ces opportunités — les recruteurs centrafricains recherchent des profils comme le vôtre !

👉 Rendez-vous sur https://ktzemploi.cf/emplois pour postuler dès maintenant.

À très bientôt,
L'équipe KTZ Emploi`,
    isBuiltin: true,
  },
  {
    id: "builtin-evenement",
    name: "Événement recrutement",
    icon: "calendar",
    subject: "📅 [Événement] Forum de l'emploi à Bangui — KTZ Emploi",
    content: `Bonjour [PRENOM],

Nous avons le plaisir de vous inviter à un événement de recrutement organisé en partenariat avec KTZ Emploi.

📍 Lieu : Bangui, République Centrafricaine
📅 Date : [DATE]
⏰ Heure : [HEURE]

Venez rencontrer directement les employeurs et décrochez votre prochain emploi !

Pour vous inscrire et avoir plus d'informations, visitez notre plateforme.

À bientôt,
L'équipe KTZ Emploi`,
    isBuiltin: true,
  },
  {
    id: "builtin-promotion",
    name: "Offre promotionnelle recruteurs",
    icon: "gift",
    subject: "🎁 Offre spéciale recruteurs — KTZ Emploi",
    content: `Bonjour [PRENOM],

En tant que recruteur sur KTZ Emploi, nous avons une offre spéciale pour vous !

🎯 Profitez de [OFFRE] jusqu'au [DATE].

KTZ Emploi, c'est :
✅ Des milliers de candidats qualifiés en Centrafrique
✅ Des outils de recrutement puissants
✅ Une CVthèque complète

Ne manquez pas cette opportunité pour recruter les meilleurs talents centrafricains.

Cordialement,
L'équipe KTZ Emploi`,
    isBuiltin: true,
  },
  {
    id: "builtin-actu",
    name: "Actualité / Annonce",
    icon: "newspaper",
    subject: "📢 Actualité KTZ Emploi — [TITRE]",
    content: `Bonjour [PRENOM],

Nous avons une nouvelle importante à vous partager.

[CONTENU DE L'ANNONCE]

Pour en savoir plus, visitez notre plateforme sur https://ktzemploi.cf

Merci pour votre confiance,
L'équipe KTZ Emploi`,
    isBuiltin: true,
  },
  {
    id: "builtin-conseil",
    name: "Conseil carrière",
    icon: "star",
    subject: "💡 Conseil carrière : [SUJET] — KTZ Emploi",
    content: `Bonjour [PRENOM],

Cette semaine, l'équipe KTZ Emploi vous partage un conseil pour booster votre carrière.

💡 [TITRE DU CONSEIL]

[DÉVELOPPEMENT DU CONSEIL EN 2-3 PARAGRAPHES]

Vous avez des questions ? Répondez directement à cet email, nous sommes là pour vous aider.

Bonne lecture,
L'équipe KTZ Emploi`,
    isBuiltin: true,
  },
];

const STORAGE_KEY = "ktz_newsletter_templates";

function loadCustomTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch { return []; }
}

function saveCustomTemplates(templates: Template[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function TemplateIcon({ icon }: { icon?: string }) {
  const cls = "h-5 w-5";
  if (icon === "calendar") return <Calendar className={cls} />;
  if (icon === "gift") return <Gift className={cls} />;
  if (icon === "newspaper") return <Newspaper className={cls} />;
  if (icon === "star") return <Star className={cls} />;
  return <Megaphone className={cls} />;
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  // Campagne manuelle
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[] | null>(null);

  // Envoi automatique
  const [autoFreq, setAutoFreq] = useState<"weekly" | "monthly">("weekly");
  const [sendingAuto, setSendingAuto] = useState(false);
  const [autoResult, setAutoResult] = useState<{ sent: number; total: number; jobCount: number } | null>(null);
  const [autoError, setAutoError] = useState<string | null>(null);

  // Modèles
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"subscribers" | "manual" | "auto" | "templates">("subscribers");

  useEffect(() => {
    setCustomTemplates(loadCustomTemplates());
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/newsletter/subscribers");
    const data = await res.json();
    setSubscribers(data.subscribers ?? []);
    setStats({ total: data.total ?? 0, active: data.active ?? 0 });
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  function applyTemplate(t: Template) {
    setSubject(t.subject);
    setContent(t.content);
    setActiveTab("manual");
  }

  function saveAsTemplate() {
    if (!saveName.trim() || !subject.trim() || !content.trim()) return;
    const newTemplate: Template = {
      id: `custom-${Date.now()}`,
      name: saveName.trim(),
      subject,
      content,
    };
    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
    setSaveName("");
    setShowSaveForm(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  }

  function deleteCustomTemplate(id: string) {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    saveCustomTemplates(updated);
  }

  function insertVariable(v: string) {
    setContent((c) => c + v);
  }

  async function handleSendManual() {
    if (!subject.trim() || !content.trim()) return;
    setSending(true);
    setSendResults(null);
    const res = await fetch("/api/admin/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, content }),
    });
    const data = await res.json();
    setSendResults(data.results ?? []);
    setSending(false);
  }

  async function handleSendAuto() {
    setSendingAuto(true);
    setAutoResult(null);
    setAutoError(null);
    const res = await fetch("/api/admin/newsletter/send-auto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ frequency: autoFreq }),
    });
    const data = await res.json();
    if (!res.ok) setAutoError(data.error ?? "Erreur inconnue");
    else setAutoResult({ sent: data.sent, total: data.total, jobCount: data.jobCount });
    setSendingAuto(false);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    await fetch("/api/admin/newsletter/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    setStats((prev) => ({ ...prev, total: prev.total - 1 }));
    setDeletingId(null);
  }

  const sentCount = sendResults?.filter((r) => r.sent).length ?? 0;
  const allTemplates = [...BUILTIN_TEMPLATES, ...customTemplates];

  const TABS = [
    { id: "subscribers", label: "Abonnés", icon: <Users size={14} /> },
    { id: "templates", label: "Modèles", icon: <LayoutTemplate size={14} /> },
    { id: "manual", label: "Campagne", icon: <Send size={14} /> },
    { id: "auto", label: "Automatique", icon: <Zap size={14} /> },
  ] as const;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-orange-500" size={26} /> Newsletter
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos abonnés et envoyez des campagnes email</p>
        </div>
        <button
          onClick={fetchSubscribers}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">Abonnés total</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500 mt-1">Abonnés actifs</div>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-400">{stats.total - stats.active}</div>
          <div className="text-sm text-gray-500 mt-1">Désabonnés</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab : Abonnés ──────────────────────────────────────────────────── */}
      {activeTab === "subscribers" && (
        <div className="bg-white border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={20} /> Chargement...
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Mail size={40} className="mx-auto mb-3 opacity-40" />
              <p>Aucun abonné pour le moment.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fréquence</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-600">{sub.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        <Calendar size={11} />
                        {sub.frequency === "weekly" ? "Hebdo" : "Mensuel"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {sub.active ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          <XCircle size={11} /> Désabonné
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(sub.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        disabled={deletingId === sub.id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-40"
                      >
                        {deletingId === sub.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tab : Modèles ──────────────────────────────────────────────────── */}
      {activeTab === "templates" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <LayoutTemplate size={18} className="text-orange-500" /> Bibliothèque de modèles
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Sélectionnez un modèle pour pré-remplir l&apos;éditeur de campagne.
              </p>
            </div>
            <button
              onClick={() => { setActiveTab("manual"); setShowSaveForm(true); }}
              className="flex items-center gap-2 text-sm bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              <Plus size={14} /> Créer un modèle
            </button>
          </div>

          {/* Modèles pré-conçus */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Modèles pré-conçus
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {BUILTIN_TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => applyTemplate(t)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 flex-shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <TemplateIcon icon={t.icon} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.subject}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.content.split("\n\n")[1] ?? t.content}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Utiliser ce modèle →
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(t.content); }}
                      className="p-1 text-gray-300 hover:text-gray-500 rounded transition-colors"
                      title="Copier le contenu"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modèles personnalisés */}
          {customTemplates.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Mes modèles personnalisés ({customTemplates.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {customTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-orange-200 hover:shadow-sm transition-all cursor-pointer group"
                    onClick={() => applyTemplate(t)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center text-violet-500 flex-shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                        <BookOpen size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{t.subject}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(t.id); }}
                        className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors flex-shrink-0"
                        title="Supprimer ce modèle"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{t.content}</p>
                    <p className="text-xs text-violet-500 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Utiliser ce modèle →
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <LayoutTemplate size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun modèle personnalisé.</p>
              <p className="text-xs mt-1">Créez une campagne et sauvegardez-la comme modèle.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab : Campagne manuelle ────────────────────────────────────────── */}
      {activeTab === "manual" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Éditeur */}
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Send size={18} className="text-orange-500" /> Composer
                  </h2>
                  <p className="text-sm text-gray-500">{stats.active} abonné(s) actif(s) recevront cet email.</p>
                </div>
                <button
                  onClick={() => setActiveTab("templates")}
                  className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  <LayoutTemplate size={12} /> Modèles
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet de l&apos;email</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Les meilleures offres d'emploi de la semaine"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder={"Bonjour [PRENOM],\n\nRédigez votre newsletter ici..."}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none font-mono"
                />
              </div>

              {/* Variables */}
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Insérer une variable :</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["[PRENOM]", "Prénom de l'abonné"],
                    ["[NOM]", "Nom complet"],
                    ["[EMAIL]", "Adresse email"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      title={label}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-mono hover:bg-orange-200 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Cliquez pour insérer · remplacées par les données de chaque abonné</p>
              </div>

              {/* Sauvegarder comme modèle */}
              {(subject || content) && (
                <div className="border border-dashed border-gray-200 rounded-lg p-3">
                  {!showSaveForm ? (
                    <button
                      onClick={() => setShowSaveForm(true)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors w-full"
                    >
                      <Plus size={14} /> Enregistrer comme modèle réutilisable
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="Nom du modèle…"
                        className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveAsTemplate(); if (e.key === "Escape") setShowSaveForm(false); }}
                      />
                      <button
                        onClick={saveAsTemplate}
                        disabled={!saveName.trim()}
                        className="px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
                      >
                        {savedFeedback ? <CheckCircle size={14} /> : <Plus size={14} />}
                        {savedFeedback ? "Sauvegardé !" : "Sauver"}
                      </button>
                      <button onClick={() => setShowSaveForm(false)} className="px-3 py-1.5 text-gray-400 hover:text-gray-600 text-sm rounded-lg border">
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleSendManual}
                disabled={sending || !subject.trim() || !content.trim() || stats.active === 0}
                className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Envoi en cours..." : `Envoyer à ${stats.active} abonné(s)`}
              </button>
            </div>

            {/* Aperçu en direct */}
            <div className="bg-white border rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart2 size={18} className="text-orange-500" /> Aperçu email
              </h2>
              <div className="border rounded-lg overflow-hidden bg-gray-100 min-h-[400px]">
                {subject || content ? (
                  <iframe
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:16px;background:#f9fafb;font-family:-apple-system,sans-serif;}</style></head><body>
                      <div style="background:#f97316;padding:20px 24px;border-radius:12px 12px 0 0;">
                        <span style="background:white;border-radius:8px;padding:4px 8px;font-weight:800;color:#f97316;font-size:16px;">KTZ</span>
                        <span style="color:white;font-size:18px;font-weight:700;"> Emploi</span>
                      </div>
                      <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
                        ${subject ? `<p style="font-size:11px;color:#9ca3af;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.5px;">Objet : ${subject.replace(/</g,"&lt;")}</p>` : ""}
                        <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">Bonjour <span style="background:#fff7ed;color:#f97316;padding:1px 6px;border-radius:4px;">[PRENOM]</span> !</h2>
                        <div style="color:#374151;font-size:14px;line-height:1.8;white-space:pre-wrap;">${content
                          .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                          .replace(/\[PRENOM\]/gi,'<span style="background:#fff7ed;color:#f97316;padding:1px 4px;border-radius:4px;">[PRENOM]</span>')
                          .replace(/\[NOM\]/gi,'<span style="background:#fff7ed;color:#f97316;padding:1px 4px;border-radius:4px;">[NOM]</span>')
                          .replace(/\[EMAIL\]/gi,'<span style="background:#fff7ed;color:#f97316;padding:1px 4px;border-radius:4px;">[EMAIL]</span>')
                        }</div>
                        <div style="margin-top:24px;text-align:center;">
                          <a style="display:inline-block;background:#f97316;color:white;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:13px;">Voir toutes les offres →</a>
                        </div>
                        <p style="margin-top:20px;color:#9ca3af;font-size:11px;text-align:center;">KTZ Emploi · Bangui, RCA · <u>Se désabonner</u></p>
                      </div>
                    </body></html>`}
                    className="w-full h-[450px] border-0"
                    title="Aperçu email"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm py-24 gap-3">
                    <LayoutTemplate size={28} className="opacity-30" />
                    <p>Commencez à écrire ou choisissez un modèle</p>
                    <button
                      onClick={() => setActiveTab("templates")}
                      className="text-orange-500 text-xs hover:underline"
                    >
                      Voir les modèles →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {sendResults && (
            <div className="border rounded-xl p-4 bg-gray-50 space-y-2">
              <div className="flex items-center gap-2 font-medium text-gray-800">
                <BarChart2 size={16} className="text-orange-500" />
                Résultat : {sentCount} / {sendResults.length} envoyés
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {sendResults.map((r) => (
                  <div key={r.email} className="flex items-center gap-2 text-sm">
                    {r.sent
                      ? <CheckCircle size={14} className="text-green-500 shrink-0" />
                      : <XCircle size={14} className="text-red-400 shrink-0" />}
                    <span className={r.sent ? "text-gray-700" : "text-red-500"}>{r.email}</span>
                    {r.error && <span className="text-xs text-red-400">({r.error})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab : Envoi automatique ────────────────────────────────────────── */}
      {activeTab === "auto" && (
        <div className="bg-white border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
              <Zap size={18} className="text-orange-500" /> Newsletter automatique
            </h2>
            <p className="text-sm text-gray-500">
              Envoie automatiquement les nouvelles offres d&apos;emploi publiées sur la période sélectionnée.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
              <div className="flex gap-3">
                {(["weekly", "monthly"] as const).map((f) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="freq"
                      value={f}
                      checked={autoFreq === f}
                      onChange={() => setAutoFreq(f)}
                      className="accent-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      {f === "weekly" ? "Hebdomadaire (7 derniers jours)" : "Mensuelle (30 derniers jours)"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
              Seuls les abonnés ayant choisi la fréquence <strong>{autoFreq === "weekly" ? "hebdomadaire" : "mensuelle"}</strong> recevront cet email.
            </div>

            <button
              onClick={handleSendAuto}
              disabled={sendingAuto}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingAuto ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {sendingAuto ? "Envoi en cours..." : "Lancer l'envoi automatique"}
            </button>
          </div>

          {autoError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <XCircle size={16} className="shrink-0" /> {autoError}
            </div>
          )}

          {autoResult && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm">
              <CheckCircle size={18} className="shrink-0 text-green-600" />
              <div>
                <p className="font-medium">Envoi réussi !</p>
                <p>{autoResult.sent} email(s) envoyé(s) sur {autoResult.total} abonné(s) · {autoResult.jobCount} offre(s) incluses</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
