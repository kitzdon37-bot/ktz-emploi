import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { phone, message } = await req.json();

  if (!phone || !message) {
    return NextResponse.json({ error: "Numéro et message requis" }, { status: 400 });
  }

  const ok = await sendWhatsApp(phone, message);
  return NextResponse.json({ success: ok });
}
