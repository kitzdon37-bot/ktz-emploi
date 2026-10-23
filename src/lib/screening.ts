// Questions de présélection posées aux candidats au moment de postuler (façon Indeed).
// Ce fichier est partagé entre le client (formulaires) et le serveur (validation).

export type ScreeningQuestionType =
  | "yesno"     // Oui / Non
  | "single"    // Choix unique (boutons radio)
  | "multiple"  // Cases à cocher (plusieurs choix)
  | "select"    // Liste déroulante
  | "number"    // Nombre (années d'expérience, prétentions…)
  | "text"      // Texte court
  | "textarea"  // Texte long
  | "date"      // Date (disponibilité…)
  | "file";     // Pièce jointe (diplôme, attestation…)

// none = simple information · preferred = un plus · eliminatory = critère obligatoire · quiz = question de test notée
export type ScreeningRule = "none" | "preferred" | "eliminatory" | "quiz";

export interface ScreeningQuestion {
  id: string;
  type: ScreeningQuestionType;
  label: string;
  required: boolean;
  options?: string[];
  rule?: ScreeningRule;
  expected?: string[]; // réponses attendues (Oui/Non, choix) ou bonnes réponses (quiz)
  min?: number;        // valeur minimale attendue (type number)
}

export type ScreeningAnswerValue = string | string[] | number | null;

export interface ScreeningAnswer {
  questionId: string;
  label: string;
  type: ScreeningQuestionType;
  rule: ScreeningRule;
  value: ScreeningAnswerValue;
  ok: boolean | null; // null = pas de réponse attendue
}

export interface ScreeningResult {
  answers: ScreeningAnswer[];
  meetsRequirements: boolean;
  quizScore: number | null; // % de bonnes réponses aux questions de test
}

export const MAX_SCREENING_QUESTIONS = 15;

export const QUESTION_TYPES: { value: ScreeningQuestionType; label: string; hint: string }[] = [
  { value: "yesno",    label: "Oui / Non",             hint: "Avez-vous le permis B ?" },
  { value: "single",   label: "Choix unique",          hint: "Niveau d'études" },
  { value: "multiple", label: "Cases à cocher",        hint: "Logiciels maîtrisés" },
  { value: "select",   label: "Liste déroulante",      hint: "Ville de résidence" },
  { value: "number",   label: "Nombre",                hint: "Années d'expérience" },
  { value: "text",     label: "Texte court",           hint: "Intitulé du diplôme" },
  { value: "textarea", label: "Texte long",            hint: "Pourquoi ce poste ?" },
  { value: "date",     label: "Date",                  hint: "Date de disponibilité" },
  { value: "file",     label: "Pièce jointe",          hint: "Copie du diplôme" },
];

export const RULES: { value: ScreeningRule; label: string; help: string }[] = [
  { value: "none",        label: "Information",  help: "La réponse est simplement transmise." },
  { value: "preferred",   label: "Préférée",     help: "Un plus, sans écarter le candidat." },
  { value: "eliminatory", label: "Éliminatoire", help: "Si la réponse ne correspond pas, la candidature est marquée « Ne remplit pas les critères »." },
  { value: "quiz",        label: "Test noté",    help: "Question de test : le candidat obtient un score sur les bonnes réponses." },
];

export const DEGREE_LEVELS = ["Aucun diplôme", "BEPC", "CAP / BEP", "Baccalauréat", "BTS / DUT (Bac+2)", "Licence (Bac+3)", "Master (Bac+5)", "Doctorat"];

export function typeHasOptions(type: ScreeningQuestionType) {
  return type === "single" || type === "multiple" || type === "select";
}

// Les règles « attendues » ne s'appliquent qu'aux types dont la réponse est vérifiable
export function typeSupportsRule(type: ScreeningQuestionType, rule: ScreeningRule) {
  if (rule === "none") return true;
  if (rule === "quiz") return type === "yesno" || typeHasOptions(type);
  return type === "yesno" || typeHasOptions(type) || type === "number";
}

type Template = Omit<ScreeningQuestion, "id">;

export const SCREENING_TEMPLATES: { category: string; questions: Template[] }[] = [
  {
    category: "Diplômes et formation",
    questions: [
      { type: "single", label: "Quel est votre plus haut diplôme obtenu ?", required: true, options: DEGREE_LEVELS, rule: "none" },
      { type: "yesno", label: "Avez-vous un diplôme dans le domaine du poste ?", required: true, rule: "eliminatory", expected: ["Oui"] },
      { type: "text", label: "Intitulé exact de votre diplôme et établissement", required: false, rule: "none" },
      { type: "yesno", label: "Possédez-vous une certification professionnelle en lien avec le poste ?", required: false, rule: "preferred", expected: ["Oui"] },
      { type: "file", label: "Joignez une copie de votre diplôme ou attestation", required: false, rule: "none" },
    ],
  },
  {
    category: "Expérience",
    questions: [
      { type: "number", label: "Combien d'années d'expérience avez-vous dans ce métier ?", required: true, rule: "eliminatory", min: 2 },
      { type: "yesno", label: "Avez-vous déjà occupé un poste similaire ?", required: true, rule: "preferred", expected: ["Oui"] },
      { type: "yesno", label: "Avez-vous de l'expérience en ONG ou organisation internationale ?", required: false, rule: "preferred", expected: ["Oui"] },
      { type: "number", label: "Combien de personnes avez-vous déjà encadrées ?", required: false, rule: "none" },
    ],
  },
  {
    category: "Compétences et tests",
    questions: [
      { type: "single", label: "Quel est votre niveau sur Excel ?", required: true, options: ["Débutant", "Intermédiaire", "Avancé"], rule: "preferred", expected: ["Intermédiaire", "Avancé"] },
      { type: "multiple", label: "Quels logiciels maîtrisez-vous ?", required: false, options: ["Word", "Excel", "PowerPoint", "Sage", "Tompro", "QuickBooks"], rule: "none" },
      { type: "yesno", label: "Acceptez-vous de passer un test écrit ou technique ?", required: true, rule: "eliminatory", expected: ["Oui"] },
      { type: "single", label: "Question de test : (écrivez votre question)", required: true, options: ["Réponse A", "Réponse B", "Réponse C"], rule: "quiz", expected: ["Réponse A"] },
    ],
  },
  {
    category: "Langues",
    questions: [
      { type: "single", label: "Quel est votre niveau en français ?", required: true, options: ["Notions", "Courant", "Langue maternelle"], rule: "none" },
      { type: "single", label: "Quel est votre niveau en anglais ?", required: false, options: ["Aucun", "Notions", "Intermédiaire", "Courant"], rule: "none" },
      { type: "multiple", label: "Quelles autres langues parlez-vous ?", required: false, options: ["Sango", "Arabe", "Lingala", "Espagnol"], rule: "none" },
    ],
  },
  {
    category: "Mobilité et permis",
    questions: [
      { type: "yesno", label: "Avez-vous le permis de conduire B ?", required: true, rule: "eliminatory", expected: ["Oui"] },
      { type: "yesno", label: "Disposez-vous d'un véhicule ou d'une moto ?", required: false, rule: "preferred", expected: ["Oui"] },
      { type: "yesno", label: "Acceptez-vous des déplacements ou une affectation en province ?", required: true, rule: "eliminatory", expected: ["Oui"] },
    ],
  },
  {
    category: "Disponibilité",
    questions: [
      { type: "date", label: "À partir de quelle date êtes-vous disponible ?", required: true, rule: "none" },
      { type: "yesno", label: "Avez-vous un préavis à respecter ?", required: false, rule: "none" },
      { type: "single", label: "Quel temps de travail recherchez-vous ?", required: false, options: ["Temps plein", "Temps partiel", "Indifférent"], rule: "none" },
    ],
  },
  {
    category: "Salaire",
    questions: [
      { type: "number", label: "Quelles sont vos prétentions salariales (XAF / mois) ?", required: false, rule: "none" },
      { type: "yesno", label: "La rémunération proposée vous convient-elle ?", required: false, rule: "preferred", expected: ["Oui"] },
    ],
  },
  {
    category: "Administratif",
    questions: [
      { type: "yesno", label: "Avez-vous une pièce d'identité valide ?", required: true, rule: "eliminatory", expected: ["Oui"] },
      { type: "yesno", label: "Pouvez-vous fournir un extrait de casier judiciaire ?", required: false, rule: "preferred", expected: ["Oui"] },
      { type: "yesno", label: "Pouvez-vous fournir deux références professionnelles ?", required: false, rule: "preferred", expected: ["Oui"] },
    ],
  },
  {
    category: "Motivation",
    questions: [
      { type: "textarea", label: "Pourquoi ce poste vous intéresse-t-il ?", required: false, rule: "none" },
      { type: "textarea", label: "Qu'apporteriez-vous à notre entreprise ?", required: false, rule: "none" },
    ],
  },
];

export function newQuestionId() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function str(v: unknown, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Nettoie les questions envoyées par le recruteur (jamais faire confiance au client). */
export function sanitizeQuestions(input: unknown): ScreeningQuestion[] {
  if (!Array.isArray(input)) return [];
  const validTypes = QUESTION_TYPES.map((t) => t.value);
  const validRules = RULES.map((r) => r.value);
  const out: ScreeningQuestion[] = [];

  for (const raw of input.slice(0, MAX_SCREENING_QUESTIONS)) {
    if (!raw || typeof raw !== "object") continue;
    const q = raw as Record<string, unknown>;
    const type = q.type as ScreeningQuestionType;
    const label = str(q.label, 300);
    if (!validTypes.includes(type) || !label) continue;

    const options = typeHasOptions(type)
      ? Array.from(new Set((Array.isArray(q.options) ? q.options : []).map((o) => str(o, 120)).filter(Boolean))).slice(0, 20)
      : undefined;
    if (options && options.length < 2) continue;

    let rule: ScreeningRule = validRules.includes(q.rule as ScreeningRule) ? (q.rule as ScreeningRule) : "none";
    if (!typeSupportsRule(type, rule)) rule = "none";

    const allowed = type === "yesno" ? ["Oui", "Non"] : options ?? [];
    const expected = Array.isArray(q.expected) ? q.expected.map((e) => str(e, 120)).filter((e) => allowed.includes(e)) : [];
    const min = typeof q.min === "number" && isFinite(q.min) ? q.min : undefined;

    // Une règle sans réponse attendue n'a pas de sens : on la retire
    if (rule !== "none" && type !== "number" && expected.length === 0) rule = "none";
    if (rule !== "none" && type === "number" && min === undefined) rule = "none";

    out.push({
      id: str(q.id, 40) || newQuestionId(),
      type,
      label,
      required: !!q.required || rule === "eliminatory" || rule === "quiz",
      ...(options ? { options } : {}),
      rule,
      ...(rule !== "none" && type !== "number" ? { expected } : {}),
      ...(rule !== "none" && type === "number" ? { min } : {}),
    });
  }
  return out;
}

function isEmpty(v: ScreeningAnswerValue) {
  return v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

function normalizeValue(q: ScreeningQuestion, raw: unknown): ScreeningAnswerValue {
  switch (q.type) {
    case "multiple":
      return Array.isArray(raw) ? raw.map((v) => str(v, 120)).filter((v) => q.options?.includes(v)) : [];
    case "number": {
      const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
      return isFinite(n) ? n : null;
    }
    case "yesno": {
      const v = str(raw, 3);
      return v === "Oui" || v === "Non" ? v : null;
    }
    case "single":
    case "select": {
      const v = str(raw, 120);
      return q.options?.includes(v) ? v : null;
    }
    case "textarea":
      return str(raw, 3000) || null;
    case "file": {
      const v = str(raw, 500);
      return v.startsWith("https://") ? v : null;
    }
    default:
      return str(raw, 300) || null;
  }
}

function checkAnswer(q: ScreeningQuestion, v: ScreeningAnswerValue): boolean | null {
  if (!q.rule || q.rule === "none") return null;
  if (isEmpty(v)) return false;
  if (q.type === "number") return typeof v === "number" && q.min !== undefined && v >= q.min;
  const expected = q.expected ?? [];
  if (q.type === "multiple") {
    const picked = v as string[];
    // Quiz : il faut exactement les bonnes cases ; sinon : toutes les cases attendues cochées
    return q.rule === "quiz"
      ? picked.length === expected.length && expected.every((e) => picked.includes(e))
      : expected.every((e) => picked.includes(e));
  }
  return expected.includes(v as string);
}

/**
 * Vérifie les réponses du candidat.
 * Renvoie une erreur si une question obligatoire est sans réponse.
 */
export function evaluateAnswers(
  questions: ScreeningQuestion[],
  rawAnswers: unknown,
  { enforceRequired = true } = {},
): { error: string } | ScreeningResult {
  const map = rawAnswers && typeof rawAnswers === "object" ? (rawAnswers as Record<string, unknown>) : {};
  const answers: ScreeningAnswer[] = [];

  for (const q of questions) {
    const value = normalizeValue(q, map[q.id]);
    if (enforceRequired && q.required && isEmpty(value)) {
      return { error: `Veuillez répondre à la question : « ${q.label} »` };
    }
    answers.push({ questionId: q.id, label: q.label, type: q.type, rule: q.rule ?? "none", value, ok: checkAnswer(q, value) });
  }

  const quiz = answers.filter((a) => a.rule === "quiz");
  return {
    answers,
    meetsRequirements: answers.every((a) => a.rule !== "eliminatory" || a.ok === true),
    quizScore: quiz.length ? Math.round((quiz.filter((a) => a.ok).length / quiz.length) * 100) : null,
  };
}

export function formatAnswerValue(a: Pick<ScreeningAnswer, "type" | "value">): string {
  if (isEmpty(a.value)) return "Pas de réponse";
  if (Array.isArray(a.value)) return a.value.join(", ");
  if (a.type === "date" && typeof a.value === "string") {
    const d = new Date(a.value);
    return isNaN(d.getTime()) ? a.value : d.toLocaleDateString("fr-FR");
  }
  if (a.type === "number" && typeof a.value === "number") return a.value.toLocaleString("fr-FR");
  return String(a.value);
}
