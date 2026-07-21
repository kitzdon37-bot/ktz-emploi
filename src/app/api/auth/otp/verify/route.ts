import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone: rawPhone, code } = await req.json();
  if (!rawPhone || !code) return NextResponse.json({ error: "Données manquantes" }, { status: 400 });

  const phone = normalizePhone(rawPhone) ?? rawPhone;

  const otp = await prisma.otpCode.findFirst({
    where: { phone, code },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  if (otp.expires < new Date()) {
    await prisma.otpCode.delete({ where: { id: otp.id } });
    return NextResponse.json({ error: "Code expiré — demandez un nouveau code" }, { status: 401 });
  }

  // OTP valide — NE PAS supprimer ici : il sera consommé par signIn("phone") côté client

  // Chercher si un compte existe déjà avec ce numéro
  const existing = await prisma.user.findUnique({ where: { phone } });

  return NextResponse.json({ success: true, exists: !!existing, phone });
}
