import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { APPLICATION_STATUSES, timeAgo, formatDate } from "@/lib/utils";
import { Briefcase, FileText } from "lucide-react";
import ApplicationActions from "./ApplicationActions";
import NotesButton from "./NotesButton";
import ExportCsvButton from "./ExportCsvButton";
import StatusTimeline from "./StatusTimeline";

export default async function CandidaturesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/connexion");

  const userId = (session.user as { id?: string }).id!;
  const role = (session.user as { role?: string }).role;

  if (role === "EMPLOYER") {
    // Show applications received by employer
    const company = await prisma.company.findUnique({ where: { userId } });
    if (!company) redirect("/tableau-de-bord");

    const applications = await prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        job: { select: { title: true, slug: true, type: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Candidatures reçues</h1>
          <ExportCsvButton />
        </div>
        <p className="text-gray-500 mb-6">{applications.length} candidature(s) au total</p>

        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => {
              const st = APPLICATION_STATUSES[app.status];
              return (
                <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{app.user.name || app.user.email}</p>
                      <p className="text-sm text-gray-500">{app.user.email}</p>
                      <div className="mt-1">
                        <Link href={`/emplois/${app.job.slug}`} className="text-sm text-orange-500 hover:underline">
                          {app.job.title}
                        </Link>
                        <span className="text-xs text-gray-400 ml-2">· {app.job.type}</span>
                      </div>
                      {app.coverLetter && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                          {app.coverLetter}
                        </p>
                      )}
                      {app.cvUrl && (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-sm text-orange-500 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          Voir le CV
                        </a>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ApplicationActions
                        applicationId={app.id}
                        initialStatus={app.status}
                        candidateName={app.user.name || app.user.email || "Candidat"}
                      />
                      <span className="text-xs text-gray-400">{timeAgo(app.createdAt)}</span>
                    </div>
                  </div>
                  <NotesButton applicationId={app.id} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
            <p>Aucune candidature reçue</p>
          </div>
        )}
      </div>
    );
  }

  // JOBSEEKER — affiche les candidatures envoyées avec historique des statuts
  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true } } },
      },
      statusHistory: {
        orderBy: { changedAt: "asc" },
        select: { id: true, status: true, note: true, changedAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes candidatures</h1>
      <p className="text-gray-500 mb-6">{applications.length} candidature(s) envoyée(s)</p>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => {
            const st = APPLICATION_STATUSES[app.status];
            // Sérialise les dates pour le passage au composant client
            const history = app.statusHistory.map((h) => ({
              ...h,
              changedAt: h.changedAt.toISOString(),
            }));
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-sm flex-shrink-0 border border-orange-50">
                    {app.job.company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Link href={`/emplois/${app.job.slug}`} className="font-semibold text-gray-900 hover:text-orange-500">
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">{app.job.company.name}</p>
                    {app.coverLetter && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                        {app.coverLetter}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Envoyée le {formatDate(app.createdAt)}</p>
                    {/* Timeline des statuts */}
                    <StatusTimeline
                      applicationId={app.id}
                      currentStatus={app.status}
                      currentCreatedAt={app.createdAt.toISOString()}
                      history={history}
                    />
                  </div>
                  <div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st?.color}`}>
                      {st?.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-200" />
          <p>Aucune candidature envoyée</p>
          <Link href="/emplois" className="text-orange-500 text-sm hover:underline mt-2 inline-block">
            Parcourir les offres
          </Link>
        </div>
      )}
    </div>
  );
}
