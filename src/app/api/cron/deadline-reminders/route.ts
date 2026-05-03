import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDeadlineReminderEmail } from "@/lib/email";

/**
 * GET /api/cron/deadline-reminders
 *
 * À appeler via un cron job externe (ex: cron-job.org, Vercel Cron, GitHub Actions) une fois par jour.
 * Protégé par CRON_SECRET dans les variables d'environnement.
 *
 * Logique de rappel (3 niveaux) :
 *   remindersSent = 0 → envoie si daysLeft <= 7  (rappel initial)
 *   remindersSent = 1 → envoie si daysLeft <= 3  (rappel intermédiaire)
 *   remindersSent = 2 → envoie si daysLeft <= 1  (rappel urgent / dernier jour)
 *
 * Les statuts finaux (ACCEPTED, REJECTED) ne reçoivent plus de rappel.
 */
export async function GET(req: NextRequest) {
  // Vérification du secret cron
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const FINAL_STATUSES = ["ACCEPTED", "REJECTED"];

  // Récupère toutes les candidatures actives avec deadline définie et rappels non épuisés
  const applications = await prisma.application.findMany({
    where: {
      responseDeadline: { not: null },
      remindersSent: { lt: 3 },
      status: { notIn: FINAL_STATUSES },
    },
    include: {
      user: { select: { name: true } },
      job: {
        select: {
          title: true,
          company: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const app of applications) {
    if (!app.responseDeadline) continue;

    const msLeft = app.responseDeadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    // Détermine si ce niveau de rappel doit être envoyé
    const shouldSend =
      (app.remindersSent < 1 && daysLeft <= 7) ||
      (app.remindersSent < 2 && daysLeft <= 3) ||
      (app.remindersSent < 3 && daysLeft <= 1);

    if (!shouldSend) {
      skipped++;
      continue;
    }

    const recruiterEmail = app.job.company.user.email;
    if (!recruiterEmail) {
      skipped++;
      continue;
    }

    try {
      await sendDeadlineReminderEmail({
        recruiterName: app.job.company.user.name ?? app.job.company.name,
        recruiterEmail,
        candidateName: app.user.name ?? "Un candidat",
        jobTitle: app.job.title,
        daysLeft: Math.max(0, daysLeft),
        applicationId: app.id,
      });

      // Incrémente le compteur de rappels envoyés
      await prisma.application.update({
        where: { id: app.id },
        data: { remindersSent: app.remindersSent + 1 },
      });

      sent++;
    } catch (err) {
      errors.push(`app:${app.id} — ${String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    processed: applications.length,
    sent,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
  });
}
