import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { sendWhatsApp, sendSMS, normalizePhone } from "@/lib/sms";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`otp:${ip}`, 5, 15 * 60 * 1000)) return rateLimitResponse();

  const { phone: rawPhone } = await req.json();
  if (!rawPhone) return NextResponse.json({ error: "Numéro requis" }, { status: 400 });

  const phone = normalizePhone(rawPhone);
  if (!phone || !/^\+\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Supprimer les anciens OTP pour ce numéro
  await prisma.otpCode.deleteMany({ where: { phone } });

  // Stocker le nouveau OTP
  await prisma.otpCode.create({ data: { phone, code, expires } });

  const message = `🔐 *KTZ Emploi* — Votre code de vérification est : *${code}*\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;

  let sent = await sendWhatsApp(phone, message);

  // Repli SMS si WhatsApp est indisponible (session déconnectée, quota…)
  if (!sent && process.env.AT_API_KEY && process.env.AT_USERNAME) {
    console.warn("[OTP] Échec WhatsApp — tentative par SMS pour", phone);
    sent = await sendSMS(phone, `KTZ Emploi - Votre code de verification : ${code} (valable 10 min)`);
  }

  if (!sent) {
    console.error("[OTP] Impossible d'envoyer le code à", phone, "— vérifier la session WhatsApp (GET /api/admin/whatsapp/debug)");
    // Mode développement : afficher le code dans la console si l'envoi échoue
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[DEV OTP] ${phone} → ${code}\n`);
      return NextResponse.json({ success: true, phone, devCode: code });
    }

    return NextResponse.json(
      { error: "Service WhatsApp temporairement indisponible. Veuillez réessayer dans quelques instants ou contacter le support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, phone });
}
