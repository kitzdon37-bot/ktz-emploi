import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, Building2 } from "lucide-react";
import PostJobForm from "./PostJobForm";
import { getPlanLimits } from "@/lib/plans";

export default async function PublierPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({
    where: { userId },
    include: { subscription: true },
  });

  if (!company) redirect("/tableau-de-bord/entreprise");

  // Vérifier la limite du plan
  const planKey = company.subscription?.status === "ACTIVE" ? (company.subscription?.plan ?? "FREE") : "FREE";
  const limits = getPlanLimits(planKey);
  const activeJobs = await prisma.job.count({ where: { companyId: company.id, published: true } });
  const limitReached = activeJobs >= limits.maxJobs;

  const missingFields: string[] = [];
  if (!company.logo) missingFields.push("logo");
  if (!company.description) missingFields.push("description");
  if (!company.sector) missingFields.push("secteur d'activité");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publier une offre d&apos;emploi</h1>
        <p className="text-gray-500 mt-1">Décrivez le poste pour attirer les meilleurs candidats</p>
      </div>

      {/* Bannière profil incomplet */}
      {missingFields.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Profil entreprise incomplet</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Il manque : <span className="font-medium">{missingFields.join(", ")}</span>.
              Un profil complet attire 3× plus de candidats.
            </p>
          </div>
          <Link
            href="/tableau-de-bord/entreprise"
            className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition-colors"
          >
            <Building2 className="h-3.5 w-3.5" />
            Compléter
          </Link>
        </div>
      )}

      {/* Indicateur d'usage du plan */}
      {limits.maxJobs < 999 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <span className="text-gray-600">
            Offres actives : <strong className="text-gray-900">{activeJobs} / {limits.maxJobs}</strong>
            <span className="text-gray-400 ml-1">(plan {limits.name})</span>
          </span>
          <Link href="/tableau-de-bord/abonnement" className="text-orange-500 hover:underline text-xs font-medium">
            Augmenter la limite →
          </Link>
        </div>
      )}

      {/* Le formulaire — la modal s'affiche par-dessus si limite atteinte */}
      <PostJobForm
        companyId={company.id}
        limitReached={limitReached}
        activeJobs={activeJobs}
        maxJobs={limits.maxJobs}
        planName={limits.name}
      />
    </div>
  );
}

