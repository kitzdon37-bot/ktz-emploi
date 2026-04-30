import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/sms";

// ── POST : un recruteur vient de consulter un profil ─────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "EMPLOYER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });
  }

  const viewerId = (session.user as { id?: string }).id!;
  const { profileId } = await req.json();
  if (!profileId) return NextResponse.json({ error: "profileId manquant" }, { status: 400 });

  // Récupérer le profil + l'entreprise du recruteur
  const [profile, recruiter] = await Promise.all([
    prisma.jobSeekerProfile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        phone: true,
        whatsappOptIn: true,
        user: { select: { name: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: viewerId },
      select: { company: { select: { name: true } } },
    }),
  ]);

  if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

  const companyName = recruiter?.company?.name ?? null;

  // Dédupliquer : une seule vue par recruteur par profil par 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma.cvView.findFirst({
    where: { profileId, viewerId, viewedAt: { gte: oneDayAgo } },
  });

  if (!existing) {
    // Enregistrer la vue
    await prisma.cvView.create({
      data: { profileId, viewerId, companyName },
    });

    // Notification WhatsApp au candidat (non bloquant)
    if (profile.whatsappOptIn && profile.phone) {
      const prenom = profile.user.name?.split(" ")[0] ?? "Candidat";
      const entreprise = companyName ? `*${companyName}*` : "un recruteur";
      const msg =
        `🎉 Bonne nouvelle, ${prenom} !\n\n` +
        `${entreprise} vient de consulter votre CV sur *KTZ Emploi*.\n\n` +
        `Connectez-vous sur votre tableau de bord pour voir le détail : /tableau-de-bord/cv`;

      sendWhatsApp(profile.phone, msg).catch((err) =>
        console.error("[CvView WA]", err)
      );
    }
  }

  return NextResponse.json({ success: true });
}

// ── GET : liste des vues du candidat connecté ─────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = (session.user as { id?: string }).id!;

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) return NextResponse.json({ views: [], total: 0, thisMonth: 0 });

  const views = await prisma.cvView.findMany({
    where: { profileId: profile.id },
    orderBy: { viewedAt: "desc" },
    take: 50,
  });

  // Compter les vues du mois en cours
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thisMonth = views.filter((v) => new Date(v.viewedAt) >= startOfMonth).length;

  // Compter les entreprises uniques
  const uniqueCompanies = new Set(
    views.map((v) => v.companyName).filter(Boolean)
  ).size;

  return NextResponse.json({
    views: views.map((v) => ({
      id: v.id,
      companyName: v.companyName,
      viewedAt: v.viewedAt.toISOString(),
    })),
    total: views.length,
    thisMonth,
    uniqueCompanies,
  });
}
