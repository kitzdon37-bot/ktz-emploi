// Route de diagnostic WhatsApp — retourne l'état du provider actif
// Accessible uniquement par les admins : GET /api/admin/whatsapp/debug
import { NextResponse }     from "next/server";
import { getServerSession }  from "next-auth";
import { authOptions }       from "@/lib/auth";
import { getWasenderStatus } from "@/lib/sms";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const provider = process.env.WA_PROVIDER || "wasenderapi";
  const results: Record<string, unknown> = { provider };

  // ── UltraMsg ───────────────────────────────────────────────────────────────
  if (provider === "ultramsg") {
    const instanceId = process.env.ULTRAMSG_INSTANCE;
    const token      = process.env.ULTRAMSG_TOKEN;

    results.vars = {
      ULTRAMSG_INSTANCE: instanceId ? "✓ défini" : "✗ manquant",
      ULTRAMSG_TOKEN:    token       ? "✓ défini" : "✗ manquant",
    };

    if (!instanceId || !token) {
      return NextResponse.json({ ...results, state: "not_configured" });
    }

    try {
      const statusRes = await fetch(
        `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`,
        { cache: "no-store" }
      );
      results.statusHttpCode = statusRes.status;
      const body = await statusRes.json();
      results.statusBody = body;
      const status = body?.status?.accountStatus?.status ?? "";
      const sub    = body?.status?.accountStatus?.substatus ?? "";
      const ok     = status === "authenticated" || sub === "connected";
      return NextResponse.json({ ...results, state: ok ? "authorized" : "notAuthorized" });
    } catch (err) {
      return NextResponse.json({ ...results, state: "error", error: String(err) });
    }
  }

  // ── Green API ──────────────────────────────────────────────────────────────
  if (provider === "greenapi") {
    const instanceId = process.env.GREEN_API_INSTANCE;
    const apiToken   = process.env.GREEN_API_TOKEN;

    results.vars = {
      GREEN_API_INSTANCE: instanceId ? "✓ défini" : "✗ manquant",
      GREEN_API_TOKEN:    apiToken   ? "✓ défini" : "✗ manquant",
    };

    if (!instanceId || !apiToken) {
      return NextResponse.json({ ...results, state: "not_configured" });
    }

    try {
      const res  = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`
      );
      const data = await res.json();
      return NextResponse.json({ ...results, state: data.stateInstance ?? "unknown" });
    } catch (err) {
      return NextResponse.json({ ...results, state: "error", error: String(err) });
    }
  }

  // ── WasenderAPI ────────────────────────────────────────────────────────────
  if (provider === "wasenderapi") {
    const apiKey = process.env.WASENDER_API_KEY;

    results.vars = {
      WASENDER_API_KEY: apiKey ? "✓ défini" : "✗ manquant",
    };

    if (!apiKey) {
      return NextResponse.json({ ...results, state: "not_configured" });
    }

    const st = await getWasenderStatus();
    return NextResponse.json({ ...results, ...st });
  }

  return NextResponse.json({ ...results, state: "unknown_provider" });
}
