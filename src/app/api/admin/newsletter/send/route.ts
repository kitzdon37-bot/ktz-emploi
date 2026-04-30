import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewsletterEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const { subject, content } = await req.json();

  if (!subject || !content) {
    return NextResponse.json({ error: "Sujet et contenu requis" }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: "Aucun abonné actif" }, { status: 400 });
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

  return NextResponse.json({ results, sent, total: subscribers.length });
}
