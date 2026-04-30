import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendAutoNewsletterEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { frequency } = (await req.json()) as { frequency?: "weekly" | "monthly" };
  const freq: "weekly" | "monthly" = frequency === "monthly" ? "monthly" : "weekly";

  // Offres publiées dans la période
  const since = new Date();
  since.setDate(since.getDate() - (freq === "weekly" ? 7 : 30));

  const jobs = await prisma.job.findMany({
    where: { published: true, createdAt: { gte: since } },
    include: { company: { select: { name: true, logo: true } } },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 10,
  });

  if (jobs.length === 0) {
    return NextResponse.json(
      { error: "Aucune nouvelle offre publiée dans cette période" },
      { status: 400 }
    );
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true, frequency: freq },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "Aucun abonné actif pour cette fréquence" }, { status: 400 });
  }

  const results: { email: string; sent: boolean; error?: string }[] = [];

  for (const sub of subscribers) {
    const result = await sendAutoNewsletterEmail({
      to: sub.email,
      name: sub.name,
      jobs,
      unsubscribeToken: sub.token,
      period: freq,
    });
    results.push({ email: sub.email, sent: result.success, error: result.error });
  }

  const sent = results.filter((r) => r.sent).length;
  const periodLabel = freq === "weekly" ? "cette semaine" : "ce mois-ci";

  await prisma.newsletterCampaign.create({
    data: {
      subject: `${jobs.length} nouvelle(s) offre(s) d'emploi ${periodLabel} — KTZ Emploi`,
      content: `Envoi automatique (${freq}) — ${jobs.length} offres`,
      type: "auto",
      recipientCount: sent,
    },
  });

  return NextResponse.json({ results, sent, total: subscribers.length, jobCount: jobs.length });
}
