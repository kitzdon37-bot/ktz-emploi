import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const provider = process.env.WA_PROVIDER || "wasenderapi";

  // ── WasenderAPI ──
  if (provider === "wasenderapi") {
    const apiKey = process.env.WASENDER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ configured: false, state: "not_configured", provider });
    }

    try {
      const res = await fetch("https://www.wasenderapi.com/api/whatsapp-sessions", {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      const data = await res.json();
      const sessions = data?.data ?? [];
      const connected = data?.success === true && sessions.length > 0;
      return NextResponse.json({ configured: true, state: connected ? "authorized" : "notAuthorized", provider, sessions });
    } catch (err) {
      console.error("[WasenderAPI status error]", err);
      return NextResponse.json({ configured: true, state: "error", provider });
    }
  }

  // ── UltraMsg ──
  if (provider === "ultramsg") {
    const instanceId = process.env.ULTRAMSG_INSTANCE;
    const token = process.env.ULTRAMSG_TOKEN;

    if (!instanceId || !token) {
      return NextResponse.json({ configured: false, state: "not_configured", provider });
    }

    try {
      const res = await fetch(
        `https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const accountStatus = data?.status?.accountStatus?.status ?? "";
      const substatus = data?.status?.accountStatus?.substatus ?? "";
      const connected = accountStatus === "authenticated" || substatus === "connected";
      return NextResponse.json({ configured: true, state: connected ? "authorized" : "notAuthorized", provider });
    } catch {
      return NextResponse.json({ configured: true, state: "error", provider });
    }
  }

  // ── Green API ──
  if (provider === "greenapi") {
    const instanceId = process.env.GREEN_API_INSTANCE;
    const apiToken = process.env.GREEN_API_TOKEN;

    if (!instanceId || !apiToken) {
      return NextResponse.json({ configured: false, state: "not_configured", provider });
    }

    try {
      const res = await fetch(
        `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`
      );
      if (!res.ok) return NextResponse.json({ configured: true, state: "error", provider });
      const data = await res.json();
      return NextResponse.json({ configured: true, state: data.stateInstance ?? "unknown", provider });
    } catch {
      return NextResponse.json({ configured: true, state: "error", provider });
    }
  }

  return NextResponse.json({ configured: false, state: "unknown_provider", provider });
}
