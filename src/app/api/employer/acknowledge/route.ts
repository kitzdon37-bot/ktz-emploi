import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApplicationAcknowledgementEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER") return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });

  const userId = (session.user as { id?: string }).id!;
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const { applicationId } = await req.json();
  if (!applicationId) return NextResponse.json({ error: "applicationId manquant" }, { status: 400 });

  // Vérifier que la candidature appartient bien à une offre de cette entreprise
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { select: { title: true, companyId: true } },
      user: { select: { name: true, email: true } },
    },
  });

  if (!application) return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  if (application.job.companyId !== company.id) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

  // Envoyer l'email
  const result = await sendApplicationAcknowledgementEmail({
    candidateName: application.user.name || application.user.email,
    candidateEmail: application.user.email,
    jobTitle: application.job.title,
    companyName: company.name,
  });

  if (!result.success) {
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email" }, { status: 500 });
  }

  // Passer le statut à REVIEWING si toujours PENDING
  if (application.status === "PENDING") {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "REVIEWING" },
    });
  }

  return NextResponse.json({ success: true });
}
