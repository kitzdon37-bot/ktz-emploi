import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { fallbackAnswer } from "@/lib/chat-fallback";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es KTZ Assistant, l'assistant virtuel de KTZ Emploi — la première plateforme d'emploi de la République Centrafricaine (RCA).

Tu parles comme un conseiller humain, chaleureux et professionnel. Tu aides :
- Les candidats : trouver des emplois, améliorer leur CV, se préparer aux entretiens, rédiger une lettre de motivation
- Les recruteurs : publier des offres, gérer les candidatures, attirer les bons profils

Contexte de la plateforme KTZ Emploi :
- Site : ktzemploi.com
- Secteurs couverts : BTP, Banque/Finance, Santé, Éducation, Commerce, IT, Administration, ONG/Humanitaire, Télécommunications, Énergie
- Devise locale : XAF (Franc CFA BEAC)
- Pages utiles : /emplois (toutes les offres), /entreprises (profils entreprises), /salaires (grilles de salaires RCA), /inscription (créer un compte), /connexion (se connecter)
- Plans recruteur : Gratuit, Micro (10 000 XAF/mois), Starter (70 000 XAF/mois), Pro (100 000 XAF/mois) — détails sur /tarifs
- Offre spéciale : publication des offres gratuite jusqu'à fin novembre 2026
- Paiement : Orange Money et Airtel Money
- Délai de réponse : les recruteurs ont 10 jours pour répondre à chaque candidature
- L'app mobile Android est en cours de développement

Règles de style — TRÈS IMPORTANT :
- N'utilise JAMAIS de titres markdown (pas de #, ##, ###, ####)
- N'utilise pas de ** gras ** sauf pour un mot vraiment important
- Structure tes réponses avec des sauts de ligne et des tirets simples (-)
- Écris comme dans un SMS ou un message WhatsApp : naturel, direct, sans jargon
- Sois bref : 3 à 6 lignes maximum sauf si on te demande un conseil détaillé
- Commence toujours par répondre directement à la question, sans introduction inutile
- Utilise des émojis avec parcimonie (1 ou 2 maximum par message) pour rendre le ton chaleureux
- Si quelqu'un semble découragé, sois encourageant et positif
- Réponds toujours en français
- Si la question ne concerne pas l'emploi ou KTZ Emploi, redirige gentiment`;

// Traduit une erreur de l'API Anthropic en cause lisible (pour les logs)
function describeAiError(err: unknown) {
  const e = err as { status?: number; error?: { error?: { type?: string; message?: string } }; message?: string };
  const status = e?.status;
  const type = e?.error?.error?.type;
  const message = e?.error?.error?.message ?? e?.message ?? String(err);
  let cause = "erreur inconnue";
  if (status === 401) cause = "clé ANTHROPIC_API_KEY invalide ou révoquée";
  else if (status === 400 && /credit|billing/i.test(message)) cause = "crédit Anthropic épuisé";
  else if (status === 403) cause = "accès refusé par Anthropic";
  else if (status === 404) cause = "modèle introuvable";
  else if (status === 429) cause = "limite de requêtes Anthropic atteinte";
  else if (status === 529 || status === 503) cause = "service Anthropic surchargé";
  return { status, type, message, cause };
}

// Après une erreur durable (crédit épuisé, clé invalide), on évite de rappeler l'IA
// pendant quelques minutes : le visiteur reçoit directement la réponse de secours.
let aiDisabledUntil = 0;
const AI_COOLDOWN_MS = 5 * 60 * 1000;

const encoder = new TextEncoder();
const sse = (payload: object) => encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
const SSE_HEADERS = { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" };

// Envoie une réponse préparée au format du flux (le widget l'affiche comme une réponse normale)
function fallbackResponse(lastUserMessage: string) {
  const text = fallbackAnswer(lastUserMessage);
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(sse({ text }));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    }),
    { headers: SSE_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  let messages: Array<{ role: string; content: string }>;
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Requête invalide" }), { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages requis" }), { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[Chat] ANTHROPIC_API_KEY manquant — réponses de secours");
    return fallbackResponse(lastUser);
  }
  if (Date.now() < aiDisabledUntil) return fallbackResponse(lastUser);

  // L'API exige des messages non vides qui alternent user/assistant (on retire les réponses d'erreur vides)
  const cleaned = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: cleaned,
  });

  const readable = new ReadableStream({
    async start(controller) {
      let sentText = false;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            sentText = true;
            controller.enqueue(sse({ text: event.delta.text }));
          }
        }
      } catch (err) {
        const info = describeAiError(err);
        console.error("[Chat] Erreur Anthropic — réponse de secours :", info);
        if (info.status === 401 || info.status === 403 || (info.status === 400 && /credit|billing/i.test(info.message))) {
          aiDisabledUntil = Date.now() + AI_COOLDOWN_MS;
        }
        // Rien encore affiché → réponse de secours ; sinon on signale l'interruption
        controller.enqueue(sentText ? sse({ error: true }) : sse({ text: fallbackAnswer(lastUser) }));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, { headers: SSE_HEADERS });
}
