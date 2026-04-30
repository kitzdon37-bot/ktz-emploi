import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER" && role !== "ADMIN")
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const { candidateEmail, candidateName, subject, message } = await req.json();

  if (!candidateEmail || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Récupérer les infos de l'entreprise du recruteur
  const employer = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      name: true,
      email: true,
      company: { select: { name: true } },
    },
  });

  const senderName = employer?.company?.name || employer?.name || "Un recruteur";
  const senderEmail = employer?.email || session.user.email!;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
      <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px 32px 24px;">
          <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0 0 4px;">KTZ Emploi</p>
          <h1 style="color:#fff;font-size:20px;margin:0;font-weight:700;">Message d'un recruteur</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:15px;margin:0 0 20px;">
            Bonjour${candidateName ? ` <strong>${candidateName}</strong>` : ""},
          </p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">
            Vous avez reçu un message de <strong style="color:#111827;">${senderName}</strong> via KTZ Emploi :
          </p>
          <div style="background:#f9fafb;border-left:4px solid #f97316;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
            <p style="color:#374151;font-size:15px;margin:0;white-space:pre-line;line-height:1.6;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;margin:20px 0 0;">
            Pour répondre, écrivez directement à :
            <a href="mailto:${senderEmail}" style="color:#f97316;font-weight:600;">${senderEmail}</a>
          </p>
        </div>
        <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">
            Ce message a été envoyé via <strong>KTZ Emploi</strong> — la plateforme emploi centrafricaine
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: candidateEmail,
    subject: subject.trim(),
    html,
  });

  return NextResponse.json({ message: "Message envoyé avec succès." });
}
