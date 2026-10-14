// Nettoyage des entreprises : détection des doublons probables et redirection
// des anciennes adresses (/entreprises/<ancien-slug>) vers l'entreprise conservée.
import { prisma } from "@/lib/prisma";

const REDIRECTS_KEY = "company_slug_redirects";

// Mots trop génériques pour distinguer deux organisations
const STOPWORDS = new Set([
  "rca", "centrafrique", "centrafricaine", "centrafricain", "republique", "bangui",
  "de", "du", "des", "la", "le", "les", "l", "d", "et", "en", "pour", "the", "of", "and",
  "sarl", "sa", "sas", "ong", "asbl", "international", "internationale", "organisation", "organization",
]);

// Sigles équivalents français / anglais
const ALIASES: Record<string, string> = {
  undp: "pnud", iom: "oim", who: "oms", wfp: "pam", ifrc: "ficr", unhcr: "hcr", fao: "fao",
};

function tokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !STOPWORDS.has(t) && !/^\d+$/.test(t));
}

/** Clé de regroupement : premier mot significatif du nom (avec équivalences de sigles). */
export function duplicateKey(name: string): string | null {
  const t = tokens(name)[0];
  if (!t || t.length < 2) return null;
  return ALIASES[t] ?? t;
}

/** Regroupe les entreprises dont le nom commence par le même mot significatif. */
export function suggestDuplicateGroups<T extends { id: string; name: string }>(companies: T[]): T[][] {
  const groups = new Map<string, T[]>();
  for (const c of companies) {
    const key = duplicateKey(c.name);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return [...groups.values()].filter((g) => g.length > 1);
}

/** Entreprise probablement créée pour des tests. */
export function looksLikeTest(c: { name: string; slug: string }): boolean {
  return /\b(test|demo|essai|exemple)\b/i.test(`${c.name} ${c.slug.replace(/-/g, " ")}`);
}

export async function getSlugRedirects(): Promise<Record<string, string>> {
  const row = await prisma.siteSetting.findUnique({ where: { key: REDIRECTS_KEY } });
  if (!row) return {};
  try {
    return JSON.parse(row.value) as Record<string, string>;
  } catch {
    return {};
  }
}

/** Ajoute des redirections ancien slug → nouveau slug (et met à jour celles qui pointaient vers un slug supprimé). */
export async function addSlugRedirects(oldSlugs: string[], target: string) {
  const map = await getSlugRedirects();
  for (const [from, to] of Object.entries(map)) {
    if (oldSlugs.includes(to)) map[from] = target;
  }
  for (const s of oldSlugs) if (s !== target) map[s] = target;
  delete map[target];
  await prisma.siteSetting.upsert({
    where: { key: REDIRECTS_KEY },
    create: { key: REDIRECTS_KEY, value: JSON.stringify(map) },
    update: { value: JSON.stringify(map) },
  });
}
