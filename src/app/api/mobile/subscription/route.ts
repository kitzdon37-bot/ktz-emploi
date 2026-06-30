import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleOptions } from "@/lib/cors";
import { getMobileUser } from "@/lib/mobile-auth";
import { logActivity } from "@/lib/activity";
import { sendEmail } from "@/lib/email";

export async function OPTIONS() {
  return handleOptions();
}

// GET — abonnement actuel de l'employeur connecté
export async function GET(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: tokenUser.id },
      include: { subscription: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      plan: company.subscription?.plan ?? "FREE",
      status: company.subscription?.status ?? "ACTIVE",
      endDate: company.subscription?.endDate ?? null,
    });
  } catch (error) {
    console.error("[mobile/subscription GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST — demande de changement de plan (paiement en attente de validation)
export async function POST(req: NextRequest) {
  try {
    const tokenUser = getMobileUser(req);
    if (!tokenUser || tokenUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { plan, paymentRef, paymentMethod } = await req.json();

    if (!["MICRO", "STARTER", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }
    if (!paymentRef || !paymentMethod) {
      return NextResponse.json({ error: "Référence de paiement et méthode requises" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { userId: tokenUser.id } });
    if (!company) {
      return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id },
      select: { name: true, email: true },
    });

    const sub = await prisma.subscription.upsert({
      where: { companyId: company.id },
      update: { plan, status: "PENDING", paymentRef, paymentMethod, updatedAt: new Date() },
      create: { companyId: company.id, plan, status: "PENDING", paymentRef, paymentMethod },
    });

    await logActivity({
      userId: tokenUser.id,
      userEmail: user?.email ?? undefined,
      userName: user?.name ?? undefined,
      type: "SUBSCRIPTION_REQUESTED",
      label: `Demande plan ${plan} — ${company.name} (mobile)`,
      metadata: { plan, paymentMethod, paymentRef, companyName: company.name },
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `[KTZ Emploi] Nouvelle demande d'abonnement ${plan} — ${company.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#f97316">Nouvelle demande d'abonnement</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#6b7280">Entreprise</td><td style="font-weight:600">${company.name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Contact</td><td>${user?.email ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Plan demandé</td><td style="font-weight:600;color:#f97316">${plan}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Paiement</td><td>${paymentMethod?.replace("_", " ")}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Référence</td><td style="font-family:monospace">${paymentRef}</td></tr>
            </table>
            <a href="${process.env.NEXTAUTH_URL}/tableau-de-bord/admin" style="display:inline-block;margin-top:20px;background:#f97316;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">
              Valider dans l'admin →
            </a>
          </div>
        `,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: sub.id });
  } catch (error) {
    console.error("[mobile/subscription POST]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
