import { prisma } from "@/lib/prisma";
import type { ScreeningAnswer, ScreeningQuestion, ScreeningResult } from "@/lib/screening";

// Les tables JobScreening / ApplicationScreening sont créées à la première utilisation
// (CREATE TABLE IF NOT EXISTS), comme scripts/add-ai-ranking-column.mjs mais sans étape manuelle.
// Elles sont séparées de Job / Application : tant qu'elles n'existent pas, le reste du site fonctionne.
let ensured: Promise<void> | null = null;

export function ensureScreeningTables() {
  if (!ensured) {
    ensured = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "JobScreening" (
          "jobId" TEXT NOT NULL PRIMARY KEY REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "questions" JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ApplicationScreening" (
          "applicationId" TEXT NOT NULL PRIMARY KEY REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "answers" JSONB NOT NULL,
          "meetsRequirements" BOOLEAN NOT NULL DEFAULT TRUE,
          "quizScore" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
    })().catch((err) => {
      ensured = null; // réessayer à la prochaine requête
      throw err;
    });
  }
  return ensured;
}

export async function getJobQuestions(jobId: string): Promise<ScreeningQuestion[]> {
  try {
    await ensureScreeningTables();
    const row = await prisma.jobScreening.findUnique({ where: { jobId } });
    return (row?.questions as unknown as ScreeningQuestion[] | undefined) ?? [];
  } catch (err) {
    console.error("[screening] lecture des questions impossible", err);
    return [];
  }
}

export async function saveJobQuestions(jobId: string, questions: ScreeningQuestion[]) {
  await ensureScreeningTables();
  if (questions.length === 0) {
    await prisma.jobScreening.deleteMany({ where: { jobId } });
    return;
  }
  const data = { questions: questions as unknown as object };
  await prisma.jobScreening.upsert({ where: { jobId }, create: { jobId, ...data }, update: data });
}

export interface ApplicationScreeningData {
  answers: ScreeningAnswer[];
  meetsRequirements: boolean;
  quizScore: number | null;
}

export async function getApplicationsScreening(applicationIds: string[]): Promise<Map<string, ApplicationScreeningData>> {
  const map = new Map<string, ApplicationScreeningData>();
  if (applicationIds.length === 0) return map;
  try {
    await ensureScreeningTables();
    const rows = await prisma.applicationScreening.findMany({ where: { applicationId: { in: applicationIds } } });
    for (const r of rows) {
      map.set(r.applicationId, {
        answers: r.answers as unknown as ScreeningAnswer[],
        meetsRequirements: r.meetsRequirements,
        quizScore: r.quizScore,
      });
    }
  } catch (err) {
    console.error("[screening] lecture des réponses impossible", err);
  }
  return map;
}

export async function saveApplicationAnswers(applicationId: string, result: ScreeningResult) {
  await ensureScreeningTables();
  await prisma.applicationScreening.create({
    data: {
      applicationId,
      answers: result.answers as unknown as object,
      meetsRequirements: result.meetsRequirements,
      quizScore: result.quizScore,
    },
  });
}
