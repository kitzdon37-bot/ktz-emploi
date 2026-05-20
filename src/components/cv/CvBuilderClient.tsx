"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { User, Briefcase, GraduationCap, Star, Globe, Heart, ChevronDown, ChevronUp, Plus, Trash2, Save, Eye, Edit3, Check } from "lucide-react";
import { CvData, CvTemplate, CvExperience, CvEducation, CvSkill, CvLanguage, EMPTY_CV, LANGUAGE_LEVELS } from "@/types/cv";
import CvPreview from "./CvPreview";
import AutocompleteInput from "@/components/AutocompleteInput";
import {
  SUGGESTED_JOB_TITLES,
  SUGGESTED_LOCATIONS,
  SUGGESTED_SCHOOLS,
  SUGGESTED_DEGREES,
  SUGGESTED_FIELDS,
  SUGGESTED_SKILLS,
  SUGGESTED_LANGUAGES,
  SUGGESTED_INTERESTS,
} from "@/lib/suggestions";

const PdfDownloadButton = dynamic(() => import("./PdfDownloadButton"), { ssr: false });

function uid() { return Math.random().toString(36).slice(2, 9); }

const TEMPLATES: { id: CvTemplate; label: string; color: string; desc: string }[] = [
  { id: "modern",   label: "Moderne",   color: "bg-orange-500", desc: "Orange & sombre" },
  { id: "classic",  label: "Classique", color: "bg-gray-800",   desc: "Noir & blanc" },
  { id: "creative", label: "Créatif",   color: "bg-teal-600",   desc: "Teal & coloré" },
];

const SECTION_TABS = [
  { id: "personal",    label: "Infos",        icon: User },
  { id: "experiences", label: "Expériences",  icon: Briefcase },
  { id: "education",   label: "Formation",    icon: GraduationCap },
  { id: "skills",      label: "Compétences",  icon: Star },
  { id: "languages",   label: "Langues",      icon: Globe },
  { id: "interests",   label: "Intérêts",     icon: Heart },
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";
const labelCls = "block text-xs font-medium text-gray-600 mb-1";

/* ── Sous-formulaires ────────────────────────────────────────────────────────── */
function PersonalSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const set = (k: keyof CvData, v: string) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Prénom *</label><input className={inputCls} value={data.firstName} onChange={e => set("firstName", e.target.value)} placeholder="Jean" /></div>
        <div><label className={labelCls}>Nom *</label><input className={inputCls} value={data.lastName} onChange={e => set("lastName", e.target.value)} placeholder="DUPONT" /></div>
      </div>
      <div><label className={labelCls}>Titre / Poste visé</label><AutocompleteInput className={inputCls} value={data.title} onChange={v => set("title", v)} placeholder="Comptable senior, Développeur web..." staticSuggestions={SUGGESTED_JOB_TITLES} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Email</label><input className={inputCls} type="email" value={data.email} onChange={e => set("email", e.target.value)} placeholder="jean@email.com" /></div>
        <div><label className={labelCls}>Téléphone</label><input className={inputCls} value={data.phone} onChange={e => set("phone", e.target.value)} placeholder="+236 77 00 00 00" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Localité</label><AutocompleteInput className={inputCls} value={data.location} onChange={v => set("location", v)} placeholder="Bangui, RCA" staticSuggestions={SUGGESTED_LOCATIONS} /></div>
        <div><label className={labelCls}>LinkedIn</label><input className={inputCls} value={data.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/jean" /></div>
      </div>
      <div><label className={labelCls}>Site web</label><input className={inputCls} value={data.website} onChange={e => set("website", e.target.value)} placeholder="https://monsite.com" /></div>
      <div>
        <label className={labelCls}>Résumé professionnel</label>
        <textarea className={inputCls + " resize-none"} rows={4} value={data.summary} onChange={e => set("summary", e.target.value)} placeholder="Décrivez votre profil en 2-3 phrases..." />
      </div>
    </div>
  );
}

function ExperiencesSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const [open, setOpen] = useState<string | null>(data.experiences[0]?.id ?? null);

  function add() {
    const id = uid();
    onChange({ ...data, experiences: [...data.experiences, { id, company: "", position: "", location: "", startDate: "", endDate: "", current: false, description: "" }] });
    setOpen(id);
  }
  function remove(id: string) { onChange({ ...data, experiences: data.experiences.filter(e => e.id !== id) }); }
  function update(id: string, patch: Partial<CvExperience>) {
    onChange({ ...data, experiences: data.experiences.map(e => e.id === id ? { ...e, ...patch } : e) });
  }

  return (
    <div className="space-y-3">
      {data.experiences.map((e) => (
        <div key={e.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(open === e.id ? null : e.id)}>
            <p className="text-sm font-medium text-gray-700 truncate">{e.position || "Nouvelle expérience"}{e.company ? ` — ${e.company}` : ""}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={ev => { ev.stopPropagation(); remove(e.id); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
              {open === e.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
          {open === e.id && (
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Poste *</label><AutocompleteInput className={inputCls} value={e.position} onChange={v => update(e.id, { position: v })} placeholder="Développeur web" staticSuggestions={SUGGESTED_JOB_TITLES} /></div>
                <div><label className={labelCls}>Entreprise *</label><input className={inputCls} value={e.company} onChange={ev => update(e.id, { company: ev.target.value })} placeholder="Ecobank RCA" /></div>
              </div>
              <div><label className={labelCls}>Localité</label><AutocompleteInput className={inputCls} value={e.location} onChange={v => update(e.id, { location: v })} placeholder="Bangui" staticSuggestions={SUGGESTED_LOCATIONS} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Date début</label><input className={inputCls} type="month" value={e.startDate} onChange={ev => update(e.id, { startDate: ev.target.value })} /></div>
                <div>
                  <label className={labelCls}>Date fin</label>
                  <input className={inputCls} type="month" value={e.endDate} disabled={e.current} onChange={ev => update(e.id, { endDate: ev.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={e.current} onChange={ev => update(e.id, { current: ev.target.checked, endDate: "" })} className="accent-orange-500" />
                Poste actuel
              </label>
              <div><label className={labelCls}>Description</label><textarea className={inputCls + " resize-none"} rows={3} value={e.description} onChange={ev => update(e.id, { description: ev.target.value })} placeholder="Décrivez vos missions et réalisations..." /></div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium py-2">
        <Plus className="h-4 w-4" /> Ajouter une expérience
      </button>
    </div>
  );
}

function EducationSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const [open, setOpen] = useState<string | null>(data.education[0]?.id ?? null);

  function add() {
    const id = uid();
    onChange({ ...data, education: [...data.education, { id, school: "", degree: "", field: "", startDate: "", endDate: "", current: false }] });
    setOpen(id);
  }
  function remove(id: string) { onChange({ ...data, education: data.education.filter(e => e.id !== id) }); }
  function update(id: string, patch: Partial<CvEducation>) {
    onChange({ ...data, education: data.education.map(e => e.id === id ? { ...e, ...patch } : e) });
  }

  return (
    <div className="space-y-3">
      {data.education.map((e) => (
        <div key={e.id} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer" onClick={() => setOpen(open === e.id ? null : e.id)}>
            <p className="text-sm font-medium text-gray-700 truncate">{e.degree || "Nouvelle formation"}{e.school ? ` — ${e.school}` : ""}</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={ev => { ev.stopPropagation(); remove(e.id); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="h-3.5 w-3.5" /></button>
              {open === e.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
          {open === e.id && (
            <div className="px-4 pb-4 pt-3 space-y-3">
              <div><label className={labelCls}>Diplôme *</label><AutocompleteInput className={inputCls} value={e.degree} onChange={v => update(e.id, { degree: v })} placeholder="Licence, Master, BTS..." staticSuggestions={SUGGESTED_DEGREES} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Spécialité</label><AutocompleteInput className={inputCls} value={e.field} onChange={v => update(e.id, { field: v })} placeholder="Informatique, Droit..." staticSuggestions={SUGGESTED_FIELDS} /></div>
                <div><label className={labelCls}>Établissement *</label><AutocompleteInput className={inputCls} value={e.school} onChange={v => update(e.id, { school: v })} placeholder="Université de Bangui" staticSuggestions={SUGGESTED_SCHOOLS} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Date début</label><input className={inputCls} type="month" value={e.startDate} onChange={ev => update(e.id, { startDate: ev.target.value })} /></div>
                <div><label className={labelCls}>Date fin</label><input className={inputCls} type="month" value={e.endDate} disabled={e.current} onChange={ev => update(e.id, { endDate: ev.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={e.current} onChange={ev => update(e.id, { current: ev.target.checked, endDate: "" })} className="accent-orange-500" />
                En cours
              </label>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium py-2">
        <Plus className="h-4 w-4" /> Ajouter une formation
      </button>
    </div>
  );
}

function SkillsSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  function add() { onChange({ ...data, skills: [...data.skills, { id: uid(), name: "", level: 3 }] }); }
  function remove(id: string) { onChange({ ...data, skills: data.skills.filter(s => s.id !== id) }); }
  function update(id: string, patch: Partial<CvSkill>) {
    onChange({ ...data, skills: data.skills.map(s => s.id === id ? { ...s, ...patch } : s) });
  }
  return (
    <div className="space-y-3">
      {data.skills.map((s) => (
        <div key={s.id} className="flex items-center gap-3">
          <AutocompleteInput className={inputCls} wrapperClassName="flex-1" value={s.name} onChange={v => update(s.id, { name: v })} placeholder="React, Comptabilité, Excel..." staticSuggestions={SUGGESTED_SKILLS} />
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => update(s.id, { level: n })}
                className={`w-6 h-6 rounded-full text-xs font-bold transition-colors ${n <= s.level ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                {n}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => remove(s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium py-2">
        <Plus className="h-4 w-4" /> Ajouter une compétence
      </button>
    </div>
  );
}

function LanguagesSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  function add() { onChange({ ...data, languages: [...data.languages, { id: uid(), name: "", level: "Courant" }] }); }
  function remove(id: string) { onChange({ ...data, languages: data.languages.filter(l => l.id !== id) }); }
  function update(id: string, patch: Partial<CvLanguage>) {
    onChange({ ...data, languages: data.languages.map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  return (
    <div className="space-y-3">
      {data.languages.map((l) => (
        <div key={l.id} className="flex items-center gap-3">
          <AutocompleteInput className={inputCls} wrapperClassName="flex-1" value={l.name} onChange={v => update(l.id, { name: v })} placeholder="Français, Sango, Anglais..." staticSuggestions={SUGGESTED_LANGUAGES} />
          <select className={inputCls + " w-36"} value={l.level} onChange={e => update(l.id, { level: e.target.value })}>
            {LANGUAGE_LEVELS.map(lv => <option key={lv} value={lv}>{lv}</option>)}
          </select>
          <button type="button" onClick={() => remove(l.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-2 text-orange-500 hover:text-orange-600 text-sm font-medium py-2">
        <Plus className="h-4 w-4" /> Ajouter une langue
      </button>
    </div>
  );
}

function InterestsSection({ data, onChange }: { data: CvData; onChange: (d: CvData) => void }) {
  const [input, setInput] = useState("");

  function add() {
    const val = input.trim();
    if (!val || data.interests.includes(val)) return;
    onChange({ ...data, interests: [...data.interests, val] });
    setInput("");
  }
  function remove(interest: string) {
    onChange({ ...data, interests: data.interests.filter(i => i !== interest) });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Ajoutez vos loisirs, sports, activités... Ex : Lecture, Football, Photographie</p>
      <div className="flex gap-2">
        <AutocompleteInput
          className={inputCls}
          wrapperClassName="flex-1"
          value={input}
          onChange={setInput}
          placeholder="Ajouter un centre d'intérêt..."
          staticSuggestions={SUGGESTED_INTERESTS}
        />
        <button type="button" onClick={add} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {data.interests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.interests.map((interest) => (
            <span key={interest} className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-sm px-3 py-1.5 rounded-full">
              {interest}
              <button type="button" onClick={() => remove(interest)} className="text-orange-400 hover:text-orange-600">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────────────────────── */
export default function CvBuilderClient({ initial }: { initial: { data: CvData | null; template: CvTemplate } }) {
  const [cvData, setCvData] = useState<CvData>({ ...EMPTY_CV, ...(initial.data ?? {}) });
  const [template, setTemplate] = useState<CvTemplate>(initial.template ?? "modern");
  const [activeTab, setActiveTab] = useState("personal");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async (d: CvData, t: CvTemplate) => {
    setSaving(true);
    await fetch("/api/cv-builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: d, template: t }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  // Sauvegarde auto toutes les 30s
  useEffect(() => {
    const timer = setInterval(() => save(cvData, template), 30000);
    return () => clearInterval(timer);
  }, [cvData, template, save]);

  function handleChange(d: CvData) { setCvData(d); }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-gray-900 text-sm">Créateur de CV</h1>
          {saving && <span className="text-xs text-gray-400">Sauvegarde...</span>}
          {saved && <span className="flex items-center gap-1 text-xs text-green-500"><Check className="h-3 w-3" /> Sauvegardé</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setMode("edit")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "edit" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
              <Edit3 className="h-3.5 w-3.5" /> Éditer
            </button>
            <button onClick={() => setMode("preview")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "preview" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
              <Eye className="h-3.5 w-3.5" /> Aperçu
            </button>
          </div>
          <button onClick={() => save(cvData, template)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors">
            <Save className="h-3.5 w-3.5" /> Sauvegarder
          </button>
          <PdfDownloadButton data={cvData} template={template} />
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Panneau gauche : éditeur ──────────────────────────────────────────── */}
        <div className={`${mode === "preview" ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-gray-200 overflow-y-auto`}>
          {/* Sélecteur de template */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Choisir un template</p>
            <div className="flex gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => { setTemplate(t.id); save(cvData, t.id); }}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all text-xs ${template === t.id ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`w-6 h-6 rounded-full ${t.color}`} />
                  <span className={`font-medium ${template === t.id ? "text-orange-600" : "text-gray-600"}`}>{t.label}</span>
                  <span className="text-[10px] text-gray-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs sections */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {SECTION_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id ? "border-orange-400 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Section active */}
          <div className="p-4 flex-1 overflow-y-auto">
            {activeTab === "personal"    && <PersonalSection    data={cvData} onChange={handleChange} />}
            {activeTab === "experiences" && <ExperiencesSection data={cvData} onChange={handleChange} />}
            {activeTab === "education"   && <EducationSection   data={cvData} onChange={handleChange} />}
            {activeTab === "skills"      && <SkillsSection      data={cvData} onChange={handleChange} />}
            {activeTab === "languages"   && <LanguagesSection   data={cvData} onChange={handleChange} />}
            {activeTab === "interests"   && <InterestsSection   data={cvData} onChange={handleChange} />}
          </div>
        </div>

        {/* ── Panneau droit : aperçu ─────────────────────────────────────────────── */}
        <div className={`${mode === "edit" ? "hidden lg:flex" : "flex"} flex-1 flex-col bg-gray-100 overflow-auto`}>
          <div className="flex-1 p-6 flex justify-center">
            <div className="w-full max-w-[680px] shadow-xl rounded-sm overflow-hidden bg-white"
              style={{ aspectRatio: "210 / 297" }}>
              <CvPreview data={cvData} template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
