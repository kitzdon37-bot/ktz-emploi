import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatSalary(min?: number | null, max?: number | null, currency = "XAF"): string {
  if (!min && !max) return "Salaire non précisé";
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `À partir de ${fmt(min)}`;
  return `Jusqu'à ${fmt(max!)}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} jour(s)`;
  return formatDate(date);
}

export const JOB_TYPES = [
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Stage", label: "Stage" },
  { value: "Alternance", label: "Alternance" },
  { value: "Freelance", label: "Freelance" },
  { value: "Temps partiel", label: "Temps partiel" },
  { value: "Bénévolat", label: "Bénévolat" },
];

export const JOB_CATEGORIES = [
  "Agriculture & Élevage",
  "Banque & Finance",
  "BTP & Construction",
  "Commerce & Vente",
  "Communication & Marketing",
  "Comptabilité & Audit",
  "Éducation & Formation",
  "Environnement & Mines",
  "Humanitaire & ONG",
  "Informatique & Télécoms",
  "Journalisme & Médias",
  "Juridique & Droit",
  "Logistique & Transport",
  "Médecine & Santé",
  "RH & Administration",
  "Restauration & Hôtellerie",
  "Sécurité",
  "Services à la personne",
  "Tourisme",
  "Autre",
];

export const EXPERIENCE_LEVELS = [
  { value: "Debutant", label: "Débutant (0-2 ans)" },
  { value: "Intermediaire", label: "Intermédiaire (2-5 ans)" },
  { value: "Senior", label: "Senior (5-10 ans)" },
  { value: "Expert", label: "Expert (10+ ans)" },
];

export const RCA_LOCATIONS = [
  "Bangui",
  "Bambari",
  "Bimbo",
  "Berbérati",
  "Carnot",
  "Kaga-Bandoro",
  "Bozoum",
  "Bouar",
  "Nola",
  "Bossangoa",
  "Mbaïki",
  "Sibut",
  "Bria",
  "Ndélé",
  "Alindao",
  "Télé travail",
  "Autre",
];

export const COMPANY_SIZES = [
  { value: "TPE", label: "TPE (1-9 salariés)" },
  { value: "PME", label: "PME (10-249 salariés)" },
  { value: "ETI", label: "ETI (250-4999 salariés)" },
  { value: "Grande", label: "Grande entreprise (5000+)" },
  { value: "ONG", label: "ONG / Association" },
  { value: "Gouvernement", label: "Gouvernement / Institution" },
];

export const APPLICATION_STATUSES: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  REVIEWING: { label: "En cours d'examen", color: "bg-blue-100 text-blue-800" },
  INTERVIEW: { label: "Entretien", color: "bg-purple-100 text-purple-800" },
  ACCEPTED: { label: "Accepté", color: "bg-red-100 text-green-800" },
  REJECTED: { label: "Refusé", color: "bg-red-100 text-red-800" },
};
