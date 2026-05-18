import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizePhone(raw: string) {
  // Supprime espaces, tirets, parenthèses
  let p = raw.replace(/[\s\-().]/g, "");
  // Ajoute +236 si numéro local centrafricain (7 ou 8 chiffres)
  if (/^[0-9]{7,8}$/.test(p)) p = "+236" + p;
  // Ajoute + si commence par 236
  if (/^236/.test(p)) p = "+" + p;
  return p;
}

async function sendWhatsApp(phone: string, code: string) {
  const instance = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  if (!instance || !token) throw new Error("ULTRAMSG_NOT_CONFIGURED");

  const body = `🔐 *KTZ Emploi* — Votre code de vérification est : *${code}*\n\nCe code expire dans 10 minutes. Ne le partagez avec personne.`;

  const res = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token, to: phone, body }),
  });

  const data = await res.json();
  if (!data.sent && !data.id) throw new Error("Échec envoi WhatsApp");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`otp:${ip}`, 5, 15 * 60 * 1000)) return rateLimitResponse();

  const { phone: rawPhone } = await req.json();
  if (!rawPhone) return NextResponse.json({ error: "Numéro requis" }, { status: 400 });

  const phone = normalizePhone(rawPhone);
  if (!/^\+\d{8,15}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
  }

  const code = generateCode();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Supprimer les anciens OTP pour ce numéro
  await prisma.otpCode.deleteMany({ where: { phone } });

  // Stocker le nouveau OTP
  await prisma.otpCode.create({ data: { phone, code, expires } });

  try {
    await sendWhatsApp(phone, code);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";

    // Mode développement : retourner le code directement si UltraMsg absent
    if (msg === "ULTRAMSG_NOT_CONFIGURED" && process.env.NODE_ENV !== "production") {
      console.log(`\n[DEV OTP] ${phone} → ${code}\n`);
      return NextResponse.json({ success: true, phone, devCode: code });
    }

    console.error("[OTP send error]", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer le code WhatsApp. Vérifiez que votre compte UltraMsg est connecté (ULTRAMSG_INSTANCE et ULTRAMSG_TOKEN)." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, phone });
}
