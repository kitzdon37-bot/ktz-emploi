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

// ── Fusion / suppression (utilisées par l'outil admin) ───────────────────────

export class CleanupError extends Error {
  constructor(public status: number, message: string, public extra: Record<string, unknown> = {}) {
    super(message);
  }
}

const FILLABLE = ["logo", "website", "description", "sector", "size", "location", "phone", "email", "banner", "videoUrl", "photos", "foundedYear"] as const;

type Sub = { plan: string; status: string; paymentRef?: string | null; paymentMethod?: string | null } | null;
// Vrai paiement = référence de transaction réelle (pas un abonnement offert depuis l'admin)
const isRealPayment = (s: Sub) => !!s?.paymentRef && s.paymentMethod !== "admin" && s.paymentRef !== "ADMIN_UNLIMITED";
const isPaid = (s: Sub) => !!s && s.status === "ACTIVE" && s.plan !== "FREE";
const PLAN_RANK: Record<string, number> = { FREE: 0, MICRO: 1, STARTER: 2, PRO: 3 };
const rank = (s: Sub) => (isPaid(s) ? PLAN_RANK[s!.plan] ?? 1 : -1);

/**
 * Fusionne des entreprises en double dans `keepId` : offres (et donc candidatures), modèles,
 * avis et abonnement payant sont déplacés, les champs vides complétés, les doublons supprimés,
 * et leurs anciennes adresses redirigées vers la fiche conservée.
 */
export async function mergeCompanies(keepId: string, removeIdsIn: string[], actorEmail?: string) {
  const removeIds = [...new Set(removeIdsIn)].filter((id) => id !== keepId);
  if (!keepId || removeIds.length === 0) throw new CleanupError(400, "Choisissez l'entreprise à garder et au moins un doublon");

  const all = await prisma.company.findMany({
    where: { id: { in: [keepId, ...removeIds] } },
    include: { subscription: true, user: { select: { email: true, phone: true } } },
  });
  type C = (typeof all)[number];
  const keep = all.find((c: C) => c.id === keepId);
  const removed = all.filter((c: C) => c.id !== keepId);
  if (!keep || removed.length !== removeIds.length) throw new CleanupError(404, "Entreprise introuvable");

  // Abonnements : l'entreprise gardée conserve le meilleur abonnement actif.
  // Les abonnements en double sont abandonnés, sauf s'ils correspondent à un vrai paiement
  // (référence de transaction) : dans ce cas, décision manuelle.
  const paidRemoved = removed.filter((c: C) => isPaid(c.subscription)).sort((a: C, b: C) => rank(b.subscription) - rank(a.subscription));
  const transfer = paidRemoved.length > 0 && rank(paidRemoved[0].subscription) > rank(keep.subscription) ? paidRemoved[0] : null;
  const dropped = paidRemoved.filter((c: C) => c !== transfer);
  if (dropped.some((c: C) => isRealPayment(c.subscription))) {
    throw new CleanupError(409, "Un des doublons a un abonnement payé (référence de paiement) : gardez cette entreprise-là, ou traitez l'abonnement d'abord.");
  }
  if (isRealPayment(keep.subscription) && transfer) {
    throw new CleanupError(409, "L'entreprise gardée a un abonnement payé et un doublon a un abonnement supérieur : décision manuelle nécessaire.");
  }

  const fill: Record<string, unknown> = {};
  for (const f of FILLABLE) {
    if (keep[f] == null || keep[f] === "") {
      const donor = removed.find((c: C) => c[f] != null && c[f] !== "");
      if (donor) fill[f] = donor[f];
    }
  }
  if (!keep.verified && removed.some((c: C) => c.verified)) fill.verified = true;
  if (!keep.superRecruiter && removed.some((c: C) => c.superRecruiter)) fill.superRecruiter = true;

  const keptReviewers = new Set(
    (await prisma.companyReview.findMany({ where: { companyId: keepId }, select: { userId: true } }))
      .map((r: { userId: string }) => r.userId)
  );

  const movedJobs = await prisma.$transaction(async (tx) => {
    const jobs = await tx.job.updateMany({ where: { companyId: { in: removeIds } }, data: { companyId: keepId } });
    await tx.jobTemplate.updateMany({ where: { companyId: { in: removeIds } }, data: { companyId: keepId } });
    const reviews = await tx.companyReview.findMany({ where: { companyId: { in: removeIds } }, orderBy: { createdAt: "desc" } });
    for (const r of reviews) {
      if (keptReviewers.has(r.userId)) continue; // un seul avis par personne et par entreprise
      keptReviewers.add(r.userId);
      await tx.companyReview.update({ where: { id: r.id }, data: { companyId: keepId } });
    }
    if (transfer) {
      if (keep.subscription) await tx.subscription.delete({ where: { companyId: keepId } }); // remplacé par le meilleur
      await tx.subscription.update({ where: { companyId: transfer.id }, data: { companyId: keepId } });
    }
    if (Object.keys(fill).length > 0) await tx.company.update({ where: { id: keepId }, data: fill });
    await tx.company.deleteMany({ where: { id: { in: removeIds } } });
    return jobs.count;
  });

  await addSlugRedirects(removed.map((c: C) => c.slug), keep.slug);

  const orphanOwners = removed
    .filter((c: C) => c.userId !== keep.userId)
    .map((c: C) => c.user.email ?? c.user.phone ?? c.userId);

  const { logActivity } = await import("@/lib/activity");
  await logActivity({
    userEmail: actorEmail,
    type: "COMPANY_UPDATED",
    label: `Fusion d'entreprises : ${removed.map((c: C) => c.name).join(", ")} → ${keep.name}`,
    metadata: { keepId, removeIds, movedJobs, by: actorEmail },
  });

  return { kept: keep.name, keptSlug: keep.slug, merged: removed.map((c: C) => c.name), movedJobs, orphanOwners };
}

/** Supprime une entreprise (et ses offres si confirmJobs). Refuse si abonnement payant actif. */
export async function deleteCompany(companyId: string, confirmJobs: boolean, actorEmail?: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { subscription: true, _count: { select: { jobs: true } } },
  });
  if (!company) throw new CleanupError(404, "Entreprise introuvable");
  if (isPaid(company.subscription)) throw new CleanupError(409, "Cette entreprise a un abonnement payant actif : résiliez-le d'abord.");
  if (company._count.jobs > 0 && !confirmJobs) {
    throw new CleanupError(409, `Cette entreprise a ${company._count.jobs} offre(s) : elles seront supprimées avec leurs candidatures.`, { needsConfirm: true });
  }
  await prisma.company.delete({ where: { id: company.id } });
  const { logActivity } = await import("@/lib/activity");
  await logActivity({
    userEmail: actorEmail,
    type: "COMPANY_UPDATED",
    label: `Entreprise supprimée : ${company.name}`,
    metadata: { companyId: company.id, jobs: company._count.jobs, by: actorEmail },
  });
  return { deleted: company.name, jobs: company._count.jobs };
}
