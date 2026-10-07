import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/rank-applications
// Body: { jobId: string }  (optionnel — si absent, analyse toutes les candidatures de l'entreprise)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const role   = (session.user as { role?: string }).role;

  if (role !== "EMPLOYER") {
    return NextResponse.json({ error: "Réservé aux recruteurs" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) {
    return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  }

  const { jobId } = await req.json().catch(() => ({}));

  // Récupère les candidatures (filtre par poste si fourni)
  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId: company.id,
        // Si pas de jobId spécifique, n'analyser que les offres avec classement IA activé
        ...(jobId ? {} : { aiRankingEnabled: true }),
      },
      archived: false,
      ...(jobId ? { jobId } : {}),
    },
    include: {
      job: {
        select: { title: true, description: true, requirements: true, category: true, experienceLevel: true },
      },
      user: {
        select: {
          name: true,
          profile: {
            select: { title: true, bio: true, skills: true, experience: true, education: true },
          },
        },
      },
    },
  });

  if (applications.length === 0) {
    return NextResponse.json({ scored: 0, results: [] });
  }

  // Analyse chaque candidature avec Claude
  const results: Array<{ id: string; aiScore: number; aiSummary: string }> = [];

  for (const app of applications) {
    const job = app.job;
    const profile = app.user.profile;

    const prompt = `Tu es un assistant RH expert. Analyse cette candidature et attribue un score de compatibilité.

POSTE RECHERCHÉ :
- Titre : ${job.title}
- Catégorie : ${job.category ?? "Non précisée"}
- Niveau d'expérience requis : ${job.experienceLevel ?? "Non précisé"}
- Description : ${job.description?.slice(0, 600) ?? "Non fournie"}
- Exigences : ${job.requirements?.slice(0, 400) ?? "Non fournies"}

PROFIL DU CANDIDAT :
- Nom : ${app.user.name ?? "Anonyme"}
- Titre professionnel : ${profile?.title ?? "Non renseigné"}
- Compétences : ${profile?.skills ?? "Non renseignées"}
- Expérience : ${profile?.experience ?? "Non renseignée"}
- Formation : ${profile?.education ?? "Non renseignée"}
- Biographie : ${profile?.bio?.slice(0, 300) ?? "Non renseignée"}

LETTRE DE MOTIVATION :
${app.coverLetter?.slice(0, 800) ?? "Aucune lettre de motivation fournie"}

INSTRUCTIONS :
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte avant ou après), avec exactement ces deux champs :
{
  "score": <entier entre 0 et 100>,
  "summary": "<explication concise en 1-2 phrases en français : points forts et points faibles du candidat par rapport au poste>"
}

Le score doit refléter objectivement la compatibilité :
- 80-100 : excellent profil, très bien adapté
- 60-79 : bon profil, quelques lacunes mineures
- 40-59 : profil moyen, lacunes notables
- 20-39 : profil faible, peu adapté
- 0-19 : profil non adapté ou informations insuffisantes`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (message.content[0] as { text: string }).text.trim();

      // Parse le JSON retourné par Claude
      const parsed = JSON.parse(text);
      const score: number = Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0)));
      const summary: string = String(parsed.summary || "").slice(0, 300);

      // Sauvegarde en DB
      await prisma.application.update({
        where: { id: app.id },
        data: { aiScore: score, aiSummary: summary },
      });

      results.push({ id: app.id, aiScore: score, aiSummary: summary });
    } catch {
      // En cas d'erreur sur une candidature, on continue les autres
      results.push({ id: app.id, aiScore: 0, aiSummary: "Analyse indisponible." });
    }
  }

  return NextResponse.json({ scored: results.length, results });
}
