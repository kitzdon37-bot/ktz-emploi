import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendStatusNotificationEmail } from "@/lib/email";

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
      user: { select: { name: true, email: true } },
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
  }

  // Envoi d'email personnalisé
  if (sendEmail) {
    const result = await sendStatusNotificationEmail({
      candidateName: application.user.name || application.user.email || "Candidat",
      candidateEmail: application.user.email ?? "",
      jobTitle: application.job.title,
      companyName: company.name,
      status: status || application.status,
      customSubject: emailSubject,
      customMessage: emailMessage,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Statut mis à jour mais erreur lors de l'envoi de l'email", detail: result.error },
        { status: 207 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
