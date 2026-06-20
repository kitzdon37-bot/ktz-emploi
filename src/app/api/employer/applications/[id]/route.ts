import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendStatusNotificationEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/sms";

const STATUS_LABELS: Record<string, string> = {
  PENDING:   "En attente",
  REVIEWING: "En cours d'examen",
  INTERVIEW: "Invitation à un entretien",
  ACCEPTED:  "Candidature acceptée ✅",
  REJECTED:  "Candidature non retenue",
};

const VALID_STATUSES = ["PENDING", "REVIEWING", "INTERVIEW", "ACCEPTED", "REJECTED"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { title: true, companyId: true } },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          profile: { select: { phone: true, whatsappOptIn: true } },
        },
      },
    },
  });

  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { status, archived, sendEmail, sendWhatsApp: sendWhatsAppManual, emailSubject, emailMessage } = body;

  // Archivage / désarchivage
  if (typeof archived === "boolean") {
    await prisma.application.update({ where: { id }, data: { archived } });
    return NextResponse.json({ success: true });
  }

  // Mise à jour du statut + création d'une entrée dans l'historique
  if (status) {
    if (!VALID_STATUSES.includes(status))
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });

    await prisma.$transaction([
      prisma.application.update({
        where: { id },
        data: { status },
      }),
      prisma.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status,
        },
      }),
    ]);

    // Notification automatique au candidat à chaque changement de statut
    const candidateName = application.user.name || application.user.email || "Candidat";
    const candidateEmail = application.user.email ?? "";
    const profile = application.user.profile;
    // Numéro WhatsApp : priorité au profil candidat, sinon compte utilisateur
    const waPhone = profile?.phone || application.user.phone || null;
    const waOptIn = profile?.whatsappOptIn ?? false;

    // Email (non bloquant)
    if (candidateEmail) {
      sendStatusNotificationEmail({
        candidateName,
        candidateEmail,
        jobTitle: application.job.title,
        companyName: company.name,
        status,
        customSubject: emailSubject,
        customMessage: emailMessage,
      }).catch((err) => console.error("[Status notification email]", err));
    }

    // WhatsApp : uniquement si le candidat a activé les notifs WhatsApp
    if (waPhone && waOptIn) {
      const prenom = candidateName.split(" ")[0];
      const label = STATUS_LABELS[status] ?? status;
      const message =
        `📋 *KTZ Emploi* — Mise à jour de candidature\n\n` +
        `Bonjour ${prenom},\n\n` +
        `Votre candidature pour le poste *${application.job.title}* chez *${company.name}* a été mise à jour :\n\n` +
        `👉 *${label}*\n\n` +
        `Consultez vos candidatures : https://ktzemploi.com/tableau-de-bord/candidatures`;
      sendWhatsApp(waPhone, message)
        .catch((err) => console.error("[Status notification WA]", err));
    }

    return NextResponse.json({ success: true });
  }

  // Envoi de notification manuelle (email et/ou WhatsApp, sans changement de statut)
  const candidateName = application.user.name || application.user.email || "Candidat";
  const profile = application.user.profile;
  const waPhone = profile?.phone || application.user.phone || null;

  if (sendEmail) {
    const result = await sendStatusNotificationEmail({
      candidateName,
      candidateEmail: application.user.email ?? "",
      jobTitle: application.job.title,
      companyName: company.name,
      status: application.status,
      customSubject: emailSubject,
      customMessage: emailMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email", detail: result.error },
        { status: 207 }
      );
    }
  }

  if (sendWhatsAppManual && waPhone) {
    const prenom = candidateName.split(" ")[0];
    const label = STATUS_LABELS[application.status] ?? application.status;
    const waMessage = emailMessage?.trim()
      ? `📋 *KTZ Emploi* — Message de ${company.name}\n\nBonjour ${prenom},\n\n${emailMessage.trim()}`
      : `📋 *KTZ Emploi* — Mise à jour de candidature\n\nBonjour ${prenom},\n\nVotre candidature pour le poste *${application.job.title}* chez *${company.name}* : *${label}*\n\nhttps://ktzemploi.com/tableau-de-bord/candidatures`;
    sendWhatsApp(waPhone, waMessage)
      .catch((err) => console.error("[Manual WA notification]", err));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { id },
    include: { job: { select: { companyId: true } } },
  });

  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
