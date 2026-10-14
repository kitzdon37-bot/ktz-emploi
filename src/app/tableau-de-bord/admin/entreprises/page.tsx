"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Search, Merge, Trash2, AlertTriangle, CheckCircle2, BadgeCheck, CreditCard, FlaskConical, ExternalLink,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  sector: string | null;
  verified: boolean;
  suspended: boolean;
  createdAt: string;
  hasDescription: boolean;
  activeJobs: number;
  applications: number;
  isTest: boolean;
  user: { email: string | null; phone: string | null; name: string | null; role: string };
  subscription: { plan: string; status: string } | null;
  _count: { jobs: number; reviews: number; jobTemplates: number };
}

// Entreprise proposée par défaut comme « à garder » : la plus complète
function score(c: Company) {
  return c._count.jobs * 10 + c.applications + (c.verified ? 50 : 0) + (c.subscription ? 100 : 0) + (c.logo ? 5 : 0) + (c.hasDescription ? 5 : 0);
}

export default function CompanyCleanupPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keepId, setKeepId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/companies/cleanup", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setCompanies(data.companies);
      setGroups(data.groups);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const byId = useMemo(() => new Map(companies.map((c) => [c.id, c])), [companies]);
  const tests = companies.filter((c) => c.isTest);
  const visibleGroups = groups
    .map((g) => g.map((id) => byId.get(id)).filter(Boolean) as Company[])
    .filter((g) => g.length > 1 && !dismissed.has(g.map((c) => c.id).sort().join(",")));

  const filtered = companies.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.slug.includes(q) || (c.user.email ?? "").toLowerCase().includes(q);
  });

  function selectGroup(g: Company[]) {
    setSelected(new Set(g.map((c) => c.id)));
    setKeepId([...g].sort((a, b) => score(b) - score(a))[0].id);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    // La plus complète des entreprises sélectionnées est proposée comme « à garder »
    const list = [...next].map((x) => byId.get(x)).filter(Boolean) as Company[];
    setKeepId(keepId && next.has(keepId) ? keepId : list.sort((a, b) => score(b) - score(a))[0]?.id ?? null);
  }

  async function merge() {
    if (!keepId || selected.size < 2) return;
    const keep = byId.get(keepId)!;
    const others = [...selected].filter((id) => id !== keepId).map((id) => byId.get(id)!);
    const owners = others.filter((c) => c.user.email !== keep.user.email).map((c) => c.user.email ?? c.user.phone).filter(Boolean);
    const msg =
      `Garder « ${keep.name} » et y fusionner :\n${others.map((c) => `- ${c.name} (${c._count.jobs} offre(s))`).join("\n")}\n\n` +
      `Les offres et candidatures seront déplacées vers « ${keep.name} ». Les doublons seront supprimés.` +
      (owners.length ? `\n\n⚠️ Les comptes ${owners.join(", ")} n'auront plus d'entreprise : ils ne verront plus ces offres.` : "") +
      "\n\nContinuer ?";
    if (!confirm(msg)) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/companies/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "merge", keepId, removeIds: others.map((c) => c.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setNotice(
        `Fusion réussie : ${data.merged} doublon(s) fusionné(s) dans « ${keep.name} », ${data.movedJobs} offre(s) déplacée(s). ` +
        `Les anciennes adresses redirigent vers la fiche conservée.` +
        (data.orphanOwners?.length ? ` Comptes désormais sans entreprise : ${data.orphanOwners.join(", ")}.` : "")
      );
      setSelected(new Set());
      setKeepId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Company, confirmJobs = false) {
    if (!confirmJobs && !confirm(`Supprimer définitivement « ${c.name} » ?`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/companies/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", companyId: c.id, confirmJobs }),
      });
      const data = await res.json();
      if (res.status === 409 && data.needsConfirm) {
        setBusy(false);
        if (confirm(`${data.error}\n\nSupprimer quand même ?`)) return remove(c, true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Erreur");
      setNotice(`« ${c.name} » a été supprimée.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  const Row = ({ c, inGroup }: { c: Company; inGroup?: boolean }) => (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${selected.has(c.id) ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="mt-1 rounded text-orange-500" aria-label={`Sélectionner ${c.name}`} />
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-gray-500">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {c.logo ? <img src={c.logo} alt="" className="w-full h-full object-contain" /> : c.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-gray-900 text-sm">{c.name}</span>
          {c.verified && <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Vérifiée" />}
          {c.subscription && c.subscription.plan !== "FREE" && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200"><CreditCard className="h-3 w-3" />{c.subscription.plan}</span>
          )}
          {c.isTest && <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"><FlaskConical className="h-3 w-3" />test</span>}
          {c.suspended && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">suspendue</span>}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {c._count.jobs} offre(s) dont {c.activeJobs} en ligne · {c.applications} candidature(s) · compte : {c.user.email ?? c.user.phone ?? "—"}
          {c.user.role !== "EMPLOYER" && ` (${c.user.role === "ADMIN" ? "admin" : "candidat"})`}
        </p>
        <p className="text-[11px] text-gray-400">/{c.slug} · créée le {new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {inGroup && selected.has(c.id) && (
          <label className="flex items-center gap-1 text-xs text-gray-600 mr-1">
            <input type="radio" name="keep" checked={keepId === c.id} onChange={() => setKeepId(c.id)} /> Garder
          </label>
        )}
        <a href={`/entreprises/${c.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100" title="Voir la fiche">
          <ExternalLink className="h-4 w-4" />
        </a>
        <button onClick={() => remove(c)} disabled={busy} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40" title="Supprimer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const selectedList = [...selected].map((id) => byId.get(id)).filter(Boolean) as Company[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/tableau-de-bord/admin?tab=recruteurs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Retour à l&apos;admin
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Nettoyage des entreprises</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Fusionnez les doublons (les offres et candidatures sont conservées et déplacées) et supprimez les entreprises de test.
        Les adresses des fiches fusionnées redirigent automatiquement vers la fiche conservée.
      </p>

      {notice && <p className="mb-4 flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3"><CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />{notice}</p>}
      {error && <p className="mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"><AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />{error}</p>}

      {/* Barre de fusion */}
      {selectedList.length > 0 && (
        <div className="sticky top-2 z-20 mb-6 bg-white border border-orange-300 shadow-lg rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {selectedList.length} entreprise(s) sélectionnée(s) — choisissez celle à garder :
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedList.map((c) => (
              <label key={c.id} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border cursor-pointer ${keepId === c.id ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200"}`}>
                <input type="radio" name="keep-bar" checked={keepId === c.id} onChange={() => setKeepId(c.id)} />
                {c.name} <span className="text-xs text-gray-400">({c._count.jobs} offres)</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={merge} disabled={busy || selectedList.length < 2 || !keepId} className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Merge className="h-4 w-4" />}
              Fusionner dans la sélection gardée
            </button>
            <button onClick={() => { setSelected(new Set()); setKeepId(null); }} className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-orange-500" /></div>
      ) : (
        <>
          {/* Entreprises de test */}
          {tests.length > 0 && (
            <section className="mb-8">
              <h2 className="font-semibold text-gray-900 mb-2">Entreprises de test ({tests.length})</h2>
              <div className="space-y-2">{tests.map((c) => <Row key={c.id} c={c} />)}</div>
            </section>
          )}

          {/* Doublons probables */}
          <section className="mb-8">
            <h2 className="font-semibold text-gray-900 mb-1">Doublons probables ({visibleGroups.length})</h2>
            <p className="text-xs text-gray-500 mb-3">
              Regroupés par nom. Vérifiez avant de fusionner : certaines entités au nom proche sont distinctes (par exemple deux sections de MSF).
            </p>
            {visibleGroups.length === 0 && <p className="text-sm text-gray-400">Aucun doublon détecté.</p>}
            <div className="space-y-4">
              {visibleGroups.map((g) => {
                const key = g.map((c) => c.id).sort().join(",");
                return (
                  <div key={key} className="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                    <div className="space-y-2">{g.map((c) => <Row key={c.id} c={c} inGroup />)}</div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => selectGroup(g)} className="text-sm px-3 py-1.5 rounded-lg bg-white border border-orange-300 text-orange-600 hover:bg-orange-50">
                        Sélectionner ce groupe
                      </button>
                      <button onClick={() => setDismissed((p) => new Set(p).add(key))} className="text-sm px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                        Ce ne sont pas des doublons
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Toutes les entreprises */}
          <section>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="font-semibold text-gray-900">Toutes les entreprises ({companies.length})</h2>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-72">
                <Search className="h-4 w-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, adresse ou email…" className="flex-1 text-sm outline-none" />
              </div>
            </div>
            <div className="space-y-2">{filtered.map((c) => <Row key={c.id} c={c} inGroup />)}</div>
          </section>
        </>
      )}
    </div>
  );
}
