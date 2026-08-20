// Notifications : SMS (Africa's Talking) + WhatsApp (sans Meta)
// Choisir le provider WhatsApp via WA_PROVIDER dans .env :
//   WA_PROVIDER=wasenderapi → WasenderAPI  (WhatsApp Web, illimité, 6$/mois)   ← DÉFAUT / MOINS CHER
//   WA_PROVIDER=greenapi    → Green API    (WhatsApp Web, plan dev GRATUIT limité, ~8$/mois illimité)
//   WA_PROVIDER=ultramsg    → UltraMsg     (WhatsApp Web, illimité, 39$/mois)

export async function sendSMS(to: string, message: string): Promise<boolean> {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  const senderId = process.env.AT_SENDER_ID || "KTZEmploi";

  if (!apiKey || !username) {
    console.error("[SMS] Africa's Talking credentials non configurés");
    return false;
  }

  const phone = normalizePhone(to);
  if (!phone) {
    console.error("[SMS] Numéro invalide:", to);
    return false;
  }

  try {
    const body = new URLSearchParams({ username, to: phone, message, from: senderId });

    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      console.error("[SMS] Erreur Africa's Talking:", res.status, await res.text());
      return false;
    }

    const data = await res.json();
    const recipients = data?.SMSMessageData?.Recipients ?? [];
    const success = recipients.some((r: { status: string }) => r.status === "Success");
    if (!success) console.error("[SMS] Échec envoi:", JSON.stringify(recipients));
    return success;
  } catch (err) {
    console.error("[SMS] Exception:", err);
    return false;
  }
}

export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const provider = process.env.WA_PROVIDER || "wasenderapi";

  if (provider === "ultramsg")    return sendWhatsAppUltraMsg(to, message);
  if (provider === "wasenderapi") return sendWhatsAppWasender(to, message);
  return sendWhatsAppGreenAPI(to, message);
}

// ── Provider 1 : UltraMsg ────────────────────────────────────────────────────
// 39$/mois · illimité · setup : scan QR sur ultramsg.com
// Variables : ULTRAMSG_INSTANCE, ULTRAMSG_TOKEN
async function sendWhatsAppUltraMsg(to: string, message: string): Promise<boolean> {
  const instanceId = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;

  if (!instanceId || !token) {
    console.error("[WhatsApp/UltraMsg] ULTRAMSG_INSTANCE ou ULTRAMSG_TOKEN manquant");
    return false;
  }

  const phone = normalizePhone(to);
  if (!phone) {
    console.error("[WhatsApp/UltraMsg] Numéro invalide:", to);
    return false;
  }

  try {
    const body = new URLSearchParams({
      token,
      to: phone,
      body: message,
      priority: "10",
    });

    const res = await fetch(
      `https://api.ultramsg.com/${instanceId}/messages/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      }
    );

    const raw = await res.text();
    console.log("[WhatsApp/UltraMsg] Réponse:", raw);

    if (!res.ok) {
      console.error("[WhatsApp/UltraMsg] Erreur HTTP:", res.status, raw);
      return false;
    }

    const data = JSON.parse(raw);
    const sent = data?.sent === "true" || data?.sent === true;
    if (!sent) console.error("[WhatsApp/UltraMsg] Échec:", data);
    return sent;
  } catch (err) {
    console.error("[WhatsApp/UltraMsg] Exception:", err);
    return false;
  }
}

// ── Provider 2 : Green API ───────────────────────────────────────────────────
// Plan dev GRATUIT (limité) · illimité ~8$/mois · setup : scan QR sur green-api.com
// Variables : GREEN_API_INSTANCE, GREEN_API_TOKEN
async function sendWhatsAppGreenAPI(to: string, message: string): Promise<boolean> {
  const instanceId = process.env.GREEN_API_INSTANCE;
  const apiToken = process.env.GREEN_API_TOKEN;

  if (!instanceId || !apiToken) {
    console.error("[WhatsApp/GreenAPI] GREEN_API_INSTANCE ou GREEN_API_TOKEN manquant");
    return false;
  }

  const phone = normalizePhone(to);
  if (!phone) {
    console.error("[WhatsApp/GreenAPI] Numéro invalide:", to);
    return false;
  }

  try {
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: phone.replace("+", "") + "@c.us", message }),
      }
    );

    if (!res.ok) {
      console.error("[WhatsApp/GreenAPI] Erreur:", res.status, await res.text());
      return false;
    }

    const data = await res.json();
    return !!data?.idMessage;
  } catch (err) {
    console.error("[WhatsApp/GreenAPI] Exception:", err);
    return false;
  }
}

// ── Provider 3 : WasenderAPI ─────────────────────────────────────────────────
// 6$/mois · illimité · setup : créer compte sur wasenderapi.com → scanner QR
// Variables : WASENDER_API_KEY, WASENDER_PHONE (numéro WhatsApp expéditeur)
async function sendWhatsAppWasender(to: string, message: string, retries = 3): Promise<boolean> {
  const apiKey = process.env.WASENDER_API_KEY;

  if (!apiKey) {
    console.error("[WhatsApp/WasenderAPI] WASENDER_API_KEY manquant");
    return false;
  }

  const phone = normalizePhone(to);
  if (!phone) {
    console.error("[WhatsApp/WasenderAPI] Numéro invalide:", to);
    return false;
  }

  try {
    const res = await fetch("https://www.wasenderapi.com/api/send-message", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
      },
      body: JSON.stringify({ to: phone, text: message }),
    });

    const raw = await res.text();

    let data: Record<string, unknown> = {};
    try { data = JSON.parse(raw); } catch { /* raw non-JSON */ }

    // Rate limit : 1 msg/5s avec Account Protection activé
    if (res.status === 429 || data?.retry_after) {
      if (retries <= 0) {
        console.error("[WhatsApp/WasenderAPI] Rate limit persistant — abandon après 3 essais");
        return false;
      }
      console.warn(`[WhatsApp/WasenderAPI] Rate limit — attente 10s (${retries} essais restants)`);
      await new Promise(r => setTimeout(r, 10000));
      return sendWhatsAppWasender(to, message, retries - 1);
    }

    if (!res.ok) {
      console.error("[WhatsApp/WasenderAPI] Erreur HTTP:", res.status, raw);
      return false;
    }

    const ok = data?.success === true || data?.status === "success" || !!data?.id;
    if (!ok) console.error("[WhatsApp/WasenderAPI] Échec:", data);
    return ok;
  } catch (err) {
    console.error("[WhatsApp/WasenderAPI] Exception:", err);
    return false;
  }
}

// ── Normalise en format E.164 ────────────────────────────────────────────────
export function normalizePhone(phone: string): string | null {
  let p = phone.replace(/[\s\-().]/g, "");
  if (!p.startsWith("+")) {
    if (p.startsWith("00")) {
      p = "+" + p.slice(2);
    } else {
      p = "+236" + p; // défaut RCA
    }
  }
  if (!/^\+\d{8,15}$/.test(p)) return null;
  return p;
}
