import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/sms";
import { sendEmail } from "@/lib/email";

interface Job {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  category: string;
  company: { name: string };
}

// ── Templates par défaut ──────────────────────────────────────────────────────
export const DEFAULT_WA_TEMPLATE =
  `Bonjour {{prenom}} 👋\n\n` +
  `Une nouvelle offre pourrait vous intéresser !\n\n` +
  `💼 *{{offre}}*\n` +
  `🏢 {{entreprise}}\n` +
  `📍 {{ville}} · {{type}}\n\n` +
  `👉 Postuler : {{lien}}`;

export const DEFAULT_EMAIL_SUBJECT = `Nouvelle offre pour vous : {{offre}} chez {{entreprise}}`;

export const DEFAULT_EMAIL_TEMPLATE =
  `Bonjour {{prenom}},\n\n` +
  `Une nouvelle offre d'emploi correspond à votre profil :\n\n` +
  `{{offre}} — {{entreprise}}\n` +
  `📍 {{ville}} · {{type}}\n\n` +
  `Cliquez ici pour postuler : {{lien}}`;

// ── Substitue les variables dans un template ─────────────────────────────────
export function applyTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

// ── Récupère les templates depuis la base (ou utilise les défauts) ────────────
async function getTemplates() {
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: ["wa_template", "email_subject_template", "email_body_template"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return {
    waTemplate: map["wa_template"] || DEFAULT_WA_TEMPLATE,
    emailSubject: map["email_subject_template"] || DEFAULT_EMAIL_SUBJECT,
    emailBody: map["email_body_template"] || DEFAULT_EMAIL_TEMPLATE,
  };
}

// ── Envoi principal ───────────────────────────────────────────────────────────
export async function sendJobNotifications(job: Job): Promise<{
  whatsappSent: number;
  emailSent: number;
  whatsappFailed: number;
  emailFailed: number;
}> {
  const siteUrl = process.env.NEXTAUTH_URL || "https://ktzemploi.com";
  const jobUrl = `${siteUrl}/emplois/${job.slug}`;
  const { waTemplate, emailSubject, emailBody } = await getTemplates();

  // Requête depuis User pour inclure TOUS les candidats, même sans profil JobSeeker
  const candidates = await prisma.user.findMany({
    where: { role: "JOBSEEKER", suspended: false },
    select: {
      email: true,
      name: true,
      profile: {
        select: {
          phone: true,
          whatsappOptIn: true,
          notifCategories: true,
        },
      },
    },
  });

  let whatsappSent = 0, whatsappFailed = 0, emailSent = 0, emailFailed = 0;

  for (const candidate of candidates) {
    const profile = candidate.profile;

    // Filtre par secteur si le candidat a configuré des catégories (préférence, pas blocage dur)
    if (profile?.notifCategories) {
      try {
        const cats: string[] = JSON.parse(profile.notifCategories);
        if (cats.length > 0 && !cats.includes(job.category)) continue;
      } catch { /* JSON invalide → on envoie */ }
    }

    // Variables de substitution personnalisées par candidat
    const firstName = candidate.name?.split(" ")[0] ?? "vous";
    const vars = {
      prenom: firstName,
      nom: candidate.name ?? "",
      offre: job.title,
      entreprise: job.company.name,
      ville: job.location,
      type: job.type,
      lien: jobUrl,
    };

    // ── WhatsApp ──
    if (profile?.phone && profile?.whatsappOptIn) {
      const message = applyTemplate(waTemplate, vars);
      const ok = await sendWhatsApp(profile.phone, message);
      ok ? whatsappSent++ : whatsappFailed++;
      // Délai entre envois WhatsApp : 1s sans Account Protection, 6s avec
      await new Promise(r => setTimeout(r, Number(process.env.WA_SEND_DELAY_MS ?? 6000)));
    }

    // ── Email ──
    const subject = applyTemplate(emailSubject, vars);
    const bodyText = applyTemplate(emailBody, vars);
    const emailHtml = textToEmailHtml(bodyText, jobUrl, job.title);

    try {
      if (!candidate.email) { emailFailed++; continue; }
      await sendEmail({ to: candidate.email, subject, html: emailHtml });
      emailSent++;
    } catch {
      emailFailed++;
    }
  }

  console.log(
    `[Notifications] "${job.title}" — ` +
    `WA: ${whatsappSent}✓ ${whatsappFailed}✗ | Email: ${emailSent}✓ ${emailFailed}✗`
  );

  return { whatsappSent, emailSent, whatsappFailed, emailFailed };
}

// ── Convertit un texte en HTML email propre ───────────────────────────────────
function textToEmailHtml(text: string, jobUrl: string, jobTitle: string): string {
  const lines = text
    .split("\n")
    .map((l) => `<p style="margin:0 0 8px;color:#374151;font-size:15px">${l || "&nbsp;"}</p>`)
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#f97316;padding:16px 24px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:18px">🔔 KTZ Emploi — Nouvelle offre</h1>
      </div>
      <div style="background:white;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">
        ${lines}
        <div style="margin-top:24px">
          <a href="${jobUrl}"
            style="display:inline-block;background:#f97316;color:white;padding:12px 28px;
                   border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
            Voir l'offre et postuler →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:24px 0 0">
          Vous recevez cet email car vous êtes inscrit sur KTZ Emploi.<br>
          <a href="${process.env.NEXTAUTH_URL ?? ""}/tableau-de-bord/profil"
             style="color:#f97316">Gérer mes préférences</a>
        </p>
      </div>
    </div>`;
}
