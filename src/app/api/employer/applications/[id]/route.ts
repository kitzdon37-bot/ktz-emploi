import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendStatusNotificationEmail } from "@/lib/email";

async function sendWhatsAppNotification(phone: string, candidateName: string, jobTitle: string, companyName: string, status: string) {
  const instance = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  if (!instance || !token) return;

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    REVIEWING: "En cours d'examen",
    INTERVIEW: "Invitation à un entretien",
    ACCEPTED: "Candidature acceptée ✅",
    REJECTED: "Candidature non retenue",
  };

  const label = statusLabels[status] ?? status;
  const prenom = candidateName.split(" ")[0];
  const body = `📋 *KTZ Emploi* — Mise à jour de votre candidature\n\nBonjour ${prenom},\n\nLe statut de votre candidature pour le poste *${jobTitle}* chez *${companyName}* a été mis à jour :\n\n👉 *${label}*\n\nConsultez vos candidatures : https://ktzemploi.com/tableau-de-bord/candidatures`;

  await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token, to: phone, body }),
  }).catch(() => {}); // silencieux si UltraMsg indisponible
}

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
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  const body = await req.json();
  const { status, sendEmail, emailSubject, emailMessage } = body;

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
    const candidatePhone = application.user.phone ?? null;

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

    // WhatsApp si le candidat a un numéro (non bloquant)
    if (candidatePhone) {
      sendWhatsAppNotification(candidatePhone, candidateName, application.job.title, company.name, status)
        .catch((err) => console.error("[Status notification WA]", err));
    }

    return NextResponse.json({ success: true });
  }

  // Envoi d'email personnalisé (sans changement de statut)
  if (sendEmail) {
    const result = await sendStatusNotificationEmail({
      candidateName: application.user.name || application.user.email || "Candidat",
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

  return NextResponse.json({ success: true });
}
