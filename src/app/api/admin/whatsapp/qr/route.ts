import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const provider = process.env.WA_PROVIDER || "wasenderapi";

  // ── WasenderAPI : QR géré sur le dashboard wasenderapi.com ──────────────────
  if (provider === "wasenderapi") {
    return NextResponse.json({
      provider,
      qr: null,
      dashboardUrl: "https://wasenderapi.com/dashboard",
      message: "Connectez votre WhatsApp directement sur le dashboard WasenderAPI",
    });
  }

  // ── UltraMsg ──────────────────────────────────────────────────────────────────
  if (provider === "ultramsg") {
    const instanceId = process.env.ULTRAMSG_INSTANCE;
    const token = process.env.ULTRAMSG_TOKEN;

    if (!instanceId || !token) {
      return NextResponse.json({ error: "UltraMsg non configuré" }, { status: 400 });
    }

    try {
      const res = await fetch(
        `https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`,
        { cache: "no-store" }
      );
      const raw = await res.text();
      if (!res.ok) return NextResponse.json({ error: `UltraMsg erreur ${res.status}` }, { status: 502 });
      const data = JSON.parse(raw);
      let qr: string | null = null;
      if (data?.qrCode) {
        qr = data.qrCode.includes("base64,") ? data.qrCode.split("base64,")[1] : data.qrCode;
      }
      return NextResponse.json({ qr, provider, message: data?.message });
    } catch {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  // ── Green API ─────────────────────────────────────────────────────────────────
  if (provider === "greenapi") {
    const instanceId = process.env.GREEN_API_INSTANCE;
    const apiToken = process.env.GREEN_API_TOKEN;

    if (!instanceId || !apiToken) {
      return NextResponse.json({ error: "Green API non configuré" }, { status: 400 });
    }

    try {
      const res = await fetch(`https://api.green-api.com/waInstance${instanceId}/qr/${apiToken}`);
      if (!res.ok) return NextResponse.json({ error: "Impossible de récupérer le QR" }, { status: 502 });
      const data = await res.json();
      return NextResponse.json({ qr: data.message, provider });
    } catch {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Provider inconnu" }, { status: 400 });
}
