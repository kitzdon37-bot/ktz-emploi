import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Eye, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";

export default async function CVPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");
  const role = (session.user as { role?: string }).role;
  if (role === "EMPLOYER") redirect("/tableau-de-bord");

  // For now: placeholder — CV views would require a dedicated tracking table
  const cvViews: { company: string; date: string; post: string }[] = [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes CV vus</h1>
      <p className="text-gray-500 mb-6">Les recruteurs qui ont consulté votre profil ou CV.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{cvViews.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Vues ce mois</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-0.5">Entreprises intéressées</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <div className="text-xs text-gray-500 mt-0.5">Invitations reçues</div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Historique des vues</h2>
        {cvViews.length > 0 ? (
          <div className="space-y-3">
            {cvViews.map((v, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {v.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{v.company}</p>
                  <p className="text-xs text-gray-400">A consulté votre profil pour : {v.post}</p>
                </div>
                <span className="text-xs text-gray-400">{v.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Eye className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">Votre CV n&apos;a pas encore été consulté</p>
            <p className="text-sm mt-1 mb-4">Complétez votre profil pour être trouvé par les recruteurs</p>
            <Link
              href="/tableau-de-bord/profil"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Compléter mon profil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
