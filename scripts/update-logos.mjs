/**
 * update-logos.mjs
 * Met à jour les logos de toutes les entreprises dans la base de données
 * Sources : Wikimedia Commons, sites officiels — collectés le 15/05/2026
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    },
  },
});

// ─── Table de correspondance nom → URL logo ────────────────────────────────
const LOGOS = [
  // ── ONG & Organisations internationales ────────────────────────────────
  {
    match: "UNICEF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/UNICEF_Logo.png",
  },
  {
    match: "PNUD",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/UNDP_logo.svg",
  },
  {
    match: "OIM",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7c/International_Organization_for_Migration_logo.svg",
  },
  {
    match: "IRC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/International_Rescue_Committee_Logo.svg",
  },
  {
    match: "INTERSOS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b2/INTERSOS_Humanitarian_Aid_Organization_Logo.png",
  },
  {
    match: "COOPI",
    logo: "https://www.coopi.org/images/logo.svg",
  },
  {
    match: "DanChurchAid",
    logo: "https://www.danchurchaid.org/wp-content/themes/fkn-theme/assets/dist/img/dca-logo.svg",
  },
  {
    match: "Solidarités International",
    logo: "https://www.solidarites.org/wp-content/uploads/2018/05/logo.svg",
  },
  {
    match: "Expertise France",
    logo: "https://www.expertisefrance.fr/sites/expertise/files/2025-06/logo-expertise-france-fond-transparent270-haut.jpg",
  },
  {
    match: "ACTED",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Acted_logo_2023.png",
  },
  {
    match: "ONG Humanitas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "MINUSCA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_the_United_Nations.svg",
  },
  {
    match: "OMS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/World_Health_Organization_Logo.svg",
  },
  {
    match: "OCDH",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Première Urgence",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Premiere_Urgence_Internationale_logo.svg",
  },

  // ── Banque & Finance ───────────────────────────────────────────────────
  {
    match: "Ecobank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ecobank_Logo_EN.png",
  },
  {
    match: "BSIC",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Banque Populaire Maroco",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "BSCA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "OCA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "SUNU",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "ASCOMA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Télécoms ───────────────────────────────────────────────────────────
  {
    match: "Orange Centrafrique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg",
  },
  {
    match: "Telecel",
    logo: "https://telecelgroup.com/wp-content/uploads/2026/04/T-01-RED.png",
  },
  {
    match: "TeleCa",
    logo: "https://telecelgroup.com/wp-content/uploads/2026/04/T-01-RED.png",
  },
  {
    match: "Moov Africa",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Moov_Africa_Logo.svg",
  },
  {
    match: "Socatel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Airtel",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Airtel_logo.svg",
  },

  // ── Énergie & Infrastructure ───────────────────────────────────────────
  {
    match: "ENERCA",
    logo: "https://apua-asea.org/wp-content/uploads/2023/01/enerca.png",
  },
  {
    match: "SODECA",
    logo: "https://setem.fr/images/uploads/marques/marque_logo_sodeca.png",
  },

  // ── Hôtellerie ─────────────────────────────────────────────────────────
  {
    match: "Ledger Plaza",
    logo: "https://ledgerplaza-bangui.com/wp-content/uploads/2020/02/BANGUI_LOGO.png",
  },
  {
    match: "Oubangui",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Palme d'Or",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Médecine & Santé ───────────────────────────────────────────────────
  {
    match: "Institut Pasteur",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Institut_Pasteur_logo.svg",
  },
  {
    match: "Shalina",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Clinique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Pharmacie",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Ministère de la Santé",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Logistique & Transport ─────────────────────────────────────────────
  {
    match: "AGL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "Mercure Logistics",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── BTP ────────────────────────────────────────────────────────────────
  {
    match: "SEMEM",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "BTP Centrafrique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Éducation ──────────────────────────────────────────────────────────
  {
    match: "ESGNT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "NewTech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Médias ─────────────────────────────────────────────────────────────
  {
    match: "Radio Ndeke",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "ACAP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Informatique local ─────────────────────────────────────────────────
  {
    match: "RCA Soft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "InfoTech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    match: "AfriTech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Sécurité ───────────────────────────────────────────────────────────
  {
    match: "BCAGS",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },

  // ── Divers ─────────────────────────────────────────────────────────────
  {
    match: "FIDUCIA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
];

function findLogo(companyName) {
  for (const entry of LOGOS) {
    if (companyName.toLowerCase().includes(entry.match.toLowerCase())) {
      return entry.logo;
    }
  }
  return null;
}

async function main() {
  console.log("🖼  Mise à jour des logos — KTZ Emploi\n");

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, logo: true },
    orderBy: { name: "asc" },
  });

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const company of companies) {
    const logo = findLogo(company.name);

    if (!logo) {
      console.log(`  ❓ Pas de logo trouvé : ${company.name}`);
      notFound++;
      continue;
    }

    // Ne pas écraser si déjà identique
    if (company.logo === logo) {
      console.log(`  ⏭  Déjà à jour : ${company.name}`);
      skipped++;
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { logo },
    });

    console.log(`  ✅ ${company.name}`);
    console.log(`     → ${logo.slice(0, 80)}...`);
    updated++;
  }

  console.log("\n═══════════════════════════════════════════");
  console.log(`✅ ${updated} logos mis à jour`);
  console.log(`⏭  ${skipped} déjà à jour`);
  console.log(`❓ ${notFound} sans correspondance`);
  console.log("═══════════════════════════════════════════\n");
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
