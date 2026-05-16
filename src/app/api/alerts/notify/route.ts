import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// POST — appelé quand une nouvelle offre est publiée, notifie les alertes correspondantes
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jobId } = body;

  if (!jobId) return NextResponse.json({ error: "jobId manquant" }, { status: 400 });

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: { select: { name: true } } },
  });

  if (!job) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
  if (!job.published) return NextResponse.json({ error: "Offre non publiée" }, { status: 400 });

  // Récupère toutes les alertes actives avec l'email de l'utilisateur
  const alerts = await prisma.jobAlert.findMany({
    where: { active: true },
    include: { user: { select: { email: true, name: true } } },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const jobText = `${job.title} ${job.location} ${job.category}`.toLowerCase();

  let notified = 0;
  const errors: string[] = [];

  for (const alert of alerts) {
    // Vérifie que les mots-clés matchent
    const keywords = alert.keywords.toLowerCase().split(/[,\s]+/).filter(Boolean);
    const keywordMatch = keywords.some((kw) => jobText.includes(kw));
    if (!keywordMatch) continue;

    // Vérifie que la location matche si définie
    if (alert.location) {
      const alertLoc = alert.location.toLowerCase();
      const jobLoc = job.location.toLowerCase();
      if (!jobLoc.includes(alertLoc) && !alertLoc.includes(jobLoc)) continue;
    }

    // Envoie l'email de notification
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
          <p style="color:rgba(255,255,255,.9);margin:8px 0 0;font-size:14px;">La plateforme d'emploi de la RCA</p>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">Nouvelle offre pour vous !</h1>
          <p style="color:#6b7280;margin:0 0 24px;font-size:15px;line-height:1.6;">
            Bonjour${alert.user.name ? ` <strong>${alert.user.name.split(" ")[0]}</strong>` : ""},<br>
            Une nouvelle offre correspond à votre alerte <strong>"${alert.keywords}"</strong>.
          </p>
          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Nouvelle offre</p>
            <p style="margin:0 0 4px;font-size:18px;font-weight:700;color:#111827;">${job.title}</p>
            <p style="margin:0;font-size:14px;color:#6b7280;">${job.company.name} · ${job.location} · ${job.type}</p>
          </div>
          <div style="text-align:center;">
            <a href="${baseUrl}/emplois/${job.slug}"
               style="display:inline-block;background:#f97316;color:white;padding:12px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">
              Voir l'offre →
            </a>
          </div>
          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
            <a href="${baseUrl}/tableau-de-bord/alertes" style="color:#9ca3af;">Gérer mes alertes</a>
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">KTZ Emploi · Bangui, République Centrafricaine</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    if (!alert.user.email) continue;
    try {
      await sendEmail({
        to: alert.user.email,
        subject: `Nouvelle offre : ${job.title} chez ${job.company.name} à ${job.location}`,
        html,
      });
      notified++;
    } catch (err) {
      errors.push(`${alert.user.email}: ${String(err)}`);
    }
  }

  return NextResponse.json({ success: true, notified, errors });
}
