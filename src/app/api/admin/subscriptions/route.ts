import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlanLimits } from "@/lib/plans";
import { logActivity } from "@/lib/activity";

// GET — toutes les entreprises avec leur statut d'abonnement (y compris FREE sans record)
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  // Toutes les entreprises avec leur abonnement (ou null si FREE)
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      createdAt: true,
      _count: { select: { jobs: true } },
      subscription: {
        select: {
          id: true,
          plan: true,
          status: true,
          startDate: true,
          endDate: true,
          paymentRef: true,
          paymentMethod: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculer les stats globales
  const allSubs = companies.map(c => c.subscription);
  const pendingCount = allSubs.filter(s => s?.status === "PENDING").length;
  const activeCount = allSubs.filter(s => s?.status === "ACTIVE").length;
  const revenue = allSubs
    .filter(s => s?.status === "ACTIVE")
    .reduce((sum, s) => {
      const plan = getPlanLimits(s?.plan ?? "FREE");
      return sum + plan.price;
    }, 0);

  return NextResponse.json({ companies, stats: { pendingCount, activeCount, revenue } });
}

// PATCH — admin valide ou annule un abonnement
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Interdit" }, { status: 403 });

  const { subscriptionId, action } = await req.json(); // action: "activate" | "cancel"

  if (!["activate", "cancel", "reset"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) return NextResponse.json({ error: "Abonnement introuvable" }, { status: 404 });

  if (action === "activate") {
    const plan = getPlanLimits(sub.plan);
    const durationDays = sub.plan === "PRO" ? 30 : 30;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "ACTIVE", startDate: new Date(), endDate },
    });

    if (sub.plan === "PRO" && plan.badge === "Super Recruteur") {
      await prisma.company.update({
        where: { id: sub.companyId },
        data: { superRecruiter: true },
      });
    }
  } else if (action === "reset") {
    await prisma.subscription.delete({ where: { id: subscriptionId } });
    await prisma.company.update({
      where: { id: sub.companyId },
      data: { superRecruiter: false },
    });
  } else {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED" },
    });
    await prisma.company.update({
      where: { id: sub.companyId },
      data: { superRecruiter: false },
    });
  }

  const adminId = (session?.user as { id?: string })?.id;
  await logActivity({
    userId: adminId,
    type: action === "activate" ? "SUBSCRIPTION_ACTIVATED" : action === "reset" ? "SUBSCRIPTION_CANCELLED" : "SUBSCRIPTION_CANCELLED",
    label: `Abonnement ${action === "activate" ? "activé" : action === "reset" ? "remis à zéro (FREE)" : "annulé"} — ${sub.plan} pour ${sub.companyId}`,
    metadata: { subscriptionId, action, plan: sub.plan },
  });

  return NextResponse.json({ success: true });
}
