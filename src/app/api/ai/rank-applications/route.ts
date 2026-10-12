import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreApplications } from "@/lib/ai-ranking";

// Laisse le temps d'analyser un lot de candidatures (lecture des CV PDF incluse)
export const maxDuration = 300;

// POST /api/ai/rank-applications
// Body: { jobId?: string, force?: boolean }
// - Par défaut, n'analyse que les candidatures pas encore analysées (les nouvelles le sont
//   automatiquement à leur arrivée ; ce bouton rattrape les anciennes et les échecs).
// - force: true → réanalyse tout.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const role   = (session.user as { role?: string }).role;

  if (role !== "EMPLOYER") {
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  const { jobId, force } = await req.json().catch(() => ({} as { jobId?: string; force?: boolean }));

  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId: company.id,
        // Sans offre précise, n'analyser que les offres avec classement IA activé
        ...(jobId ? {} : { aiRankingEnabled: true }),
      },
      archived: false,
      ...(jobId ? { jobId } : {}),
      ...(force ? {} : { aiScore: null }),
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  if (applications.length === 0) {
    return NextResponse.json({ scored: 0, failed: 0, results: [] });
  }

  const { results, failed } = await scoreApplications(applications.map((a: { id: string }) => a.id));

  return NextResponse.json({ scored: results.length, failed: failed.length, results });
}
