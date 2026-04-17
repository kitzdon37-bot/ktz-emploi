import nodemailer from "nodemailer";

// Crée le transporteur SMTP (Gmail ou autre)
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

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

// Template HTML de l'email
function buildEmailHtml(candidate: CandidateEmail): string {
  const jobRows = candidate.jobs
    .map(
      (job) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #f3f4f6;">
        <div style="font-weight:600; color:#111827; font-size:15px;">${job.title}</div>
        <div style="color:#6b7280; font-size:13px; margin-top:2px;">${job.company.name} · ${job.location} · ${job.type}</div>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/emplois/${job.slug}"
           style="display:inline-block; margin-top:8px; background:#f97316; color:white; padding:6px 14px; border-radius:8px; text-decoration:none; font-size:13px; font-weight:600;">
          Voir l'offre →
        </a>
      </td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:#f97316;padding:28px 32px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
            <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          </div>
          <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:14px;">La plateforme d'emploi de la RCA</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">👋 Bonjour ${candidate.name.split(" ")[0]} !</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
            Nous avons sélectionné <strong>${candidate.jobs.length} offre(s)</strong> qui correspondent à votre profil sur KTZ Emploi.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0">
            ${jobRows}
          </table>

          <div style="margin-top:28px;text-align:center;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/emplois"
               style="display:inline-block;background:#111827;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir toutes les offres
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/tableau-de-bord/parametres" style="color:#9ca3af;">Se désabonner</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Envoie un email à un candidat avec ses offres correspondantes
export async function sendJobMatchEmail(candidate: CandidateEmail): Promise<{ success: boolean; error?: string }> {
  // Mode preview : log dans la console si pas de config SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\n📧 [PREVIEW EMAIL] ─────────────────────────────");
    console.log(`À      : ${candidate.email} (${candidate.name})`);
    console.log(`Offres : ${candidate.jobs.map((j) => j.title).join(", ")}`);
    console.log("────────────────────────────────────────────────\n");
    return { success: true };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"KTZ Emploi" <${process.env.SMTP_USER}>`,
      to: candidate.email,
      subject: `${candidate.jobs.length} offre(s) correspondent à votre profil 🎯`,
      html: buildEmailHtml(candidate),
    });
    return { success: true };
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Email de réinitialisation de mot de passe ───────────────────────────────

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
        <tr><td style="background:#f97316;padding:24px 32px;">
          <span style="background:white;border-radius:10px;padding:5px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:18px;font-weight:700;"> Emploi</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Réinitialisation de mot de passe</h2>
          <p style="color:#6b7280;margin:0 0 24px;font-size:14px;line-height:1.6;">
            Bonjour <strong>${name}</strong>,<br><br>
            Vous avez demandé à réinitialiser votre mot de passe sur KTZ Emploi.
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
            Ce lien est valable <strong>1 heure</strong>.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${resetUrl}"
               style="display:inline-block;background:#f97316;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
            Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.<br>
            Votre mot de passe ne sera pas modifié.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">KTZ Emploi · Bangui, République Centrafricaine</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Mode preview si SMTP non configuré
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\n🔑 [RESET EMAIL PREVIEW] ─────────────────────────");
    console.log(`À      : ${email}`);
    console.log(`Lien   : ${resetUrl}`);
    console.log("──────────────────────────────────────────────────\n");
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"KTZ Emploi" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Réinitialisation de votre mot de passe — KTZ Emploi",
    html,
  });
}
