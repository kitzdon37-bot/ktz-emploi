"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, ListChecks, BookOpen, X } from "lucide-react";
import {
  ScreeningQuestion, ScreeningQuestionType, ScreeningRule,
  QUESTION_TYPES, RULES, SCREENING_TEMPLATES, MAX_SCREENING_QUESTIONS,
  typeHasOptions, typeSupportsRule, newQuestionId,
} from "@/lib/screening";

interface Props {
  value: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";

export default function ScreeningQuestionsEditor({ value, onChange }: Props) {
  const [showBank, setShowBank] = useState(false);
  const full = value.length >= MAX_SCREENING_QUESTIONS;

  function update(id: string, patch: Partial<ScreeningQuestion>) {
    onChange(value.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function changeType(q: ScreeningQuestion, type: ScreeningQuestionType) {
    const rule: ScreeningRule = typeSupportsRule(type, q.rule ?? "none") ? q.rule ?? "none" : "none";
    update(q.id, {
      type,
      rule,
      options: typeHasOptions(type) ? (q.options?.length ? q.options : ["Option 1", "Option 2"]) : undefined,
      expected: [],
      min: undefined,
    });
  }

  function add(template?: Omit<ScreeningQuestion, "id">) {
    if (full) return;
    const q: ScreeningQuestion = template
      ? { ...template, id: newQuestionId(), options: template.options ? [...template.options] : undefined, expected: template.expected ? [...template.expected] : undefined }
      : { id: newQuestionId(), type: "yesno", label: "", required: true, rule: "none" };
    onChange([...value, q]);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const [q] = next.splice(index, 1);
    next.splice(index + dir, 0, q);
    onChange(next);
  }

  function toggleExpected(q: ScreeningQuestion, option: string) {
    const current = q.expected ?? [];
    // Oui/Non : une seule réponse attendue
    const expected = q.type === "yesno"
      ? [option]
      : current.includes(option) ? current.filter((e) => e !== option) : [...current, option];
    update(q.id, { expected });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <ListChecks className="h-4 w-4 text-orange-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">
            Questions aux candidats <span className="text-gray-400 font-normal text-sm">(optionnel)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Diplômes, expérience, tests… Les candidats y répondent en postulant. Les critères éliminatoires vous permettent de repérer immédiatement les profils qui ne conviennent pas.
          </p>
        </div>
      </div>

      <div className="space-y-4 mt-5">
        {value.map((q, i) => {
          const supportsExpected = q.rule && q.rule !== "none";
          const choices = q.type === "yesno" ? ["Oui", "Non"] : (q.options ?? []).filter((o) => o.trim());
          return (
            <div key={q.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Question {i + 1}</span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Monter" className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} title="Descendre" className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onChange(value.filter((x) => x.id !== q.id))} title="Supprimer" className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={q.label}
                  onChange={(e) => update(q.id, { label: e.target.value })}
                  placeholder="ex: Avez-vous une Licence en comptabilité ?"
                  maxLength={300}
                  className={inputCls}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type de réponse</label>
                    <select value={q.type} onChange={(e) => changeType(q, e.target.value as ScreeningQuestionType)} className={inputCls}>
                      {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Importance</label>
                    <select
                      value={q.rule ?? "none"}
                      onChange={(e) => {
                        const rule = e.target.value as ScreeningRule;
                        update(q.id, { rule, required: rule === "eliminatory" || rule === "quiz" ? true : q.required });
                      }}
                      className={inputCls}
                    >
                      {RULES.filter((r) => typeSupportsRule(q.type, r.value)).map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-400 -mt-1">{RULES.find((r) => r.value === (q.rule ?? "none"))?.help}</p>

                {typeHasOptions(q.type) && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Choix proposés <span className="font-normal text-gray-400">(un par ligne)</span></label>
                    <textarea
                      value={(q.options ?? []).join("\n")}
                      onChange={(e) => {
                        const options = e.target.value.split("\n");
                        update(q.id, { options, expected: (q.expected ?? []).filter((x) => options.includes(x)) });
                      }}
                      rows={Math.min(Math.max((q.options?.length ?? 2) + 1, 3), 8)}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                )}

                {supportsExpected && q.type !== "number" && choices.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {q.rule === "quiz" ? "Bonne(s) réponse(s)" : q.type === "multiple" ? "Cases qui doivent être cochées" : "Réponse(s) attendue(s)"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {choices.map((o) => {
                        const on = q.expected?.includes(o);
                        return (
                          <button
                            type="button"
                            key={o}
                            onClick={() => toggleExpected(q, o)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${on ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"}`}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                    {!q.expected?.length && <p className="text-xs text-amber-600 mt-1">Choisissez au moins une réponse attendue, sinon la question sera traitée comme simple information.</p>}
                  </div>
                )}

                {supportsExpected && q.type === "number" && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600">Valeur minimale exigée</label>
                    <input
                      type="number"
                      value={q.min ?? ""}
                      onChange={(e) => update(q.id, { min: e.target.value === "" ? undefined : Number(e.target.value) })}
                      placeholder="ex: 3"
                      className="w-28 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={q.required}
                    disabled={q.rule === "eliminatory" || q.rule === "quiz"}
                    onChange={(e) => update(q.id, { required: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-400"
                  />
                  Réponse obligatoire
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {showBank && (
        <div className="mt-4 border border-orange-100 bg-orange-50/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Banque de questions</p>
            <button type="button" onClick={() => setShowBank(false)} className="p-1 text-gray-400 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {SCREENING_TEMPLATES.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{group.category}</p>
                <div className="space-y-1.5">
                  {group.questions.map((t) => {
                    const added = value.some((q) => q.label === t.label);
                    return (
                      <button
                        type="button"
                        key={t.label}
                        onClick={() => add(t)}
                        disabled={added || full}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-400 disabled:opacity-50 disabled:hover:border-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                        <span className="flex-1">{t.label}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{QUESTION_TYPES.find((x) => x.value === t.type)?.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          onClick={() => setShowBank((v) => !v)}
          disabled={full}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <BookOpen className="h-4 w-4" />
          Choisir dans la banque de questions
        </button>
        <button
          type="button"
          onClick={() => add()}
          disabled={full}
          className="flex items-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Question personnalisée
        </button>
        {full && <span className="self-center text-xs text-gray-400">Maximum {MAX_SCREENING_QUESTIONS} questions</span>}
      </div>
    </div>
  );
}
