/**
 * send-prospection-emails.mjs
 * Envoie un email personnalisé à chaque entreprise dont les offres
 * sont publiées sur ktzemploi.com
 */

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "kitzdon37@gmail.com",
    pass: "xcpi qebs hmbf jsll",
  },
});

const SIGNATURE = `
Bien cordialement,

KITEZE NGOUYOMBO Donald Chrysostome
Fondateur & Directeur — KTZ Emploi
kitzdon37@gmail.com | ktzemploi.com | Bangui, République Centrafricaine
`;

const destinataires = [
  {
    nom: "ACTED Centrafrique",
    email: "rca@acted.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/acted-centrafrique.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

J'ai suivi l'action d'ACTED Centrafrique dans les domaines de la sécurité alimentaire, de l'eau et de la cohésion sociale en RCA. En parcourant vos recrutements en cours, j'ai pris l'initiative de publier vos offres sur ktzemploi.com, gratuitement, pour vous aider à toucher davantage de candidats centrafricains qualifiés.

Vos offres actuellement en ligne :
- Responsable Développement de Projets Pays

Votre profil ACTED est visible sur ktzemploi.com avec votre logo, votre description et vos offres actives. Une capture d'écran est jointe à cet email.

Connectez-vous sur ktzemploi.com pour gérer vos offres et recevoir les candidatures directement en ligne.`,
  },
  {
    nom: "INTERSOS RCA",
    email: "rca@intersos.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/intersos-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

INTERSOS mène un travail remarquable en RCA dans les domaines de l'eau, de la santé et de la protection des populations vulnérables. En parcourant vos recrutements en cours, j'ai pris l'initiative de publier vos offres sur ktzemploi.com, gratuitement.

Vos offres actuellement en ligne :
- Chef(fe) de Mission
- Coordinateur/trice de Programme
- Chef(fe) de Projet — WASH, Santé & Protection

Votre profil INTERSOS est visible avec votre logo et vos 3 offres actives. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres et recevoir les candidatures.`,
  },
  {
    nom: "IRC – International Rescue Committee",
    email: "rca@rescue.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/irc-international-rescue-committee.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

L'IRC est présent en RCA depuis 2006 et intervient chaque jour pour la santé, la nutrition et la protection des populations affectées par les conflits. En parcourant vos recrutements en cours, j'ai pris l'initiative de publier vos offres sur ktzemploi.com.

Vos offres actuellement en ligne :
- Officier(ère) Psychosocial(e) — Poste local

Votre profil IRC est visible sur ktzemploi.com. Une capture d'écran est jointe à cet email.

Connectez-vous sur ktzemploi.com pour gérer vos offres et recevoir les candidatures.`,
  },
  {
    nom: "COOPI – Cooperazione Internazionale",
    email: "rca@coopi.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/coopi-cooperazione-internazionale.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

COOPI est présente en RCA depuis 1974 et œuvre pour le développement des communautés à travers des interventions sociales, sanitaires et environnementales. J'ai publié votre offre sur ktzemploi.com pour vous aider à recruter localement.

Vos offres actuellement en ligne :
- Chef(fe) de Mission

Votre profil COOPI est en ligne avec votre logo. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "DanChurchAid RCA",
    email: "car@danchurchaid.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/danchurchaid-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

DanChurchAid intervient en RCA depuis 2015 pour la cohésion sociale, la consolidation de la paix et le renforcement des capacités locales. J'ai publié votre offre sur ktzemploi.com pour vous connecter aux meilleurs candidats centrafricains.

Vos offres actuellement en ligne :
- Coordonnateur(trice) des Achats et de la Logistique

Votre profil DCA est en ligne avec votre logo. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "Solidarités International RCA",
    email: "rca@solidarites.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/solidarites-international-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

Solidarités International intervient en RCA pour l'eau, l'assainissement et la sécurité alimentaire des populations déplacées par les conflits. J'ai publié votre offre sur ktzemploi.com pour vous aider à recruter localement et rapidement.

Vos offres actuellement en ligne :
- Directeur/trice de Zone Opérationnelle

Votre profil est en ligne. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "Expertise France RCA",
    email: "rca@expertisefrance.fr",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/expertise-france-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

Expertise France appuie les institutions centrafricaines dans les domaines de la gouvernance, de la justice et du renforcement des capacités. J'ai publié votre offre sur ktzemploi.com pour vous connecter aux experts locaux disponibles en RCA.

Vos offres actuellement en ligne :
- Chargé(e) d'Appui Institutionnel et de Coordination Administrative — Secrétariat PSJ

Votre profil est en ligne. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "OIM – Organisation Internationale pour les Migrations",
    email: "iomrca@iom.int",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/oim-organisation-internationale-pour-les-migrations.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

L'OIM accompagne depuis 2014 les personnes déplacées en RCA et renforce les capacités nationales en matière de gestion des migrations. J'ai publié votre offre sur ktzemploi.com pour vous connecter aux profils techniques disponibles localement.

Vos offres actuellement en ligne :
- Responsable des Technologies de l'Information et des Communications (TIC)

Votre profil OIM est en ligne. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "PNUD RCA",
    email: "registry.cf@undp.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/pnud-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

Le PNUD est au cœur de la stratégie de développement de la RCA, appuyant la gouvernance, la réduction de la pauvreté et la réponse aux crises. En publiant vos offres sur ktzemploi.com, nous contribuons ensemble à la dynamisation de l'emploi local en RCA.

Vos offres actuellement en ligne :
- Assistant(e) au Programme des Petites Subventions — FEM-SGP

Votre profil PNUD est en ligne avec votre logo. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "UNICEF RCA",
    email: "bangui@unicef.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/unicef-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

L'UNICEF protège chaque jour les droits des enfants centrafricains à travers des programmes d'éducation, de santé et de protection. J'ai publié vos offres sur ktzemploi.com pour vous aider à recruter les profils qualifiés dont vous avez besoin.

Vos offres actuellement en ligne :
- Responsable Approvisionnement et Logistique (P-4)
- Chargé de Communication et Médias
- Spécialiste en Protection de l'Enfance

Votre profil UNICEF est en ligne avec votre logo et vos 3 offres actives. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "OCDH Centrafrique",
    email: "contact@ocdh.org",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/ocdh-centrafrique.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

L'OCDH défend et promeut les droits humains en RCA avec une équipe de juristes, chargés de projet et communicants engagés. J'ai publié vos offres sur ktzemploi.com pour vous connecter aux profils de la société civile centrafricaine.

Vos offres actuellement en ligne :
- Coordinateur(trice) de Projet — Protection Communautaire
- Chargé(e) de Communication et Plaidoyer

Votre profil est en ligne. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
  {
    nom: "Ecobank RCA",
    email: "ecobank.rca@ecobank.com",
    screenshot: "C:/Users/donald-chrysostome.k/Desktop/emails-preview/ecobank-rca.png",
    corps: `Madame, Monsieur,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale de recrutement dédiée à la République Centrafricaine.

Je suis KITEZE NGOUYOMBO Donald Chrysostome, entrepreneur centrafricain engagé pour le développement numérique de la RCA. Depuis plusieurs mois, je travaille à la construction d'une solution concrète pour connecter employeurs et candidats en RCA : une plateforme web, une application mobile Android, et une agence physique à Bangui dont l'ouverture est prévue fin juillet 2026.

Ecobank RCA, premier groupe bancaire panafricain présent en RCA depuis 2010, est une institution de référence pour les candidats centrafricains en finance et banque. J'ai publié vos offres sur ktzemploi.com pour vous aider à identifier les meilleurs profils locaux.

Vos offres actuellement en ligne :
- Chargé(e) de Clientèle Particuliers
- Responsable Comptabilité et Finances
- Chargé de Clientèle Entreprises
- Stage en Comptabilité et Finance

Votre profil Ecobank est en ligne avec votre logo et vos 4 offres actives. Une capture d'écran est jointe.

Connectez-vous sur ktzemploi.com pour gérer vos offres.`,
  },
];

async function main() {
  console.log("📧  Vérification connexion Gmail SMTP...");
  await transporter.verify();
  console.log("✅  Connexion OK\n");

  let envoyes = 0;
  let erreurs = 0;

  for (const dest of destinataires) {
    try {
      await transporter.sendMail({
        from: '"KITEZE NGOUYOMBO Donald — KTZ Emploi" <kitzdon37@gmail.com>',
        to: dest.email,
        subject: "Vos offres d'emploi sont en ligne sur KTZ Emploi — ktzemploi.com",
        text: dest.corps + SIGNATURE,
        attachments: [
          {
            filename: "votre-profil-ktzemploi.png",
            path: dest.screenshot,
          },
        ],
      });

      console.log(`✅  ${dest.nom.padEnd(48)} → ${dest.email}`);
      envoyes++;
      await new Promise((r) => setTimeout(r, 2500));
    } catch (e) {
      console.error(`❌  ${dest.nom.padEnd(48)} → ${e.message}`);
      erreurs++;
    }
  }

  console.log("\n══════════════════════════════════════════════");
  console.log(`✅  ${envoyes} email(s) envoyé(s) avec succès`);
  console.log(`❌  ${erreurs} erreur(s)`);
  console.log("══════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error("Erreur fatale :", e.message);
  process.exit(1);
});
