import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, name, frequency } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const freq = frequency === "monthly" ? "monthly" : "weekly";

  // Récupérer les 3 dernières offres publiées pour personnaliser le mail de bienvenue
  const recentJobs = await prisma.job.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      location: true,
      company: { select: { name: true } },
    },
  });

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

  if (existing) {
    if (existing.active) {
      return NextResponse.json({ message: "Vous êtes déjà abonné." }, { status: 200 });
    }
    // Réactivation
    const updated = await prisma.newsletterSubscriber.update({
      where: { email },
      data: { active: true, frequency: freq, name: name || existing.name },
    });
    sendNewsletterWelcomeEmail({
      to: email,
      name: updated.name,
      frequency: freq,
      unsubscribeToken: updated.token,
      recentJobs,
    }).catch((err) => console.error("[Newsletter] Erreur email bienvenue:", err));
    return NextResponse.json({ message: "Abonnement réactivé avec succès !" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email, name: name || null, token, frequency: freq },
  });

  sendNewsletterWelcomeEmail({
    to: email,
    name: subscriber.name,
    frequency: freq,
    unsubscribeToken: token,
    recentJobs,
  }).catch((err) => console.error("[Newsletter] Erreur email bienvenue:", err));

  return NextResponse.json({ message: "Abonnement confirmé ! Merci." }, { status: 201 });
}
