import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const provider = process.env.WA_PROVIDER || "ultramsg";

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

      const raw = await res.text();
      console.log("[UltraMsg status raw]", raw);

      if (!res.ok) {
        return NextResponse.json({ configured: true, state: "error", provider, raw });
      }

      const data = JSON.parse(raw);
      // UltraMsg retourne { status: { accountStatus: { status: "authenticated", substatus: "connected" } } }
      const accountStatus = data?.status?.accountStatus?.status ?? data?.instanceStatus ?? "";
      const substatus = data?.status?.accountStatus?.substatus ?? "";
      const connected = accountStatus === "authenticated" || substatus === "connected" || accountStatus.toLowerCase() === "connected";
      const state = connected ? "authorized" : "notAuthorized";

      return NextResponse.json({ configured: true, state, provider, raw: `${accountStatus}/${substatus}` });
    } catch (err) {
      console.error("[UltraMsg status error]", err);
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

  // ── Meta ──
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const accessToken = process.env.WA_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    return NextResponse.json({ configured: false, state: "not_configured", provider });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}?access_token=${accessToken}`
    );
    return NextResponse.json({ configured: true, state: res.ok ? "authorized" : "error", provider });
  } catch {
    return NextResponse.json({ configured: true, state: "error", provider });
  }
}
