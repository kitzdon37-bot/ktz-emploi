import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileUser } from "@/lib/mobile-auth";
import { handleOptions, withCors } from "@/lib/cors";
import { sendNewsletterEmail } from "@/lib/email";

export async function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

// GET: liste des abonnés + campagnes récentes
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const [subscribers, campaigns] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.newsletterCampaign.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const total = subscribers.length;
    const active = subscribers.filter((s) => s.active).length;

    return withCors(NextResponse.json({ subscribers, campaigns, total, active }), req);
  } catch (error) {
    console.error("[mobile/admin/newsletter GET]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// POST: envoyer une newsletter
export async function POST(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { subject, content } = await req.json();

    if (!subject?.trim() || !content?.trim()) {
      return withCors(NextResponse.json({ error: "Sujet et contenu requis" }, { status: 400 }), req);
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
    });

    if (subscribers.length === 0) {
      return withCors(NextResponse.json({ error: "Aucun abonné actif" }, { status: 400 }), req);
    }

    const results: { email: string; sent: boolean; error?: string }[] = [];

    for (const sub of subscribers) {
      const result = await sendNewsletterEmail({
        to: sub.email,
        name: sub.name,
        subject,
        content,
        unsubscribeToken: sub.token,
      });
      results.push({ email: sub.email, sent: result.success, error: result.error });
    }

    const sent = results.filter((r) => r.sent).length;

    await prisma.newsletterCampaign.create({
      data: {
        subject,
        content,
        type: "manual",
        recipientCount: sent,
      },
    });

    return withCors(NextResponse.json({ success: true, sent, total: subscribers.length, results }), req);
  } catch (error) {
    console.error("[mobile/admin/newsletter POST]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}

// DELETE: supprimer un abonné
export async function DELETE(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "ADMIN") {
      return withCors(NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 }), req);
    }

    const { id } = await req.json();
    if (!id) return withCors(NextResponse.json({ error: "ID manquant" }, { status: 400 }), req);

    await prisma.newsletterSubscriber.delete({ where: { id } });
    return withCors(NextResponse.json({ success: true }), req);
  } catch (error) {
    console.error("[mobile/admin/newsletter DELETE]", error);
    return withCors(NextResponse.json({ error: "Erreur serveur" }, { status: 500 }), req);
  }
}
