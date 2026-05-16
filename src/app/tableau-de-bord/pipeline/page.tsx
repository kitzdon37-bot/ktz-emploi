import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Kanban } from "lucide-react";
import PipelineClient, { type PipelineApplication } from "./PipelineClient";

export default async function PipelinePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion?callbackUrl=/tableau-de-bord/pipeline");

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") redirect("/tableau-de-bord");

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });

  if (!company) {
    redirect("/tableau-de-bord");
  }

  const rawApps = await prisma.application.findMany({
    where: { job: { companyId: company.id } },
    include: {
      job: { select: { title: true, slug: true } },
      user: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const applications: PipelineApplication[] = rawApps.map((app) => ({
    id: app.id,
    status: app.status,
    candidateName: app.user.name ?? "",
    candidateEmail: app.user.email ?? app.user.phone ?? null,
    jobTitle: app.job.title,
    jobSlug: app.job.slug,
    createdAt: app.createdAt.toISOString(),
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Kanban className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline de recrutement</h1>
          <p className="text-sm text-gray-500">
            {applications.length} candidature(s) — glissez les cartes pour changer le statut
          </p>
        </div>
      </div>

      <PipelineClient initialApplications={applications} />
    </div>
  );
}
