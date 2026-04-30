// Notifications : SMS (Africa's Talking) + WhatsApp (UltraMsg | Meta | Green API)
// Choisir le provider WhatsApp via WA_PROVIDER dans .env :
//   WA_PROVIDER=ultramsg  → UltraMsg (WhatsApp Web, 3 jours gratuit puis 2.99$/mois)
//   WA_PROVIDER=meta      → WhatsApp Cloud API (Meta officiel, gratuit 1000/mois)
//   WA_PROVIDER=greenapi  → Green API (WhatsApp Web, 200/mois gratuit)

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
  const provider = process.env.WA_PROVIDER || "ultramsg";

  if (provider === "ultramsg") return sendWhatsAppUltraMsg(to, message);
  if (provider === "greenapi") return sendWhatsAppGreenAPI(to, message);
  return sendWhatsAppMeta(to, message);
}

// ── Provider 1 : UltraMsg ────────────────────────────────────────────────────
// 3 jours gratuit → 2.99$/mois · setup en 5 min (scan QR)
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
      to: phone,       // format E.164 : +23677000000
      body: message,
      priority: "10",  // priorité d'envoi UltraMsg (1-10)
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
    // UltraMsg retourne { sent: "true", id: "...", message: {...} }
    const sent = data?.sent === "true" || data?.sent === true;
    if (!sent) console.error("[WhatsApp/UltraMsg] Échec:", data);
    return sent;
  } catch (err) {
    console.error("[WhatsApp/UltraMsg] Exception:", err);
    return false;
  }
}

// ── Provider 2 : WhatsApp Cloud API (Meta) ───────────────────────────────────
// Gratuit jusqu'à 1000 conversations/mois
// Variables : WA_PHONE_NUMBER_ID, WA_ACCESS_TOKEN
async function sendWhatsAppMeta(to: string, message: string): Promise<boolean> {
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
  const accessToken = process.env.WA_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error("[WhatsApp/Meta] WA_PHONE_NUMBER_ID ou WA_ACCESS_TOKEN manquant");
    return false;
  }

  const phone = normalizePhone(to);
  if (!phone) {
    console.error("[WhatsApp/Meta] Numéro invalide:", to);
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.replace("+", ""),
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!res.ok) {
      console.error("[WhatsApp/Meta] Erreur:", res.status, await res.text());
      return false;
    }

    const data = await res.json();
    return !!data?.messages?.[0]?.id;
  } catch (err) {
    console.error("[WhatsApp/Meta] Exception:", err);
    return false;
  }
}

// ── Provider 3 : Green API ───────────────────────────────────────────────────
// Gratuit jusqu'à 200 messages/mois
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
