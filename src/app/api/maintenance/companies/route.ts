// ⚠️ Route de maintenance TEMPORAIRE (nettoyage des entreprises) — à supprimer après usage.
// Protégée par la variable d'environnement MAINTENANCE_TOKEN : sans elle, la route n'existe pas.
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { suggestDuplicateGroups, looksLikeTest, mergeCompanies, deleteCompany, CleanupError } from "@/lib/company-cleanup";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(token: string | null) {
  const expected = process.env.MAINTENANCE_TOKEN;
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Plan = { merges?: Array<{ keep: string; remove: string[] }>; deletes?: Array<{ id: string; confirmJobs?: boolean }> };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (!authorized(searchParams.get("token"))) return new NextResponse("Not found", { status: 404 });

  // ── Exécution d'un plan (merges / deletes) ──────────────────────────────────
  const planParam = searchParams.get("plan");
  if (planParam) {
    let plan: Plan;
    try {
      plan = JSON.parse(Buffer.from(planParam, "base64url").toString("utf8"));
    } catch {
      return NextResponse.json({ error: "Plan illisible" }, { status: 400 });
    }
    const results: unknown[] = [];
    for (const m of plan.merges ?? []) {
      try {
        results.push({ merge: await mergeCompanies(m.keep, m.remove, "maintenance@ktzemploi.com") });
      } catch (e) {
        results.push({ merge: m, error: e instanceof CleanupError ? e.message : String(e) });
      }
    }
    for (const d of plan.deletes ?? []) {
      try {
        results.push({ delete: await deleteCompany(d.id, !!d.confirmJobs, "maintenance@ktzemploi.com") });
      } catch (e) {
        results.push({ delete: d, error: e instanceof CleanupError ? e.message : String(e) });
      }
    }
    return NextResponse.json({ results });
  }

  // ── Rapport (lecture seule) ─────────────────────────────────────────────────
  const now = new Date();
  const rows = await prisma.company.findMany({
    select: {
      id: true, name: true, slug: true, verified: true, suspended: true, createdAt: true,
      logo: true, description: true, website: true,
      user: { select: { email: true, phone: true, role: true, createdAt: true } },
      subscription: { select: { plan: true, status: true } },
      _count: { select: { jobs: true, reviews: true, jobTemplates: true } },
      jobs: { select: { id: true, published: true, deadline: true, _count: { select: { applications: true } } } },
    },
    orderBy: { name: "asc" },
  });
  const companies = rows.map(({ jobs, description, logo, website, ...c }: (typeof rows)[number]) => ({
    ...c,
    hasLogo: !!logo, hasDescription: !!description, hasWebsite: !!website,
    activeJobs: jobs.filter((j: (typeof jobs)[number]) => j.published && (!j.deadline || j.deadline >= now)).length,
    applications: jobs.reduce((n: number, j: (typeof jobs)[number]) => n + j._count.applications, 0),
    isTest: looksLikeTest(c),
  }));
  const groups = suggestDuplicateGroups(companies).map((g) => g.map((c) => c.id));
  return NextResponse.json({ count: companies.length, companies, groups });
}
