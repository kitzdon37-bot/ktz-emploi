import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { sendNewApplicationNotificationEmail } from "@/lib/email";
import { scoreApplication } from "@/lib/ai-ranking";
import { evaluateAnswers } from "@/lib/screening";
import { getJobQuestions, saveApplicationAnswers } from "@/lib/screening-db";

// Laisse le temps à l'analyse IA lancée en arrière-plan après la réponse
export const maxDuration = 60;

async function getAuthUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: (session.user as { id?: string }).id ?? null,
      role: (session.user as { role?: string }).role ?? null,
      suspended: (session.user as { suspended?: boolean }).suspended ?? false,
      mobile: false,
    };
  }
  const mobileUser = getMobileUser(req);
  if (mobileUser) {
    return { id: mobileUser.id, role: mobileUser.role, suspended: false, mobile: true };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (authUser.role !== "JOBSEEKER") {
    return NextResponse.json({ error: "Réservé aux candidats" }, { status: 403 });
  }
  if (authUser.suspended) {
    return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
  }

  // Vérification supplémentaire en base (mobile tokens ne vérifient pas le suspended)
  const dbUser = await prisma.user.findUnique({ where: { id: authUser.id }, select: { suspended: true } });
  if (dbUser?.suspended) {
    return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
  }

  const { jobId, coverLetter, cvUrl, screeningAnswers } = await req.json();
  if (!jobId) return NextResponse.json({ error: "Offre manquante" }, { status: 400 });

  const job = await prisma.job.findUnique({
    where: { id: jobId, published: true },
    include: {
      company: { include: { user: { select: { name: true, email: true } } } },
    },
  });
  if (!job) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

  const existing = await prisma.application.findUnique({
    where: { jobId_userId: { jobId, userId: authUser.id } },
  });
  if (existing) return NextResponse.json({ error: "Vous avez déjà postulé" }, { status: 409 });

  // Questions de présélection : l'application mobile ne les affiche pas encore,
  // on n'y exige donc pas les réponses obligatoires
  const questions = await getJobQuestions(jobId);
  const screening = questions.length > 0
    ? evaluateAnswers(questions, screeningAnswers, { enforceRequired: !authUser.mobile })
    : null;
  if (screening && "error" in screening) {
    return NextResponse.json({ error: screening.error }, { status: 400 });
  }

  const responseDeadline = new Date();
  responseDeadline.setDate(responseDeadline.getDate() + 10);

  const [app, candidate] = await Promise.all([
    prisma.application.create({
      data: {
        jobId,
        userId: authUser.id,
        coverLetter: coverLetter || null,
        cvUrl: cvUrl || null,
        responseDeadline,
      },
    }),
    prisma.user.findUnique({ where: { id: authUser.id }, select: { name: true } }),
  ]);

  if (screening) {
    try {
      await saveApplicationAnswers(app.id, screening);
    } catch (err) {
      console.error("[POST /api/applications] réponses de présélection", err);
    }
  }

  const recruiterEmail = job.company.user.email;
  if (recruiterEmail) {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    sendNewApplicationNotificationEmail({
      recruiterName: job.company.user.name ?? job.company.name,
      recruiterEmail,
      candidateName: candidate?.name ?? "Un candidat",
      jobTitle: job.title,
      applicationsUrl: `${baseUrl}/tableau-de-bord/candidatures`,
    });
  }

  // Analyse IA automatique, après la réponse (le candidat n'attend pas)
  if (job.aiRankingEnabled) {
    after(async () => {
      await scoreApplication(app.id);
    });
  }

  return NextResponse.json({ success: true, id: app.id });
}

export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { userId: authUser.id },
    include: {
      job: {
        include: { company: { select: { name: true, logo: true, verified: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}
