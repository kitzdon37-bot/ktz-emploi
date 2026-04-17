import { Resend } from "resend";
import nodemailer from "nodemailer";

// ─── Envoi d'email : Resend (priorité) ou SMTP Gmail (fallback) ──────────────

async function sendEmail({
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

// ─── Types ───────────────────────────────────────────────────────────────────

export interface JobMatch {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  company: { name: string };
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
    .map(
      (job) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #f3f4f6;">
        <div style="font-weight:600; color:#111827; font-size:15px;">${job.title}</div>
        <div style="color:#6b7280; font-size:13px; margin-top:2px;">${job.company.name} · ${job.location} · ${job.type}</div>
        <a href="${baseUrl}/emplois/${job.slug}"
           style="display:inline-block; margin-top:8px; background:#f97316; color:white; padding:6px 14px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600;">
          Voir l'offre →
        </a>
      </td>
    </tr>
  `
    )
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
