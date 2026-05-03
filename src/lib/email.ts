import { Resend } from "resend";
import nodemailer from "nodemailer";

// ─── Envoi d'email : Resend (priorité) ou SMTP Gmail (fallback) ──────────────

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  // 1. Mode Resend (API key définie)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.EMAIL_FROM || "KTZ Emploi <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return;
  }

  // 2. Mode SMTP Gmail (SMTP_USER + SMTP_PASS définis)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"KTZ Emploi" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return;
  }

  // 3. Mode développement : log dans la console
  console.log("\n📧 [EMAIL PREVIEW - configurez RESEND_API_KEY pour envoyer] ─────");
  console.log(`À      : ${to}`);
  console.log(`Objet  : ${subject}`);
  console.log("──────────────────────────────────────────────────────────────────\n");
}

// ─── Helpers email ───────────────────────────────────────────────────────────

/**
 * Résout l'URL d'un logo pour les emails.
 * - Chemins locaux (/logos/...) → inaccessibles depuis les clients email en dev → null
 * - SVG externe → non supporté par Gmail → null
 * - JPG/PNG/WEBP externe → OK
 */
function resolveLogoForEmail(logo: string | null | undefined, baseUrl: string): string | null {
  if (!logo) return null;

  // Chemin local : uniquement accessible si l'app est déployée sur un vrai domaine
  if (logo.startsWith("/")) {
    const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    if (isLocalhost) return null; // Inaccessible depuis les clients email
    // En production, on encode en absolu mais on filtre les SVG
    const fullUrl = `${baseUrl}${logo}`;
    return fullUrl.endsWith(".svg") ? null : fullUrl;
  }

  // URL externe SVG non convertie → non supportée par Gmail
  if (logo.toLowerCase().endsWith(".svg") && !logo.includes("px-")) return null;

  return logo;
}

/**
 * Génère le bloc HTML logo (image ou initiale colorée).
 */
function logoBlock(logo: string | null | undefined, companyName: string, baseUrl: string): string {
  const src = resolveLogoForEmail(logo, baseUrl);
  const initial = companyName.charAt(0).toUpperCase();

  if (src) {
    return `<img src="${src}" alt="${companyName}" width="44" height="44"
      style="width:44px;height:44px;object-fit:contain;border-radius:10px;border:1px solid #e5e7eb;background:#ffffff;display:block;" />`;
  }

  // Fallback : initiale avec fond orange
  return `<div style="width:44px;height:44px;border-radius:10px;background:#fff7ed;border:2px solid #fed7aa;
    display:flex;align-items:center;justify-content:center;
    font-weight:800;font-size:18px;color:#f97316;text-align:center;line-height:44px;">
    ${initial}
  </div>`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JobMatch {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  company: { name: string; logo?: string | null };
  salaryMin?: number | null;
  salaryMax?: number | null;
}

export interface CandidateEmail {
  name: string;
  email: string;
  jobs: JobMatch[];
}

// ─── Email : offres correspondant au profil ──────────────────────────────────

export async function sendJobMatchEmail(
  candidate: CandidateEmail
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const jobRows = candidate.jobs
    .map((job) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="52" valign="top" style="padding-right:12px;">
              ${logoBlock(job.company.logo, job.company.name, baseUrl)}
            </td>
            <td valign="top">
              <div style="font-weight:700;color:#111827;font-size:15px;">${job.title}</div>
              <div style="color:#6b7280;font-size:13px;margin-top:2px;">
                <strong style="color:#374151;">${job.company.name}</strong>
                &nbsp;·&nbsp; ${job.location} &nbsp;·&nbsp; ${job.type}
              </div>
              <a href="${baseUrl}/emplois/${job.slug}"
                 style="display:inline-block;margin-top:8px;background:#f97316;color:white;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
                Voir l'offre →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`)
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:14px;">La plateforme d'emploi de la RCA</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">👋 Bonjour ${candidate.name.split(" ")[0]} !</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
            Nous avons sélectionné <strong>${candidate.jobs.length} offre(s)</strong> qui correspondent à votre profil sur KTZ Emploi.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
          <div style="margin-top:28px;text-align:center;">
            <a href="${baseUrl}/emplois"
               style="display:inline-block;background:#111827;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir toutes les offres
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            <a href="${baseUrl}/tableau-de-bord/parametres" style="color:#9ca3af;">Se désabonner</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      to: candidate.email,
      subject: `${candidate.jobs.length} offre(s) correspondent à votre profil 🎯`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Email : notification de statut (personnalisable) ───────────────────────

const STATUS_DEFAULTS: Record<string, { subject: string; title: string; intro: string; badge: string }> = {
  PENDING: {
    subject: `Votre candidature pour "{jobTitle}" a bien été reçue — {companyName}`,
    title: "✅ Candidature bien reçue !",
    intro: "Nous avons bien reçu votre candidature et allons l'étudier prochainement.",
    badge: "#fef3c7|#92400e",
  },
  REVIEWING: {
    subject: `Votre candidature pour "{jobTitle}" est en cours d'examen — {companyName}`,
    title: "🔍 Candidature en cours d'examen",
    intro: "Bonne nouvelle ! Votre candidature est actuellement examinée par notre équipe.",
    badge: "#dbeafe|#1e40af",
  },
  INTERVIEW: {
    subject: `Invitation à un entretien pour le poste "{jobTitle}" — {companyName}`,
    title: "🎉 Invitation à un entretien !",
    intro: "Nous avons le plaisir de vous convier à un entretien pour le poste ci-dessous.",
    badge: "#f3e8ff|#6b21a8",
  },
  ACCEPTED: {
    subject: `Félicitations ! Votre candidature pour "{jobTitle}" a été acceptée — {companyName}`,
    title: "🎊 Candidature acceptée !",
    intro: "Toutes nos félicitations ! Votre candidature a été sélectionnée.",
    badge: "#dcfce7|#166534",
  },
  REJECTED: {
    subject: `Réponse à votre candidature pour "{jobTitle}" — {companyName}`,
    title: "📋 Réponse à votre candidature",
    intro: "Après examen attentif, nous ne donnons pas suite à votre candidature. Nous vous remercions de l'intérêt porté à notre entreprise.",
    badge: "#fee2e2|#991b1b",
  },
};

export async function sendStatusNotificationEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  status,
  customSubject,
  customMessage,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  status: string;
  customSubject?: string;
  customMessage?: string;
}): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const defaults = STATUS_DEFAULTS[status] ?? STATUS_DEFAULTS["PENDING"];
  const [badgeBg, badgeText] = defaults.badge.split("|");

  const resolvedSubject = (customSubject || defaults.subject)
    .replace("{jobTitle}", jobTitle)
    .replace("{companyName}", companyName);

  const customMessageBlock = customMessage
    ? `<div style="background:#f8fafc;border-left:4px solid #f97316;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${customMessage}</p>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${defaults.title}</h1>
          <p style="color:#374151;margin:0 0 8px;font-size:15px;line-height:1.7;">
            Bonjour <strong>${candidateName.split(" ")[0]}</strong>,
          </p>
          <p style="color:#374151;margin:0 0 16px;font-size:15px;line-height:1.7;">${defaults.intro}</p>
          ${customMessageBlock}
          <div style="background:${badgeBg};border-radius:12px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0 0 6px;font-size:12px;color:${badgeText};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              📌 Poste : <strong>${jobTitle}</strong><br>
              🏢 Entreprise : <strong>${companyName}</strong>
            </p>
          </div>
          <div style="text-align:center;margin-top:24px;">
            <a href="${baseUrl}/tableau-de-bord/candidatures"
               style="display:inline-block;background:#f97316;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Suivre mes candidatures
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Cet email a été envoyé automatiquement via KTZ Emploi.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({ to: candidateEmail, subject: resolvedSubject, html });
    return { success: true };
  } catch (err) {
    console.error("Erreur envoi email statut:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Email : accusé de réception de candidature ─────────────────────────────

export async function sendApplicationAcknowledgementEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
}: {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
}): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">✅ Candidature bien reçue !</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.7;">
            Bonjour <strong>${candidateName.split(" ")[0]}</strong>,
          </p>
          <p style="color:#374151;margin:0 0 16px;font-size:15px;line-height:1.7;">
            Nous avons bien reçu votre candidature pour le poste de
            <strong style="color:#111827;">${jobTitle}</strong>
            chez <strong style="color:#111827;">${companyName}</strong>.
          </p>
          <p style="color:#374151;margin:0 0 24px;font-size:15px;line-height:1.7;">
            Notre équipe va l'étudier attentivement et reviendra vers vous très prochainement.
            Merci de l'intérêt que vous portez à notre entreprise.
          </p>

          <!-- Encadré récap -->
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:13px;color:#9a3412;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Récapitulatif</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              📌 Poste : <strong>${jobTitle}</strong><br>
              🏢 Entreprise : <strong>${companyName}</strong>
            </p>
          </div>

          <div style="text-align:center;">
            <a href="${baseUrl}/tableau-de-bord/candidatures"
               style="display:inline-block;background:#f97316;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Suivre mes candidatures
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      to: candidateEmail,
      subject: `Votre candidature pour "${jobTitle}" a bien été reçue — ${companyName}`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("Erreur envoi email accusé:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Email : notification au recruteur — nouvelle candidature ───────────────

export async function sendNewApplicationNotificationEmail({
  recruiterName,
  recruiterEmail,
  candidateName,
  jobTitle,
  applicationsUrl,
}: {
  recruiterName: string;
  recruiterEmail: string;
  candidateName: string;
  jobTitle: string;
  applicationsUrl: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">📩 Nouvelle candidature reçue !</h1>
          <p style="color:#374151;margin:0 0 8px;font-size:15px;line-height:1.7;">
            Bonjour <strong>${recruiterName.split(" ")[0]}</strong>,
          </p>
          <p style="color:#374151;margin:0 0 24px;font-size:15px;line-height:1.7;">
            Un candidat vient de postuler à l'une de vos offres sur <strong>KTZ Emploi</strong>.
          </p>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Détails</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
              👤 Candidat : <strong>${candidateName}</strong><br>
              📌 Poste : <strong>${jobTitle}</strong>
            </p>
          </div>
          <div style="text-align:center;">
            <a href="${applicationsUrl}"
               style="display:inline-block;background:#f97316;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir la candidature →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Cet email a été envoyé automatiquement via KTZ Emploi.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      to: recruiterEmail,
      subject: `Nouvelle candidature pour "${jobTitle}" — ${candidateName}`,
      html,
    });
  } catch (err) {
    console.error("Erreur envoi email recruteur:", err);
  }
}

// ─── Email : bienvenue newsletter ───────────────────────────────────────────

export interface RecentJob {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  company: { name: string };
}

export async function sendNewsletterWelcomeEmail({
  to,
  name,
  frequency,
  unsubscribeToken,
  recentJobs = [],
}: {
  to: string;
  name?: string | null;
  frequency: "weekly" | "monthly";
  unsubscribeToken: string;
  recentJobs?: RecentJob[];
}): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const prenom = name ? name.split(" ")[0] : null;
  const greeting = prenom ? `Bienvenue, ${prenom} !` : "Bienvenue !";
  const freqLabel = frequency === "weekly" ? "chaque semaine" : "chaque mois";

  const jobsSection = recentJobs.length > 0 ? `
    <tr><td style="padding:0 32px 32px;">
      <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#9a3412;text-transform:uppercase;letter-spacing:0.5px;">
        🔥 Offres récemment publiées
      </p>
      ${recentJobs.map(job => `
        <a href="${baseUrl}/emplois/${job.slug}" style="display:block;text-decoration:none;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:10px;background:#fff;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#111827;">${job.title}</p>
          <p style="margin:0;font-size:13px;color:#6b7280;">${job.company.name} · ${job.location} · <span style="background:#fff7ed;color:#f97316;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:600;">${job.type}</span></p>
        </a>`).join("")}
      <div style="text-align:center;margin-top:20px;">
        <a href="${baseUrl}/emplois" style="display:inline-block;background:#f97316;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
          Voir toutes les offres →
        </a>
      </div>
    </td></tr>` : `
    <tr><td style="padding:0 32px 32px;text-align:center;">
      <a href="${baseUrl}/emplois" style="display:inline-block;background:#f97316;color:white;padding:13px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
        Voir les offres d'emploi →
      </a>
    </td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;">
          <div style="margin-bottom:14px;">
            <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
            <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          </div>
          <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">Abonnement confirmé !</h1>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">La plateforme d'emploi de la République Centrafricaine</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 12px;font-size:20px;color:#111827;font-weight:700;">${greeting}</p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">
            Merci de rejoindre la communauté <strong>KTZ Emploi</strong>. Vous recevrez désormais les meilleures offres d'emploi en République Centrafricaine <strong>${freqLabel}</strong>.
          </p>

          <!-- Récap abonnement -->
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0 0 8px;font-size:11px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Votre abonnement</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
              📧 <strong>${to}</strong><br>
              📅 Fréquence : <strong>${frequency === "weekly" ? "Hebdomadaire" : "Mensuelle"}</strong>
            </p>
          </div>
        </td></tr>

        <!-- Offres récentes -->
        ${jobsSection}

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Vous ne souhaitez plus recevoir nos emails ?
            <a href="${unsubscribeUrl}" style="color:#f97316;text-decoration:underline;">Se désabonner</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to,
    subject: prenom
      ? `${prenom}, votre abonnement à KTZ Emploi est confirmé !`
      : "Bienvenue ! Votre abonnement à KTZ Emploi est confirmé",
    html,
  });
}

// ─── Email : newsletter manuelle ────────────────────────────────────────────

export async function sendNewsletterEmail({
  to,
  name,
  subject,
  content,
  unsubscribeToken,
}: {
  to: string;
  name?: string | null;
  subject: string;
  content: string;
  unsubscribeToken: string;
}): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const prenom = name ? name.split(" ")[0] : null;
  const greeting = prenom ? `Bonjour ${prenom} !` : "Bonjour !";

  // Remplacement des variables de personnalisation
  const personalizedContent = content
    .replace(/\[PRENOM\]/gi, prenom ?? "")
    .replace(/\[NOM\]/gi, name ?? "")
    .replace(/\[EMAIL\]/gi, to);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="580" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:13px;">La plateforme d'emploi de la RCA</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${greeting}</h1>
          <div style="color:#374151;font-size:15px;line-height:1.8;white-space:pre-wrap;">${personalizedContent}</div>
          <div style="margin-top:32px;text-align:center;">
            <a href="${baseUrl}/emplois"
               style="display:inline-block;background:#f97316;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir toutes les offres →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
            <a href="${unsubscribeUrl}" style="color:#f97316;text-decoration:underline;">Se désabonner</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({ to, subject, html });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Email : newsletter automatique (nouvelles offres) ───────────────────────

export async function sendAutoNewsletterEmail({
  to,
  name,
  jobs,
  unsubscribeToken,
  period,
}: {
  to: string;
  name?: string | null;
  jobs: JobMatch[];
  unsubscribeToken: string;
  period: "weekly" | "monthly";
}): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  const greeting = name ? `Bonjour ${name.split(" ")[0]} !` : "Bonjour !";
  const periodLabel = period === "weekly" ? "cette semaine" : "ce mois-ci";

  const jobRows = jobs
    .map((job) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="52" valign="top" style="padding-right:12px;">
              ${logoBlock(job.company.logo, job.company.name, baseUrl)}
            </td>
            <td valign="top">
              <div style="font-weight:700;color:#111827;font-size:15px;">${job.title}</div>
              <div style="color:#6b7280;font-size:13px;margin-top:2px;">
                <strong style="color:#374151;">${job.company.name}</strong>
                &nbsp;·&nbsp; ${job.location} &nbsp;·&nbsp; ${job.type}
              </div>
              ${job.salaryMin ? `<div style="color:#f97316;font-size:13px;margin-top:3px;font-weight:600;">${job.salaryMin.toLocaleString("fr-FR")} XAF${job.salaryMax ? ` – ${job.salaryMax.toLocaleString("fr-FR")} XAF` : ""}</div>` : ""}
              <a href="${baseUrl}/emplois/${job.slug}"
                 style="display:inline-block;margin-top:8px;background:#f97316;color:white;padding:6px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">
                Voir l'offre →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="580" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:13px;">Les meilleures offres ${periodLabel}</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">${greeting}</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
            Voici les <strong>${jobs.length} nouvelle(s) offre(s)</strong> publiées ${periodLabel} sur KTZ Emploi.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
          <div style="margin-top:28px;text-align:center;">
            <a href="${baseUrl}/emplois"
               style="display:inline-block;background:#111827;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir toutes les offres
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Vous recevez cet email car vous êtes abonné à notre newsletter.<br>
            <a href="${unsubscribeUrl}" style="color:#f97316;text-decoration:underline;">Se désabonner</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await sendEmail({
      to,
      subject: `${jobs.length} nouvelle(s) offre(s) d'emploi ${periodLabel} — KTZ Emploi`,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Email : bienvenue à l'inscription ──────────────────────────────────────

export async function sendWelcomeEmail({
  name,
  email,
  role,
  companyName,
}: {
  name: string;
  email: string;
  role: "JOBSEEKER" | "EMPLOYER";
  companyName?: string | null;
}): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const prenom = name.split(" ")[0];

  const isEmployer = role === "EMPLOYER";

  const html = isEmployer ? `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;">
          <div style="margin-bottom:14px;">
            <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
            <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          </div>
          <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">Bienvenue, ${prenom} ! 🎉</h1>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">La plateforme de recrutement de la République Centrafricaine</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
            Votre compte recruteur${companyName ? ` pour <strong>${companyName}</strong>` : ""} vient d'être créé sur <strong>KTZ Emploi</strong>.
            Vous avez maintenant accès à la plus grande plateforme d'emploi de Centrafrique.
          </p>

          <!-- Étapes pour commencer -->
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Pour bien démarrer</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="padding:6px 0;">
                <span style="display:inline-block;background:#f97316;color:white;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;margin-right:10px;">1</span>
                <span style="font-size:14px;color:#374151;">Complétez le profil de votre entreprise</span>
              </td></tr>
              <tr><td style="padding:6px 0;">
                <span style="display:inline-block;background:#f97316;color:white;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;margin-right:10px;">2</span>
                <span style="font-size:14px;color:#374151;">Publiez votre première offre d'emploi</span>
              </td></tr>
              <tr><td style="padding:6px 0;">
                <span style="display:inline-block;background:#f97316;color:white;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;margin-right:10px;">3</span>
                <span style="font-size:14px;color:#374151;">Explorez la CVthèque et contactez des candidats</span>
              </td></tr>
            </table>
          </div>

          <div style="text-align:center;">
            <a href="${baseUrl}/tableau-de-bord/publier"
               style="display:inline-block;background:#f97316;color:white;padding:13px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
              Publier une offre maintenant →
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Des questions ? Répondez à cet email, nous sommes là pour vous aider.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>` : `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:32px;">
          <div style="margin-bottom:14px;">
            <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
            <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          </div>
          <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">Bienvenue, ${prenom} ! 🎉</h1>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px;">La plateforme d'emploi de la République Centrafricaine</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
            Votre compte <strong>KTZ Emploi</strong> est créé. Vous faites maintenant partie de la communauté de candidats centrafricains qui trouvent leur emploi en ligne.
          </p>

          <!-- Ce que vous pouvez faire -->
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Ce que vous pouvez faire</p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;">
                ✅ &nbsp;Postuler aux offres d'emploi en un clic
              </td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;">
                ✅ &nbsp;Rendre votre CV visible aux recruteurs
              </td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;">
                ✅ &nbsp;Recevoir des alertes pour les offres qui vous correspondent
              </td></tr>
              <tr><td style="padding:6px 0;font-size:14px;color:#374151;">
                ✅ &nbsp;Être contacté directement par les entreprises
              </td></tr>
            </table>
          </div>

          <!-- Conseil -->
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0;font-size:14px;color:#166534;line-height:1.7;">
              💡 <strong>Conseil :</strong> Complétez votre profil à 100% pour multiplier vos chances d'être contacté par les recruteurs. Ajoutez votre photo, vos compétences et votre CV.
            </p>
          </div>

          <div style="text-align:center;">
            <a href="${baseUrl}/emplois"
               style="display:inline-block;background:#f97316;color:white;padding:13px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;margin-right:10px;">
              Voir les offres d'emploi →
            </a>
          </div>
          <div style="text-align:center;margin-top:12px;">
            <a href="${baseUrl}/tableau-de-bord/profil"
               style="display:inline-block;color:#f97316;padding:10px 24px;border-radius:50px;text-decoration:none;font-weight:600;font-size:13px;border:1px solid #fed7aa;">
              Compléter mon profil
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Des questions ? Répondez à cet email, nous sommes là pour vous aider.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subject = isEmployer
    ? `Bienvenue sur KTZ Emploi${companyName ? `, ${companyName}` : ""} ! Publiez votre première offre`
    : `Bienvenue sur KTZ Emploi, ${prenom} ! Votre compte est prêt`;

  try {
    await sendEmail({ to: email, subject, html });
  } catch (err) {
    console.error("[Welcome email] Erreur:", err);
  }
}

// ─── Email : réinitialisation de mot de passe ────────────────────────────────

export async function sendResetEmail({
  name,
  email,
  resetUrl,
}: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:#f97316;padding:24px 32px;">
          <span style="background:white;border-radius:10px;padding:5px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:18px;font-weight:700;"> Emploi</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">🔑 Réinitialisation de mot de passe</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px;line-height:1.7;">
            Bonjour <strong>${name}</strong>,<br><br>
            Vous avez demandé à réinitialiser votre mot de passe sur <strong>KTZ Emploi</strong>.
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
          </p>

          <!-- Bouton principal -->
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:#f97316;color:white;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.3px;">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <!-- Lien texte de secours -->
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;line-height:1.6;">
            Ou copiez ce lien dans votre navigateur :<br>
            <a href="${resetUrl}" style="color:#f97316;word-break:break-all;">${resetUrl}</a>
          </p>

          <!-- Avertissement expiration -->
          <div style="margin-top:20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px 16px;">
            <p style="margin:0;color:#c2410c;font-size:12px;line-height:1.6;">
              ⏱ Ce lien est valable <strong>1 heure</strong> seulement.<br>
              Si vous n'êtes pas à l'origine de cette demande, ignorez cet email. Votre mot de passe restera inchangé.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">KTZ Emploi · Bangui, République Centrafricaine</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Mode développement : affiche le lien dans le terminal si aucun service configuré
  if (!process.env.RESEND_API_KEY && !process.env.SMTP_USER) {
    console.log("\n🔑 [RESET EMAIL PREVIEW] ─────────────────────────────────────");
    console.log(`À      : ${email} (${name})`);
    console.log(`Lien   : ${resetUrl}`);
    console.log("──────────────────────────────────────────────────────────────\n");
    return;
  }

  await sendEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe — KTZ Emploi",
    html,
  });
}

// ─── Email : rappel de délai de réponse au recruteur ─────────────────────────

export async function sendDeadlineReminderEmail({
  recruiterName,
  recruiterEmail,
  candidateName,
  jobTitle,
  daysLeft,
  applicationId,
}: {
  recruiterName: string;
  recruiterEmail: string;
  candidateName: string;
  jobTitle: string;
  daysLeft: number;
  applicationId: string;
}): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const applicationsUrl = `${baseUrl}/tableau-de-bord/recruteur/candidatures`;

  const isUrgent = daysLeft <= 1;
  const accentColor = isUrgent ? "#ef4444" : "#f97316";
  const badgeBg = isUrgent ? "#fef2f2" : "#fff7ed";
  const badgeBorder = isUrgent ? "#fecaca" : "#fed7aa";
  const badgeText = isUrgent ? "#b91c1c" : "#9a3412";

  const urgencyLabel = daysLeft <= 0
    ? "⛔ Délai expiré aujourd'hui !"
    : daysLeft === 1
    ? "🚨 Dernier jour pour répondre !"
    : `⏰ Plus que ${daysLeft} jours pour répondre`;

  const intro = daysLeft <= 0
    ? `Le délai de réponse pour la candidature de <strong>${candidateName}</strong> au poste <strong>${jobTitle}</strong> expire <strong>aujourd'hui</strong>. Merci d'apporter une réponse définitive dès que possible.`
    : `Vous avez reçu la candidature de <strong>${candidateName}</strong> pour le poste <strong>${jobTitle}</strong>. Il vous reste <strong>${daysLeft} jour${daysLeft > 1 ? "s" : ""}</strong> pour apporter une réponse finale à ce candidat.`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="520" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">
        <tr><td style="background:${accentColor};padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:${accentColor};font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827;">${urgencyLabel}</h1>
          <p style="color:#374151;margin:0 0 8px;font-size:15px;line-height:1.7;">
            Bonjour <strong>${recruiterName.split(" ")[0]}</strong>,
          </p>
          <p style="color:#374151;margin:0 0 24px;font-size:15px;line-height:1.7;">
            ${intro}
          </p>
          <div style="background:${badgeBg};border:1px solid ${badgeBorder};border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;color:${badgeText};font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Candidature concernée</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.8;">
              👤 Candidat : <strong>${candidateName}</strong><br>
              📌 Poste : <strong>${jobTitle}</strong>
            </p>
          </div>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 24px;">
            Sur KTZ Emploi, nous nous engageons à ce que chaque candidat reçoive une réponse dans un délai de <strong>10 jours</strong>.
            Cela contribue à une expérience respectueuse pour tous les chercheurs d'emploi en RCA.
          </p>
          <div style="text-align:center;">
            <a href="${applicationsUrl}"
               style="display:inline-block;background:${accentColor};color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Répondre maintenant →
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            Cet email a été envoyé automatiquement via KTZ Emploi.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const subject = daysLeft <= 0
    ? `⛔ Délai expiré — répondez à ${candidateName} pour "${jobTitle}"`
    : daysLeft === 1
    ? `🚨 Dernier jour — répondez à ${candidateName} pour "${jobTitle}"`
    : `⏰ Rappel : encore ${daysLeft} jours pour répondre à ${candidateName}`;

  try {
    await sendEmail({ to: recruiterEmail, subject, html });
  } catch (err) {
    console.error("[Deadline reminder email]", err);
  }
}
