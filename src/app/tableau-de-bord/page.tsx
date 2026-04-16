import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Send,
  Eye,
  TrendingUp,
  Plus,
  Users,
  Clock,
  Heart,
  ArrowRight,
  Search,
  MapPin,
} from "lucide-react";
import { timeAgo, APPLICATION_STATUSES } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string }).role;
  const firstName = session.user?.name?.split(" ")[0] ?? "vous";

  /* ─────────────── EMPLOYER ─────────────── */
  if (role === "EMPLOYER") {
    const company = await prisma.company.findUnique({ where: { userId } });
    let jobs: {
      id: string; title: string; slug: string; type: string; published: boolean; createdAt: Date;
      _count: { applications: number };
    }[] = [];
    let recentApps: {
      id: string; status: string; createdAt: Date;
      job: { title: string; slug: string };
      user: { name: string | null; email: string };
    }[] = [];
    let totalViews = 0;

    if (company) {
      jobs = await prisma.job.findMany({
        where: { companyId: company.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      recentApps = await prisma.application.findMany({
        where: { job: { companyId: company.id } },
        include: {
          job: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      totalViews = (
        await prisma.job.aggregate({ where: { companyId: company.id }, _sum: { views: true } })
      )._sum.views || 0;
    }

    const totalApplications = jobs.reduce((acc, j) => acc + j._count.applications, 0);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              👋 Bonjour, {firstName} !
            </h1>
            <p className="text-gray-500 mt-0.5">Tableau de bord recruteur</p>
          </div>
          <Link
            href="/tableau-de-bord/publier"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle offre
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Offres publiées", value: jobs.length, icon: Briefcase, color: "text-orange-500 bg-orange-50" },
            { label: "Candidatures", value: totalApplications, icon: Send, color: "text-blue-600 bg-blue-50" },
            { label: "Vues totales", value: totalViews, icon: Eye, color: "text-purple-600 bg-purple-50" },
            { label: "Taux réponse", value: totalApplications > 0 ? `${Math.round((recentApps.filter(a => a.status !== "PENDING").length / totalApplications) * 100)}%` : "0%", icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Mes offres</h2>
              <Link href="/tableau-de-bord/offres" className="text-sm text-orange-500 hover:underline">Voir tout</Link>
            </div>
            {jobs.length > 0 ? (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <Link href={`/emplois/${job.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-500 truncate block">
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-400">{job.type} · {timeAgo(job.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-xs text-gray-500">{job._count.applications} candidature(s)</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${job.published ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}>
                        {job.published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Aucune offre publiée</p>
                <Link href="/tableau-de-bord/publier" className="text-orange-500 text-sm hover:underline mt-1 inline-block">
                  Publier ma première offre
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Dernières candidatures</h2>
              <Link href="/tableau-de-bord/candidatures" className="text-sm text-orange-500 hover:underline">Voir tout</Link>
            </div>
            {recentApps.length > 0 ? (
              <div className="space-y-3">
                {recentApps.map((app) => {
                  const st = APPLICATION_STATUSES[app.status];
                  return (
                    <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{app.user.name || app.user.email}</p>
                        <p className="text-xs text-gray-400">{app.job.title} · {timeAgo(app.createdAt)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st?.color || "bg-gray-100 text-gray-600"}`}>
                        {st?.label || app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Aucune candidature reçue</p>
              </div>
            )}
          </div>
        </div>

        {!company && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h3 className="font-semibold text-yellow-800 mb-1">Complétez votre profil entreprise</h3>
            <p className="text-yellow-700 text-sm mb-3">Un profil complet attire plus de candidats qualifiés.</p>
            <Link href="/tableau-de-bord/entreprise" className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Configurer mon entreprise
            </Link>
          </div>
        )}
      </div>
    );
  }

  /* ─────────────── JOBSEEKER ─────────────── */
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: { include: { company: { select: { name: true, logo: true, verified: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: { include: { company: { select: { name: true, logo: true, verified: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });

  // Recommended jobs based on profile title / location
  const recommendedJobs = await prisma.job.findMany({
    where: {
      published: true,
      ...(profile?.title
        ? { title: { contains: profile.title.split(" ")[0] } }
        : {}),
    },
    include: { company: { select: { name: true, logo: true, verified: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const statusCounts = applications.reduce((acc: Record<string, number>, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HelloWork-style greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          👋 Hello {firstName},
        </h1>
        <p className="text-gray-500 mt-1 text-lg">Bienvenue sur votre espace !</p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 flex gap-3">
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={profile?.title || "Métier, entreprise, compétence..."}
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={profile?.location || "Ville, région..."}
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <Link
          href="/emplois"
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0 flex items-center gap-1.5"
        >
          <Search className="h-4 w-4" />
          Rechercher
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Candidatures", value: applications.length, icon: Send, color: "text-blue-600 bg-blue-50" },
          { label: "Entretiens", value: statusCounts["INTERVIEW"] || 0, icon: Users, color: "text-purple-600 bg-purple-50" },
          { label: "Acceptées", value: statusCounts["ACCEPTED"] || 0, icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "En attente", value: statusCounts["PENDING"] || 0, icon: Clock, color: "text-orange-500 bg-orange-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Offres favorites */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-4 w-4 text-orange-500" />
            Vos offres favorites
          </h2>
        </div>
        {savedJobs.length > 0 ? (
          <div className="space-y-3">
            {savedJobs.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                  {s.job.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/emplois/${s.job.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-500 truncate block">
                    {s.job.title}
                  </Link>
                  <p className="text-xs text-gray-400">{s.job.company.name} · {s.job.type}</p>
                </div>
                <Link href={`/emplois/${s.job.slug}`} className="text-xs text-orange-500 hover:underline flex-shrink-0">
                  Voir l&apos;offre →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Heart className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm mb-2">Aucune offre sauvegardée</p>
            <Link href="/emplois" className="inline-flex items-center gap-1 text-orange-500 text-sm hover:underline">
              Voir mes favoris <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Recommended jobs */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">
          Ces offres correspondent{" "}
          <span className="font-bold">à votre recherche !</span>
        </h2>
        <p className="text-sm text-gray-500 mb-4">Basé sur votre profil</p>
        <div className="space-y-3">
          {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 hover:border-orange-200 hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0 border border-orange-100">
                {job.company.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-contain rounded-xl" />
                ) : (
                  job.company.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/emplois/${job.slug}`} className="font-semibold text-gray-900 hover:text-orange-500 text-sm">
                  {job.title}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">{job.company.name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{job.type}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">{timeAgo(job.createdAt)}</span>
                <Link
                  href={`/emplois/${job.slug}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Voir l&apos;offre
                </Link>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-500">
              <Briefcase className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Complétez votre profil pour voir des offres personnalisées</p>
              <Link href="/tableau-de-bord/profil" className="text-orange-500 text-sm hover:underline mt-1 inline-block">
                Compléter mon profil
              </Link>
            </div>
          )}
        </div>
        {recommendedJobs.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/emplois" className="text-sm text-orange-500 hover:underline font-medium flex items-center gap-1 justify-center">
              Voir toutes les offres <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Mes candidatures récentes */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Send className="h-4 w-4 text-blue-500" />
            Mes candidatures récentes
          </h2>
          <Link href="/tableau-de-bord/candidatures" className="text-sm text-orange-500 hover:underline">
            Voir tout
          </Link>
        </div>
        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => {
              const st = APPLICATION_STATUSES[app.status];
              return (
                <div key={app.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                    {app.job.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/emplois/${app.job.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-500 truncate block">
                      {app.job.title}
                    </Link>
                    <p className="text-xs text-gray-400">{app.job.company.name} · {timeAgo(app.createdAt)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${st?.color || "bg-gray-100 text-gray-600"}`}>
                    {st?.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Send className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucune candidature envoyée</p>
            <Link href="/emplois" className="text-orange-500 text-sm hover:underline mt-1 inline-block">
              Parcourir les offres
            </Link>
          </div>
        )}
      </div>

      {/* Complete profile prompt */}
      {!profile?.bio && (
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Complétez votre profil</h3>
            <p className="text-blue-700 text-sm">Les candidats avec un profil complet ont 3x plus de chances d&apos;être contactés.</p>
          </div>
          <Link href="/tableau-de-bord/profil" className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5">
            Mon profil <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
