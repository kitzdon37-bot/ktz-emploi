import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  BarChart2,
  Users,
  Clock,
  Search,
  Star,
  CheckCircle,
  Briefcase,
  Eye,
} from "lucide-react";

interface AnalyticsData {
  totalJobs: number;
  totalApplications: number;
  pendingApplications: number;
  reviewingApplications: number;
  interviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  applicationsPerJob: { jobId: string; title: string; count: number; views: number }[];
  last30Days: number;
  conversionRate: number;
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord/analytics");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const cookieStore = await cookies();

  let data: AnalyticsData | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/analytics/recruiter`,
      {
        cache: "no-store",
        headers: {
          Cookie: cookieStore.toString(),
        },
      }
    );
    if (res.ok) {
      data = await res.json();
    } else {
      error = "Impossible de charger les statistiques.";
    }
  } catch {
    error = "Erreur de connexion au serveur.";
  }

  const stats = [
    {
      label: "Total offres",
      value: data?.totalJobs ?? 0,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total candidatures",
      value: data?.totalApplications ?? 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "En attente",
      value: data?.pendingApplications ?? 0,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "En cours d'examen",
      value: data?.reviewingApplications ?? 0,
      icon: Search,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Entretiens",
      value: data?.interviewApplications ?? 0,
      icon: Star,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Acceptés",
      value: data?.acceptedApplications ?? 0,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
  ];

  const maxCount =
    data?.applicationsPerJob?.length
      ? Math.max(...data.applicationsPerJob.map((j) => j.count), 1)
      : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <BarChart2 className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytiques recruteur</h1>
          <p className="text-sm text-gray-500">Vue d&apos;ensemble de vos performances de recrutement</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Taux de conversion */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Taux de conversion
          </h2>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-gray-900">
              {data?.conversionRate ?? 0}%
            </span>
            <span className="text-sm text-gray-500 mb-1">des candidatures acceptées</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${data?.conversionRate ?? 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {data?.acceptedApplications ?? 0} accepté(s) sur {data?.totalApplications ?? 0} candidature(s)
          </p>
        </div>

        {/* Candidatures 30 derniers jours */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-orange-500" />
            Candidatures (30 derniers jours)
          </h2>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-4xl font-bold text-gray-900">
              {data?.last30Days ?? 0}
            </span>
            <span className="text-sm text-gray-500 mb-1">candidature(s)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all"
              style={{
                width:
                  data?.totalApplications
                    ? `${Math.min(100, Math.round(((data.last30Days ?? 0) / data.totalApplications) * 100))}%`
                    : "0%",
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Sur les 30 derniers jours calendaires
          </p>
        </div>
      </div>

      {/* Top offres par candidatures */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Eye className="h-4 w-4 text-blue-500" />
          Top offres par candidatures
        </h2>

        {data?.applicationsPerJob?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left font-medium text-gray-500 pb-3 pr-4">Intitulé du poste</th>
                  <th className="text-right font-medium text-gray-500 pb-3 px-4 whitespace-nowrap">
                    <span className="flex items-center justify-end gap-1">
                      <Eye className="h-3.5 w-3.5" /> Vues
                    </span>
                  </th>
                  <th className="text-right font-medium text-gray-500 pb-3 px-4 whitespace-nowrap">
                    <span className="flex items-center justify-end gap-1">
                      <Users className="h-3.5 w-3.5" /> Candidatures
                    </span>
                  </th>
                  <th className="text-left font-medium text-gray-500 pb-3 pl-4 w-40">Progression</th>
                </tr>
              </thead>
              <tbody>
                {data.applicationsPerJob.map((job) => (
                  <tr key={job.jobId} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900 max-w-[200px] truncate">
                      {job.title}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{job.views}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{job.count}</td>
                    <td className="py-3 pl-4">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${Math.round((job.count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Aucune donnée disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
