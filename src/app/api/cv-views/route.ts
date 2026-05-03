import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/sms";

async function getAuthUser(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const u = session.user as { id: string; role: string };
    return { id: u.id, role: u.role };
  }
  const mobile = getMobileUser(req);
  if (mobile) return { id: mobile.id, role: mobile.role };
  return null;
}

// ── POST : un recruteur vient de consulter un profil ─────────────────────────
export async function POST(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (authUser.role !== "EMPLOYER" && authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });
  }

  const viewerId = authUser.id;
  const { profileId } = await req.json();
  if (!profileId) return NextResponse.json({ error: "profileId manquant" }, { status: 400 });

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

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existing = await prisma.cvView.findFirst({
    where: { profileId, viewerId, viewedAt: { gte: oneDayAgo } },
  });

  if (!existing) {
    await prisma.cvView.create({
      data: { profileId, viewerId, companyName },
    });

    if (profile.whatsappOptIn && profile.phone) {
      const prenom = profile.user.name?.split(" ")[0] ?? "Candidat";
      const entreprise = companyName ? `*${companyName}*` : "un recruteur";
      const msg =
        `🎉 Bonne nouvelle, ${prenom} !\n\n` +
        `${entreprise} vient de consulter votre CV sur *KTZ Emploi*.\n\n` +
        `Connectez-vous sur votre tableau de bord pour voir le détail.`;
      sendWhatsApp(profile.phone, msg).catch((err) => console.error("[CvView WA]", err));
    }
  }

  return NextResponse.json({ success: true });
}

// ── GET : liste des vues du candidat connecté ─────────────────────────────────
export async function GET(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const userId = authUser.id;

  const profile = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) return NextResponse.json({ views: [], total: 0, thisMonth: 0, uniqueCompanies: 0 });

  const views = await prisma.cvView.findMany({
    where: { profileId: profile.id },
    orderBy: { viewedAt: "desc" },
    take: 50,
  });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const thisMonth = views.filter((v) => new Date(v.viewedAt) >= startOfMonth).length;
  const uniqueCompanies = new Set(views.map((v) => v.companyName).filter(Boolean)).size;

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
