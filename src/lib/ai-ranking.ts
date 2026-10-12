// Classement IA des candidatures (score de compatibilité 0-100 + résumé)
// Utilisé par : création de candidature (analyse auto) et bouton « Analyser » du recruteur.
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

// Seuil à partir duquel une candidature est considérée « correspondant au poste »
export const AI_MATCH_THRESHOLD = 60;

const MAX_CV_BYTES = 5 * 1024 * 1024;

type DocBlock = {
  type: "document";
  source: { type: "base64"; media_type: "application/pdf"; data: string };
  title?: string;
};

const MAX_CV_TEXT_CHARS = 15000;

function isPdf(type: string, url: string, buf: Buffer) {
  return type.includes("pdf") || url.endsWith(".pdf") || buf.subarray(0, 5).toString() === "%PDF-";
}

// .docx = archive ZIP (« PK »), .doc = document OLE (D0 CF 11 E0)
function isWord(type: string, url: string, buf: Buffer) {
  return (
    type.includes("word") || type.includes("officedocument") || type.includes("msword") ||
    url.endsWith(".docx") || url.endsWith(".doc") ||
    buf.subarray(0, 2).toString() === "PK" ||
    buf.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0]))
  );
}

// Extrait le texte d'un CV Word (.docx et ancien .doc)
async function extractWordText(buf: Buffer): Promise<string | null> {
  try {
    const { default: WordExtractor } = await import("word-extractor");
    const doc = await new WordExtractor().extract(buf);
    const parts = [doc.getHeaders?.({ includeFooters: true }), doc.getBody(), doc.getTextboxes?.({ includeHeadersAndFooters: false })];
    const text = parts.filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return text.length > 0 ? text.slice(0, MAX_CV_TEXT_CHARS) : null;
  } catch (err) {
    console.error("[AI ranking] Extraction Word échouée", err);
    return null;
  }
}

// Télécharge le CV : PDF → envoyé tel quel à Claude ; Word → texte extrait
async function loadCv(url: string | null | undefined): Promise<{ block: DocBlock | null; text: string | null; note: string }> {
  if (!url) return { block: null, text: null, note: "Aucun CV joint." };
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { block: null, text: null, note: "CV joint inaccessible." };
    const type = res.headers.get("content-type") ?? "";
    const cleanUrl = url.toLowerCase().split("?")[0];
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_CV_BYTES) return { block: null, text: null, note: "CV joint trop volumineux (non lu)." };

    if (isPdf(type, cleanUrl, buf)) {
      return {
        block: {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: buf.toString("base64") },
          title: "CV du candidat",
        },
        text: null,
        note: "Le CV du candidat est fourni en pièce jointe (PDF) : c'est la source principale.",
      };
    }

    if (isWord(type, cleanUrl, buf)) {
      const text = await extractWordText(buf);
      if (text) {
        return {
          block: null,
          text,
          note: "Le texte du CV du candidat (fichier Word) est fourni ci-dessous : c'est la source principale.",
        };
      }
      return { block: null, text: null, note: "CV Word illisible : se baser sur le profil." };
    }

    return { block: null, text: null, note: "Format de CV non reconnu : se baser sur le profil." };
  } catch {
    return { block: null, text: null, note: "CV joint inaccessible." };
  }
}

// Extrait l'objet JSON de la réponse, même entouré de ```json … ``` ou de texte
function parseAiJson(text: string): { score: number; summary: string } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    const n = Number(parsed.score);
    if (!Number.isFinite(n)) return null;
    return {
      score: Math.min(100, Math.max(0, Math.round(n))),
      summary: String(parsed.summary ?? "").slice(0, 400),
    };
  } catch {
    return null;
  }
}

/**
 * Analyse une candidature et enregistre aiScore / aiSummary.
 * En cas d'échec, rien n'est écrit (la candidature reste « non analysée ») et null est renvoyé.
 */
export async function scoreApplication(applicationId: string): Promise<{ id: string; aiScore: number; aiSummary: string } | null> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[AI ranking] ANTHROPIC_API_KEY manquant");
    return null;
  }

  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        select: { title: true, description: true, requirements: true, category: true, experienceLevel: true },
      },
      user: {
        select: {
          name: true,
          profile: { select: { title: true, bio: true, skills: true, experience: true, education: true, cv: true } },
        },
      },
    },
  });
  if (!app) return null;

  const job = app.job;
  const profile = app.user.profile;
  const { block: cvBlock, text: cvText, note: cvNote } = await loadCv(app.cvUrl ?? profile?.cv);

  const prompt = `Tu es un assistant RH expert. Analyse cette candidature et attribue un score de compatibilité avec le poste.

POSTE RECHERCHÉ :
- Titre : ${job.title}
- Catégorie : ${job.category ?? "Non précisée"}
- Niveau d'expérience requis : ${job.experienceLevel ?? "Non précisé"}
- Description : ${job.description?.slice(0, 1500) ?? "Non fournie"}
- Exigences : ${job.requirements?.slice(0, 1000) ?? "Non fournies"}

CV : ${cvNote}
${cvText ? `\n--- DÉBUT DU CV ---\n${cvText}\n--- FIN DU CV ---\n` : ""}
PROFIL SAISI SUR LE SITE :
- Titre professionnel : ${profile?.title ?? "Non renseigné"}
- Compétences : ${profile?.skills ?? "Non renseignées"}
- Expérience : ${profile?.experience?.slice(0, 1500) ?? "Non renseignée"}
- Formation : ${profile?.education?.slice(0, 800) ?? "Non renseignée"}
- Biographie : ${profile?.bio?.slice(0, 400) ?? "Non renseignée"}

LETTRE DE MOTIVATION :
${app.coverLetter?.slice(0, 1500) ?? "Aucune lettre de motivation fournie"}

Barème :
- 80-100 : excellent profil, très bien adapté
- 60-79 : bon profil, quelques lacunes mineures
- 40-59 : profil moyen, lacunes notables
- 20-39 : profil faible, peu adapté
- 0-19 : profil non adapté ou informations insuffisantes

Réponds UNIQUEMENT avec un objet JSON (sans markdown) :
{"score": <entier 0-100>, "summary": "<1-2 phrases en français : points forts et points faibles par rapport au poste>"}`;

  const content: Anthropic.Messages.ContentBlockParam[] = cvBlock
    ? [cvBlock as Anthropic.Messages.ContentBlockParam, { type: "text", text: prompt }]
    : [{ type: "text", text: prompt }];

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 400,
        messages: [{ role: "user", content }],
      });
      const text = message.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      const parsed = parseAiJson(text);
      if (!parsed) {
        console.error("[AI ranking] Réponse illisible pour", applicationId, text.slice(0, 200));
        continue;
      }
      await prisma.application.update({
        where: { id: applicationId },
        data: { aiScore: parsed.score, aiSummary: parsed.summary },
      });
      return { id: applicationId, aiScore: parsed.score, aiSummary: parsed.summary };
    } catch (err) {
      console.error(`[AI ranking] Erreur (essai ${attempt}) pour`, applicationId, err);
    }
  }
  return null;
}

/** Analyse plusieurs candidatures en parallèle limité. */
export async function scoreApplications(ids: string[], concurrency = 4) {
  const results: Array<{ id: string; aiScore: number; aiSummary: string }> = [];
  const failed: string[] = [];
  let i = 0;
  async function worker() {
    while (i < ids.length) {
      const id = ids[i++];
      const r = await scoreApplication(id);
      if (r) results.push(r);
      else failed.push(id);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
  return { results, failed };
}
