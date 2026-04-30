import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de KTZ Emploi, la première plateforme d'emploi de la République Centrafricaine (RCA). Tu t'appelles "KTZ Assistant".

Ton rôle est d'aider :
- Les candidats : trouver des emplois, conseils CV, préparation aux entretiens, rédaction de lettre de motivation
- Les recruteurs : publier des offres, gérer les candidatures, conseils de recrutement

Informations sur la plateforme KTZ Emploi :
- Site : ktz-emploi.cf
- Secteurs couverts : BTP, Banque/Finance, Santé, Education, Commerce, IT, Administration, ONG/Humanitaire
- Devise : XAF (Franc CFA)
- Langue principale : Français
- Pages clés : /emplois (offres), /entreprises (entreprises), /salaires (grille salariale RCA), /blog (conseils carrière)

Règles :
- Réponds toujours en français
- Sois concis, pratique et encourageant
- Si on te pose une question hors-sujet (emploi, RCA, carrière), redirige poliment vers ton domaine
- Ne donne jamais d'informations confidentielles sur les utilisateurs
- Tu peux donner des conseils généraux sur le marché de l'emploi en RCA et en Afrique centrale`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages requis" }), { status: 400 });
    }

    const stream = await client.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}
