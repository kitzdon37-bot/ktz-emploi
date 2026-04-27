import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendResetEmail } from "@/lib/email";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limiting : 3 demandes par IP sur 1 heure (anti-énumération d'emails)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`forgot-password:${ip}`, 3, 60 * 60 * 1000)) {
    return rateLimitResponse();
  }

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requis" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // Toujours répondre "ok" même si l'email n'existe pas (sécurité anti-énumération)
    if (!user) return NextResponse.json({ success: true });

    // Génère un token sécurisé valable 1 heure
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // +1h

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reinitialiser-mot-de-passe?token=${token}`;
    await sendResetEmail({ name: user.name ?? email, email, resetUrl });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
