import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Bell, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import JobCard from "@/components/JobCard";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";
import { LANDINGS, KIND_LABELS, getLanding, activeJobsWhere, type LandingKind } from "@/lib/seo-landing";

const MAX_JOBS = 30;

function countActive(kind: LandingKind, slug: string) {
  const landing = getLanding(kind, slug)!;
  return prisma.job.count({ where: activeJobsWhere(landing.filter) });
}

export async function landingMetadata(kind: LandingKind, slug: string): Promise<Metadata> {
  const landing = getLanding(kind, slug);
  if (!landing) return {};
  const total = await countActive(kind, slug);
  // Sans offre en cours, la page reste visitable mais n'est pas proposée à Google (contenu trop mince)
  return pageMetadata({
    path: `/emplois/${kind}/${slug}`,
    title: landing.title,
    description: landing.description,
    noIndex: total === 0,
  });
}

export default async function JobLandingPage({ kind, slug }: { kind: LandingKind; slug: string }) {
  const landing = getLanding(kind, slug);
  if (!landing) notFound();

  const where = activeJobsWhere(landing.filter);
  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { name: true, logo: true, verified: true, superRecruiter: true } } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: MAX_JOBS,
    }),
    prisma.job.count({ where }),
  ]);

  const url = `${SITE_URL}/emplois/${kind}/${slug}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Offres d'emploi", item: `${SITE_URL}/emplois` },
      { "@type": "ListItem", position: 3, name: landing.label, item: url },
    ],
  };

  // Liens internes vers les autres pages (même type en priorité, puis les autres)
  const groups = (Object.keys(LANDINGS) as LandingKind[]).map((k) => ({
    kind: k,
    items: LANDINGS[k].filter((l) => !(k === kind && l.slug === slug)),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumb)} />

      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/" className="hover:text-orange-500">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/emplois" className="hover:text-orange-500">Offres d&apos;emploi</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-700">{landing.label}</span>
      </nav>

      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">{landing.h1}</h1>
        <p className="text-orange-600 font-medium mt-2">
          {total > 0
            ? `${total} offre${total > 1 ? "s" : ""} d'emploi disponible${total > 1 ? "s" : ""}`
            : "Aucune offre en cours pour le moment"}
        </p>
        <div className="mt-4 space-y-3 text-gray-600 leading-relaxed">
          {landing.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </header>

      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-600">Aucune offre ne correspond pour l&apos;instant. Les nouvelles offres sont publiées chaque jour.</p>
          <Link href="/tableau-de-bord/alertes" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium">
            <Bell className="h-4 w-4" /> Créer une alerte emploi
          </Link>
        </div>
      )}

      {total > jobs.length && (
        <div className="mt-6 text-center">
          <Link href={landing.searchHref} className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
            Voir les {total} offres <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Inscription */}
      <section className="mt-12 bg-orange-50 border border-orange-100 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900">Postulez en quelques clics</h2>
        <p className="text-gray-600 text-sm mt-1">
          Créez votre compte gratuitement, déposez votre CV une seule fois et postulez à toutes les offres de KTZ Emploi.
          Recevez les nouvelles offres par email ou WhatsApp grâce aux alertes emploi.
        </p>
        <Link href="/inscription" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium">
          Créer mon compte gratuit <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Maillage interne */}
      <section className="mt-12 grid sm:grid-cols-3 gap-8">
        {groups.map((g) => (
          <div key={g.kind}>
            <h2 className="font-semibold text-gray-900 mb-3">Offres d&apos;emploi {KIND_LABELS[g.kind].toLowerCase()}</h2>
            <ul className="space-y-1.5">
              {g.items.map((l) => (
                <li key={l.slug}>
                  <Link href={`/emplois/${l.kind}/${l.slug}`} className="text-sm text-gray-600 hover:text-orange-600">
                    {l.kind === "ville" ? `Emploi ${l.label}` : l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
