"use client";

import { useState } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import type { ScreeningQuestion } from "@/lib/screening";

export type AnswerMap = Record<string, string | string[]>;

interface Props {
  questions: ScreeningQuestion[];
  answers: AnswerMap;
  onChange: (answers: AnswerMap) => void;
}

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";

/** Renvoie l'intitulé de la première question obligatoire sans réponse, ou null. */
export function firstMissingAnswer(questions: ScreeningQuestion[], answers: AnswerMap) {
  const missing = questions.find((q) => {
    const v = answers[q.id];
    return q.required && (v === undefined || v === "" || (Array.isArray(v) && v.length === 0));
  });
  return missing?.label ?? null;
}

function FileAnswer({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("cv", file);
      fd.append("kind", "document");
      const res = await fetch("/api/upload/cv", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur d'envoi du fichier"); return; }
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 border border-green-200 bg-green-50 rounded-xl text-sm">
        <Paperclip className="h-4 w-4 text-green-600 flex-shrink-0" />
        <a href={value} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-gray-700 hover:underline">Fichier joint</a>
        <button type="button" onClick={() => onChange("")}>
          <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors cursor-pointer bg-white">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        {uploading ? "Envoi en cours..." : "Joindre un fichier (PDF, Word, JPG, PNG — max 5 Mo)"}
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
          className="hidden"
          disabled={uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
      </label>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function ScreeningQuestionsForm({ questions, answers, onChange }: Props) {
  if (questions.length === 0) return null;

  function set(id: string, v: string | string[]) {
    onChange({ ...answers, [id]: v });
  }

  return (
    <div className="mb-4 space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-900">Questions du recruteur</p>
        <p className="text-xs text-gray-500">Les questions marquées d&apos;un * sont obligatoires.</p>
      </div>

      {questions.map((q) => {
        const value = answers[q.id];
        const str = typeof value === "string" ? value : "";
        const list = Array.isArray(value) ? value : [];
        return (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-3.5">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {q.label} {q.required && <span className="text-orange-500">*</span>}
            </p>

            {(q.type === "yesno" || q.type === "single") && (
              <div className="flex flex-wrap gap-2">
                {(q.type === "yesno" ? ["Oui", "Non"] : q.options ?? []).map((o) => (
                  <label
                    key={o}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${str === o ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-600 hover:border-orange-300"}`}
                  >
                    <input type="radio" name={q.id} checked={str === o} onChange={() => set(q.id, o)} className="text-orange-500 focus:ring-orange-400" />
                    {o}
                  </label>
                ))}
              </div>
            )}

            {q.type === "multiple" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(q.options ?? []).map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={list.includes(o)}
                      onChange={(e) => set(q.id, e.target.checked ? [...list, o] : list.filter((x) => x !== o))}
                      className="rounded text-orange-500 focus:ring-orange-400"
                    />
                    {o}
                  </label>
                ))}
              </div>
            )}

            {q.type === "select" && (
              <select value={str} onChange={(e) => set(q.id, e.target.value)} className={inputCls}>
                <option value="">Choisir...</option>
                {(q.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}

            {q.type === "number" && (
              <input type="number" min="0" value={str} onChange={(e) => set(q.id, e.target.value)} className={`${inputCls} max-w-[200px]`} />
            )}

            {q.type === "text" && (
              <input type="text" value={str} maxLength={300} onChange={(e) => set(q.id, e.target.value)} className={inputCls} />
            )}

            {q.type === "textarea" && (
              <textarea value={str} maxLength={3000} rows={3} onChange={(e) => set(q.id, e.target.value)} className={`${inputCls} resize-none`} />
            )}

            {q.type === "date" && (
              <input type="date" value={str} onChange={(e) => set(q.id, e.target.value)} className={`${inputCls} max-w-[200px]`} />
            )}

            {q.type === "file" && <FileAnswer value={str} onChange={(url) => set(q.id, url)} />}
          </div>
        );
      })}
    </div>
  );
}
