/**
 * Script : notification aux entreprises dont les offres sont sur KTZ Emploi
 * Usage  : node scripts/notify-companies.mjs [--send]
 * Sans --send : génère un aperçu HTML dans scripts/email-preview.html
 * Avec --send : envoie réellement les emails via Resend
 */

import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = "https://ktzemploi.com";
const FROM = process.env.EMAIL_FROM || "KTZ Emploi <contact@ktzemploi.com>";
const DRY_RUN = !process.argv.includes("--send");

// ─── Template HTML ────────────────────────────────────────────────────────────

function buildEmail(companyName, jobs) {
  const jobLines = jobs
    .map(
      (j) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
            <a href="${BASE_URL}/emplois/${j.slug}"
               style="font-size:14px;font-weight:600;color:#111827;text-decoration:none;">
              ${j.title}
            </a>
            <div style="margin-top:4px;">
              <a href="${BASE_URL}/emplois/${j.slug}"
                 style="font-size:12px;color:#f97316;">${BASE_URL}/emplois/${j.slug}</a>
            </div>
          </td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr><td style="background:#f97316;padding:28px 32px;">
          <span style="background:white;border-radius:10px;padding:6px 10px;font-weight:800;color:#f97316;font-size:18px;">KTZ</span>
          <span style="color:white;font-size:20px;font-weight:700;"> Emploi</span>
          <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:13px;">
            La plateforme d'emploi de la République Centrafricaine
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
            Bonjour,
          </p>
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.8;">
            Nous vous contactons au sujet de <strong>${companyName}</strong>.
          </p>
          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.8;">
            Nous avons créé <strong>KTZ Emploi</strong> (<a href="${BASE_URL}" style="color:#f97316;">${BASE_URL}</a>),
            une plateforme en ligne dédiée à l'emploi en République Centrafricaine.
            Dans le cadre du lancement, nous avons référencé les offres d'emploi disponibles publiquement,
            dont ${jobs.length > 1 ? "celles de votre organisation" : "celle de votre organisation"} :
          </p>

          <!-- Liste des offres -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
            <tr><td style="background:#f9fafb;padding:10px 16px;font-size:12px;font-weight:700;
                           color:#374151;text-transform:uppercase;letter-spacing:0.5px;">
              Vos offres sur KTZ Emploi
            </td></tr>
            <tr><td style="padding:0 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">${jobLines}</table>
            </td></tr>
          </table>

          <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.8;">
            Si vous souhaitez <strong>modifier, dépublier ou gérer</strong> ces offres,
            il vous suffit de créer un compte recruteur gratuitement sur la plateforme.
            Vous pourrez également publier de nouvelles offres et accéder aux candidatures reçues.
          </p>

          <div style="text-align:center;margin-bottom:16px;">
            <a href="${BASE_URL}/auth/register?role=employer"
               style="display:inline-block;background:#f97316;color:white;padding:13px 32px;
                      border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
              Créer mon espace recruteur →
            </a>
          </div>

          <p style="margin:24px 0 0;font-size:14px;color:#6b7280;line-height:1.7;">
            Pour toute question ou demande de modification immédiate, répondez simplement à cet email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.8;">
            KTZ Emploi · Bangui, République Centrafricaine<br>
            <a href="${BASE_URL}" style="color:#9ca3af;">${BASE_URL}</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const companies = await prisma.company.findMany({
    where: { email: { not: null } },
    select: {
      name: true,
      email: true,
      slug: true,
      jobs: { select: { title: true, slug: true }, where: { published: true } },
    },
  });

  // Filtre : garder seulement celles qui ont au moins une offre publiée
  const targets = companies.filter((c) => c.jobs.length > 0);

  console.log(`\n${targets.length} entreprise(s) à notifier :\n`);
  targets.forEach((c) =>
    console.log(`  • ${c.name} <${c.email}> — ${c.jobs.length} offre(s)`)
  );

  if (DRY_RUN) {
    // Aperçu HTML de la première entreprise
    const sample = targets[0];
    const html = buildEmail(sample.name, sample.jobs);
    const previewPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "email-preview.html"
    );
    writeFileSync(previewPath, html, "utf8");
    console.log(`\n[APERÇU] Email généré pour "${sample.name}"`);
    console.log(`Ouvre ce fichier dans ton navigateur :`);
    console.log(`  ${previewPath}`);
    console.log(`\nPour envoyer réellement : node scripts/notify-companies.mjs --send\n`);
    await prisma.$disconnect();
    return;
  }

  // Envoi réel
  const resend = new Resend(process.env.RESEND_API_KEY);
  let success = 0;
  let failed = 0;

  for (const company of targets) {
    const html = buildEmail(company.name, company.jobs);
    const subject = `Vos offres d'emploi sont référencées sur KTZ Emploi`;

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: company.email,
        subject,
        html,
      });
      if (error) throw new Error(error.message);
      console.log(`  ✓ Envoyé à ${company.name} <${company.email}>`);
      success++;
    } catch (err) {
      console.error(`  ✗ Échec ${company.name} <${company.email}> : ${err.message}`);
      failed++;
    }

    // Petite pause pour respecter les limites Resend
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\nRésultat : ${success} envoyé(s), ${failed} échec(s)\n`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
