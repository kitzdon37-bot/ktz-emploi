import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSMS, sendWhatsApp } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId requis" }, { status: 400 });
  }

  // Récupère l'offre
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { name: true } } },
  });

  if (!job) {
    return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  }

  // Construit le message
  const jobUrl = `${process.env.NEXTAUTH_URL || "https://ktzemploi.com"}/offres/${job.slug}`;
  const message =
    `Nouvelle offre sur KTZ Emploi !\n` +
    `${job.title} chez ${job.company.name} (${job.location})\n` +
    `Postuler : ${jobUrl}`;

  // Trouve tous les candidats opt-in pour la catégorie de cette offre
  const profiles = await prisma.jobSeekerProfile.findMany({
    where: {
      user: { role: "JOBSEEKER", suspended: false },
      phone: { not: null },
      OR: [{ smsOptIn: true }, { whatsappOptIn: true }],
    },
    select: {
      phone: true,
      smsOptIn: true,
      whatsappOptIn: true,
      notifCategories: true,
    },
  });

  let smsSent = 0;
  let whatsappSent = 0;
  let skipped = 0;

  for (const profile of profiles) {
    if (!profile.phone) continue;

    // Vérifie si le candidat veut être notifié pour cette catégorie
    if (profile.notifCategories) {
      try {
        const cats: string[] = JSON.parse(profile.notifCategories);
        if (cats.length > 0 && !cats.includes(job.category)) {
          skipped++;
          continue;
        }
      } catch {
        // JSON invalide → on notifie quand même
      }
    }

    if (profile.smsOptIn) {
      const ok = await sendSMS(profile.phone, message);
      if (ok) smsSent++;
    }
    if (profile.whatsappOptIn) {
      const ok = await sendWhatsApp(profile.phone, message);
      if (ok) whatsappSent++;
    }
  }

  return NextResponse.json({
    success: true,
    smsSent,
    whatsappSent,
    skipped,
    total: profiles.length,
  });
}
