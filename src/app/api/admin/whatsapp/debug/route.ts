// Route de diagnostic UltraMsg — retourne la réponse brute de l'API
// Accessible uniquement par les admins : GET /api/admin/whatsapp/debug
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const instanceId = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    return NextResponse.json({
      error: "Variables manquantes",
      ULTRAMSG_INSTANCE: instanceId ? "✓ défini" : "✗ manquant",
      ULTRAMSG_TOKEN: token ? "✓ défini" : "✗ manquant",
    });
  }

  const results: Record<string, unknown> = {
    ULTRAMSG_INSTANCE: instanceId,
    WA_PROVIDER: process.env.WA_PROVIDER,
  };

  // Test statut
  try {
    const statusRes = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`,
      { cache: "no-store" }
    );
    results.statusHttpCode = statusRes.status;
    results.statusBody = await statusRes.json();
  } catch (err) {
    results.statusError = String(err);
  }

  // Test QR
  try {
    const qrRes = await fetch(
      `https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`,
      { cache: "no-store" }
    );
    results.qrHttpCode = qrRes.status;
    const qrBody = await qrRes.json();
    // Ne retourne pas le QR complet (trop long), juste les clés
    results.qrBodyKeys = Object.keys(qrBody);
    results.qrHasCode = !!qrBody?.qrCode;
    results.qrMessage = qrBody?.message;
  } catch (err) {
    results.qrError = String(err);
  }

  return NextResponse.json(results, { status: 200 });
}
