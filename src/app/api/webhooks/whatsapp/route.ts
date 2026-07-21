/**
 * Webhook WhatsApp Cloud API (Meta)
 * ──────────────────────────────────────────────────────────────────────────────
 * GET  /api/webhooks/whatsapp  → vérification du webhook par Meta
 * POST /api/webhooks/whatsapp  → réception des messages et statuts
 *
 * Variables d'env requises :
 *   WA_WEBHOOK_VERIFY_TOKEN  → token de vérification (choisi librement, à renseigner
 *                              dans Meta Business Manager > WhatsApp > Configuration)
 *   WA_ACCESS_TOKEN          → token d'accès permanent (pour marquer les messages comme lus)
 *   WA_PHONE_NUMBER_ID       → ID du numéro WhatsApp Business
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac }                from "crypto";

// ── GET — Vérification du webhook ────────────────────────────────────────────
// Meta envoie : ?hub.mode=subscribe&hub.challenge=xxx&hub.verify_token=yyy
// On doit retourner hub.challenge si hub.verify_token est correct.
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get("hub.mode");
  const challenge = searchParams.get("hub.challenge");
  const token     = searchParams.get("hub.verify_token");

  const verifyToken = process.env.WA_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("[Webhook/WhatsApp] WA_WEBHOOK_VERIFY_TOKEN non défini");
    return new NextResponse("Configuration manquante", { status: 500 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook/WhatsApp] Webhook vérifié avec succès");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[Webhook/WhatsApp] Vérification échouée — token invalide");
  return new NextResponse("Token invalide", { status: 403 });
}

// ── POST — Réception des événements ──────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Vérifier la signature Meta (sécurité)
  const appSecret = process.env.META_APP_SECRET;
  if (appSecret) {
    const rawBody  = await req.text();
    const sig      = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

    if (sig !== expected) {
      console.warn("[Webhook/WhatsApp] Signature invalide — requête ignorée");
      return new NextResponse("Signature invalide", { status: 401 });
    }

    // Re-parser le body après lecture du texte brut
    try {
      return await handlePayload(JSON.parse(rawBody));
    } catch {
      return new NextResponse("Payload invalide", { status: 400 });
    }
  }

  // 2. Sans APP_SECRET configuré — parse directement (moins sécurisé, acceptable en dev)
  try {
    const payload = await req.json();
    return await handlePayload(payload);
  } catch {
    return new NextResponse("Payload invalide", { status: 400 });
  }
}

// ── Traitement du payload ─────────────────────────────────────────────────────
async function handlePayload(payload: MetaWebhookPayload): Promise<NextResponse> {
  // Meta envoie toujours 200 dès que le payload est valide
  // (même si on ne traite pas le message, on doit répondre 200)

  if (payload.object !== "whatsapp_business_account") {
    return new NextResponse("OK", { status: 200 });
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;

      // ── Messages entrants ──────────────────────────────────────────────────
      for (const msg of value.messages ?? []) {
        const from = msg.from; // numéro E.164 sans "+"
        const text = msg.type === "text" ? msg.text?.body : null;

        console.log(`[Webhook/WhatsApp] Message reçu de +${from}: "${text ?? `[${msg.type}]`}"`);

        // Gestion de l'opt-out : si l'utilisateur envoie "STOP" ou "ARRÊT"
        if (text && /^(stop|arr[eê]t|unsubscribe|désabonner)$/i.test(text.trim())) {
          await handleOptOut(`+${from}`);
        }
      }

      // ── Statuts de livraison ───────────────────────────────────────────────
      for (const status of value.statuses ?? []) {
        console.log(
          `[Webhook/WhatsApp] Statut message ${status.id}: ${status.status} → +${status.recipient_id}`
        );
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}

// ── Opt-out automatique ───────────────────────────────────────────────────────
async function handleOptOut(phone: string): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma");

    const profile = await prisma.jobSeekerProfile.findFirst({
      where: { phone },
    });

    if (profile) {
      await prisma.jobSeekerProfile.update({
        where: { id: profile.id },
        data:  { whatsappOptIn: false },
      });
      console.log(`[Webhook/WhatsApp] Opt-out enregistré pour ${phone}`);
    }
  } catch (err) {
    console.error("[Webhook/WhatsApp] Erreur opt-out:", err);
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface MetaWebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      field: string;
      value: {
        messages?: {
          id:   string;
          from: string;
          type: string;
          text?: { body: string };
        }[];
        statuses?: {
          id:           string;
          status:       string;
          recipient_id: string;
        }[];
      };
    }[];
  }[];
}
