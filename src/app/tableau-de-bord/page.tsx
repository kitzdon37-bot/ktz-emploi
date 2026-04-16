import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Briefcase, Building2, Send, Eye, TrendingUp, Plus, Users, Clock } from "lucide-react";
import { timeAgo, APPLICATION_STATUSES } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string }).role;

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
      totalViews = (await prisma.job.aggregate({ where: { companyId: company.id }, _sum: { views: true } }))._sum.views || 0;
    }

    const totalApplications = jobs.reduce((acc, j) => acc + j._count.applications, 0);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord recruteur</h1>
            <p className="text-gray-500">Bienvenue, {session.user?.name} 👋</p>
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
          {/* My jobs */}
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

          {/* Recent applications */}
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
                <p className="text-sm">Aucune candidature pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Company setup prompt */}
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

  // JOBSEEKER dashboard
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true, verified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true, verified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const profile = await prisma.jobSeekerProfile.findUnique({ where: { userId } });

  const statusCounts = applications.reduce((acc: Record<string, number>, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon espace candidat</h1>
          <p className="text-gray-500">Bienvenue, {session.user?.name} 👋</p>
        </div>
        <Link
          href="/emplois"
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Briefcase className="h-4 w-4" />
          Chercher un emploi
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Send className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
          <div className="text-sm text-gray-500">Candidatures envoyées</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statusCounts["INTERVIEW"] || 0}</div>
          <div className="text-sm text-gray-500">Entretiens obtenus</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statusCounts["ACCEPTED"] || 0}</div>
          <div className="text-sm text-gray-500">Offres acceptées</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-3">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{statusCounts["PENDING"] || 0}</div>
          <div className="text-sm text-gray-500">En attente</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Mes candidatures</h2>
            <Link href="/tableau-de-bord/candidatures" className="text-sm text-orange-500 hover:underline">Voir tout</Link>
          </div>
          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => {
                const st = APPLICATION_STATUSES[app.status];
                return (
                  <div key={app.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
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

        {/* Saved jobs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Offres sauvegardées</h2>
            <Link href="/tableau-de-bord/sauvegardes" className="text-sm text-orange-500 hover:underline">Voir tout</Link>
          </div>
          {savedJobs.length > 0 ? (
            <div className="space-y-3">
              {savedJobs.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                    {s.job.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/emplois/${s.job.slug}`} className="text-sm font-medium text-gray-800 hover:text-orange-500 truncate block">
                      {s.job.title}
                    </Link>
                    <p className="text-xs text-gray-400">{s.job.company.name} · {s.job.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-10 w-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Aucune offre sauvegardée</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile completion */}
      {!profile?.bio && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-800 mb-1">Complétez votre profil</h3>
          <p className="text-blue-700 text-sm mb-3">Les candidats avec un profil complet ont 3x plus de chances d&apos;être contactés.</p>
          <Link href="/tableau-de-bord/profil" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Compléter mon profil
          </Link>
        </div>
      )}
    </div>
  );
}

