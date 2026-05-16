/**
 * Script : Crée un profil recruteur + entreprise + offre,
 * puis notifie TOUS les candidats (email + WhatsApp).
 *
 * Usage :
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-recruiter-and-notify.ts
 */

// Charge les variables d'environnement depuis .env
import * as dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Resend } from "resend";

const prisma = new PrismaClient();

/* ── Données du recruteur ────────────────────────────────────────────────── */
const RECRUITER = {
  name: "Sandra Mossito",
  email: "sandra.mossito@afritech-rca.com",
  password: "Recrut3ur@2025",
};

const COMPANY = {
  name: "AfriTech RCA",
  slug: "afritech-rca",
  sector: "Informatique & Télécoms",
  description:
    "AfriTech RCA est une entreprise centrafricaine spécialisée dans les solutions numériques, " +
    "le développement logiciel et la transformation digitale. " +
    "Nous accompagnons PME, ONG et institutions publiques dans leur transition vers le digital.",
  location: "Bangui",
  size: "10 – 50 employés",
  email: "contact@afritech-rca.com",
  phone: "+236 77 00 11 22",
  website: "https://afritech-rca.com",
  verified: true,
};

const JOB = {
  title: "Développeur Full-Stack (React / Node.js)",
  type: "CDI",
  category: "Informatique & Télécoms",
  location: "Bangui",
  remote: false,
  salaryMin: 250_000,
  salaryMax: 450_000,
  salaryCurrency: "XAF",
  experienceLevel: "junior",
  published: true,
  featured: true,
  description: `
<h2>À propos du poste</h2>
<p>AfriTech RCA recrute un(e) <strong>Développeur Full-Stack</strong> passionné(e) par React.js et Node.js pour rejoindre notre équipe à Bangui.</p>

<h2>Vos missions</h2>
<ul>
  <li>Développer des applications web modernes avec React.js et Node.js</li>
  <li>Maintenir et améliorer nos plateformes existantes</li>
  <li>Collaborer avec les équipes design et produit</li>
  <li>Participer aux revues de code et garantir la qualité</li>
</ul>

<h2>Profil recherché</h2>
<ul>
  <li>Bac+3 minimum en Informatique ou équivalent</li>
  <li>1 à 3 ans d'expérience en développement web</li>
  <li>Maîtrise de React.js, TypeScript, Node.js</li>
  <li>Connaissance des bases de données (PostgreSQL, MySQL)</li>
  <li>Autonomie, rigueur et esprit d'équipe</li>
</ul>
  `.trim(),
  requirements: "Bac+3 Informatique · 1-3 ans d'expérience · React · Node.js · TypeScript",
  benefits: "Salaire compétitif · Formation continue · Environnement dynamique · Télétravail partiel",
  deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
};

/* ── Envoi email via Resend ──────────────────────────────────────────────── */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`  [EMAIL LOG] À: ${to} | Objet: ${subject}`);
    return true;
  }
  try {
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM || "KTZ Emploi <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) { console.error(`  ✗ Email ${to}:`, error.message); return false; }
    return true;
  } catch (e) {
    console.error(`  ✗ Email ${to}:`, e);
    return false;
  }
}

/* ── Envoi WhatsApp via UltraMsg ─────────────────────────────────────────── */
async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const instance = process.env.ULTRAMSG_INSTANCE;
  const token = process.env.ULTRAMSG_TOKEN;
  if (!instance || !token) {
    console.log(`  [WA LOG] À: ${to} | Message: ${message.slice(0, 80)}...`);
    return true;
  }
  try {
    // Normalise le numéro
    let phone = to.replace(/\D/g, "");
    if (!phone.startsWith("236") && !phone.startsWith("+")) phone = "236" + phone;
    phone = "+" + phone.replace(/^\+/, "");

    const res = await fetch(`https://api.ultramsg.com/${instance}/messages/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token, to: phone, body: message }).toString(),
    });
    const data = await res.json() as { sent?: boolean; error?: string };
    if (!data.sent) { console.error(`  ✗ WA ${phone}:`, data.error); return false; }
    return true;
  } catch (e) {
    console.error(`  ✗ WA ${to}:`, e);
    return false;
  }
}

/* ── HTML email ──────────────────────────────────────────────────────────── */
function buildEmailHtml(firstName: string, jobTitle: string, companyName: string, location: string, type: string, jobUrl: string): string {
  return `
  <div style="font-family:sans-serif;max-width:580px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#ea580c,#f97316);padding:20px 28px;border-radius:12px 12px 0 0">
      <h1 style="color:white;margin:0;font-size:20px">🔔 Nouvelle offre pour vous</h1>
    </div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:28px;border-radius:0 0 12px 12px">
      <p style="font-size:16px;color:#111827">Bonjour <strong>${firstName}</strong>,</p>
      <p style="color:#374151">Une nouvelle offre d'emploi correspond à votre profil :</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px 20px;margin:20px 0">
        <p style="margin:0 0 6px;font-size:18px;font-weight:700;color:#c2410c">💼 ${jobTitle}</p>
        <p style="margin:0 0 4px;color:#6b7280">🏢 ${companyName}</p>
        <p style="margin:0;color:#6b7280">📍 ${location} &nbsp;·&nbsp; ${type}</p>
      </div>
      <div style="margin-top:24px">
        <a href="${jobUrl}" style="display:inline-block;background:#f97316;color:white;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
          Voir l'offre et postuler →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:28px">
        Vous recevez cet email car vous êtes inscrit sur <strong>KTZ Emploi</strong>.<br>
        <a href="http://localhost:3000/tableau-de-bord" style="color:#f97316">Gérer mes préférences</a>
      </p>
    </div>
  </div>`;
}

/* ── Script principal ────────────────────────────────────────────────────── */
async function main() {
  console.log("\n🚀 === CRÉATION RECRUTEUR + OFFRE + NOTIFICATIONS ===\n");

  // 1. Utilisateur recruteur
  let user = await prisma.user.findUnique({ where: { email: RECRUITER.email } });
  if (!user) {
    const hashed = await bcrypt.hash(RECRUITER.password, 10);
    user = await prisma.user.create({
      data: {
        name: RECRUITER.name,
        email: RECRUITER.email,
        password: hashed,
        role: "EMPLOYER",
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Recruteur créé   : ${user.name} <${user.email}>`);
  } else {
    console.log(`ℹ️  Recruteur déjà existant : ${user.email}`);
  }

  // 2. Entreprise
  let company = await prisma.company.findUnique({ where: { slug: COMPANY.slug } });
  if (!company) {
    company = await prisma.company.create({ data: { userId: user.id, ...COMPANY } });
    console.log(`✅ Entreprise créée : ${company.name}`);
  } else {
    console.log(`ℹ️  Entreprise déjà existante : ${company.name}`);
  }

  // 3. Offre
  const slug = `dev-fullstack-afritech-rca-${Date.now()}`;
  const job = await prisma.job.create({
    data: { companyId: company.id, slug, views: 0, ...JOB },
  });
  console.log(`✅ Offre publiée    : "${job.title}"`);
  console.log(`   Slug             : ${job.slug}`);

  const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const jobUrl = `${siteUrl}/emplois/${job.slug}`;

  // 4. Récupérer tous les candidats
  const candidates = await prisma.jobSeekerProfile.findMany({
    where: { user: { role: "JOBSEEKER", suspended: false } },
    select: {
      phone: true,
      whatsappOptIn: true,
      notifCategories: true,
      user: { select: { email: true, name: true } },
    },
  });

  const waMessage =
    `Bonjour {{prenom}} 👋\n\n` +
    `Une nouvelle offre vous attend !\n\n` +
    `💼 *${job.title}*\n` +
    `🏢 ${company.name}\n` +
    `📍 ${job.location} · ${job.type}\n` +
    `💰 ${job.salaryMin?.toLocaleString()} – ${job.salaryMax?.toLocaleString()} XAF/mois\n\n` +
    `👉 Postuler : ${jobUrl}`;

  console.log(`\n📊 ${candidates.length} candidat(s) à notifier`);
  console.log("─────────────────────────────────────────────\n");

  let emailSent = 0, emailFail = 0, waSent = 0, waFail = 0;

  for (const c of candidates) {
    // Filtre par catégorie si configuré
    if (c.notifCategories) {
      try {
        const cats: string[] = JSON.parse(c.notifCategories);
        if (cats.length > 0 && !cats.includes(job.category)) continue;
      } catch { /* JSON invalide → on envoie */ }
    }

    const firstName = c.user.name?.split(" ")[0] ?? "vous";

    // ── Email ──
    const html = buildEmailHtml(firstName, job.title, company.name, job.location, job.type, jobUrl);
    if (!c.user.email) { emailFail++; continue; }
    const ok = await sendEmail(
      c.user.email,
      `💼 Nouvelle offre : ${job.title} chez ${company.name}`,
      html,
    );
    ok ? emailSent++ : emailFail++;
    if (ok) console.log(`  📧 Email ✓  ${c.user.email}`);

    // ── WhatsApp ──
    if (c.phone && c.whatsappOptIn) {
      const msg = waMessage.replace("{{prenom}}", firstName);
      const waOk = await sendWhatsApp(c.phone, msg);
      waOk ? waSent++ : waFail++;
      if (waOk) console.log(`  💬 WA    ✓  ${c.phone}`);
    }
  }

  // 5. Rapport
  console.log("\n═══════════════════════════════════════════════");
  console.log("  RAPPORT FINAL");
  console.log("═══════════════════════════════════════════════");
  console.log(`  📧 Emails    : ${emailSent} envoyés  ${emailFail > 0 ? `· ${emailFail} échecs` : "· 0 échec"}`);
  console.log(`  💬 WhatsApp  : ${waSent} envoyés  ${waFail > 0 ? `· ${waFail} échecs` : "· 0 échec"}`);
  console.log("═══════════════════════════════════════════════");
  console.log(`\n🔗 Offre : ${jobUrl}\n`);
}

main()
  .catch((e) => { console.error("\n❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
