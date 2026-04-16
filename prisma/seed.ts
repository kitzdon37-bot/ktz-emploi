import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPw = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@rcajobs.cf" },
    update: {},
    create: {
      email: "admin@rcajobs.cf",
      name: "Admin RCAJobs",
      password: adminPw,
      role: "ADMIN",
    },
  });

  // Create employer users
  const employerPw = await bcrypt.hash("employer123", 12);

  const employer1 = await prisma.user.upsert({
    where: { email: "rh@ong-humanitas.cf" },
    update: {},
    create: {
      email: "rh@ong-humanitas.cf",
      name: "Marie Koyaga",
      password: employerPw,
      role: "EMPLOYER",
    },
  });

  const employer2 = await prisma.user.upsert({
    where: { email: "recrutement@ecobank-rca.cf" },
    update: {},
    create: {
      email: "recrutement@ecobank-rca.cf",
      name: "Jean-Pierre Nzanga",
      password: employerPw,
      role: "EMPLOYER",
    },
  });

  const employer3 = await prisma.user.upsert({
    where: { email: "rh@teleca.cf" },
    update: {},
    create: {
      email: "rh@teleca.cf",
      name: "Sophie Gamba",
      password: employerPw,
      role: "EMPLOYER",
    },
  });

  const employer4 = await prisma.user.upsert({
    where: { email: "hr@unicef-rca.org" },
    update: {},
    create: {
      email: "hr@unicef-rca.org",
      name: "Paul Masson",
      password: employerPw,
      role: "EMPLOYER",
    },
  });

  // Create companies
  const company1 = await prisma.company.upsert({
    where: { slug: "ong-humanitas-rca" },
    update: {},
    create: {
      userId: employer1.id,
      name: "ONG Humanitas RCA",
      slug: "ong-humanitas-rca",
      sector: "Humanitaire & ONG",
      size: "PME",
      location: "Bangui",
      description: "ONG dédiée à l'aide humanitaire et au développement durable en République Centrafricaine. Nous œuvrons pour l'accès à l'eau potable, la santé et l'éducation.",
      email: "rh@ong-humanitas.cf",
      verified: true,
    },
  });

  const company2 = await prisma.company.upsert({
    where: { slug: "ecobank-rca" },
    update: {},
    create: {
      userId: employer2.id,
      name: "Ecobank RCA",
      slug: "ecobank-rca",
      sector: "Banque & Finance",
      size: "Grande",
      location: "Bangui",
      description: "Première banque panafricaine en République Centrafricaine. Nous offrons des services bancaires innovants aux particuliers et entreprises.",
      website: "https://www.ecobank.com",
      email: "recrutement@ecobank-rca.cf",
      phone: "+236 21 61 01 00",
      verified: true,
    },
  });

  const company3 = await prisma.company.upsert({
    where: { slug: "teleca-centrafrique" },
    update: {},
    create: {
      userId: employer3.id,
      name: "TeleCa Centrafrique",
      slug: "teleca-centrafrique",
      sector: "Informatique & Télécoms",
      size: "PME",
      location: "Bangui",
      description: "Opérateur télécoms centrafricain proposant des services mobiles, internet et data à travers toute la RCA.",
      email: "rh@teleca.cf",
      verified: true,
    },
  });

  const company4 = await prisma.company.upsert({
    where: { slug: "unicef-rca" },
    update: {},
    create: {
      userId: employer4.id,
      name: "UNICEF RCA",
      slug: "unicef-rca",
      sector: "Humanitaire & ONG",
      size: "Grande",
      location: "Bangui",
      description: "L'UNICEF travaille en République Centrafricaine pour protéger les droits des enfants et leur assurer accès à l'éducation, la santé et la protection.",
      website: "https://www.unicef.org/car",
      email: "hr@unicef-rca.org",
      verified: true,
    },
  });

  // Create jobs
  const jobs = [
    {
      companyId: company1.id,
      title: "Coordinateur de Programme Wash",
      slug: "coordinateur-programme-wash-ong-humanitas",
      type: "CDI",
      category: "Humanitaire & ONG",
      location: "Bangui",
      remote: false,
      description: `Dans le cadre de notre programme WASH (Eau, Assainissement et Hygiène), nous recrutons un Coordinateur de Programme expérimenté.

Missions principales :
- Coordonner la mise en œuvre des activités WASH dans les zones d'intervention
- Superviser une équipe de 10 agents de terrain
- Assurer le suivi-évaluation des activités et rédiger les rapports donateurs
- Représenter l'ONG auprès des autorités et partenaires locaux
- Participer aux réunions de coordination humanitaire

Contexte : Poste basé à Bangui avec des déplacements fréquents dans les préfectures.`,
      requirements: `- Bac+4/5 en gestion de projet humanitaire, ingénierie hydraulique ou domaine similaire
- Minimum 3 ans d'expérience dans la coordination de programmes WASH en contexte humanitaire
- Maîtrise du cycle de projet et des outils de S&E
- Excellentes capacités de communication et de négociation
- Maîtrise du français obligatoire, anglais souhaité
- Connaissance du contexte centrafricain appréciée`,
      benefits: `- Salaire compétitif selon grille ONG
- Assurance santé complète
- Indemnités de déplacement
- Formation continue
- Environnement de travail multiculturel`,
      experienceLevel: "Senior",
      salaryMin: 500000,
      salaryMax: 800000,
      featured: true,
    },
    {
      companyId: company2.id,
      title: "Chargé de Clientèle Entreprises",
      slug: "charge-clientele-entreprises-ecobank",
      type: "CDI",
      category: "Banque & Finance",
      location: "Bangui",
      remote: false,
      description: `Ecobank RCA recherche un Chargé de Clientèle Entreprises pour développer et gérer son portefeuille de clients corporate.

Responsabilités :
- Gérer et développer un portefeuille de clients entreprises (PME et grandes entreprises)
- Analyser les besoins financiers des clients et proposer des solutions adaptées
- Assurer la croissance du PNB (Produit Net Bancaire)
- Identifier de nouvelles opportunités commerciales
- Préparer et présenter les demandes de crédit
- Veiller au respect des procédures KYC et de conformité`,
      requirements: `- Bac+4/5 en Banque, Finance, Gestion ou Commerce
- Expérience de 2 à 5 ans dans un poste similaire en banque
- Connaissance des produits bancaires entreprises
- Excellentes capacités commerciales et relationnelles
- Maîtrise des outils informatiques (Excel, CRM)
- Résistance au stress et orienté résultats`,
      benefits: `- Package salarial attractif + variable
- Voiture de service
- Assurance santé famille
- Plan d'épargne retraite
- Opportunités d'évolution au sein du groupe panafricain`,
      experienceLevel: "Intermediaire",
      salaryMin: 400000,
      salaryMax: 650000,
      featured: true,
    },
    {
      companyId: company3.id,
      title: "Développeur Web Full Stack",
      slug: "developpeur-web-full-stack-teleca",
      type: "CDI",
      category: "Informatique & Télécoms",
      location: "Bangui",
      remote: true,
      description: `TeleCa Centrafrique recrute un Développeur Web Full Stack passionné pour rejoindre son équipe technique en pleine expansion.

Votre mission :
- Développer et maintenir nos applications web (portail client, espace self-care)
- Contribuer à l'architecture technique de nos solutions digitales
- Intégrer les APIs de nos partenaires
- Participer aux revues de code et assurer la qualité
- Documenter les développements

Stack technique : Node.js, React, PostgreSQL, Docker`,
      requirements: `- Bac+3/5 en Informatique ou autodidacte avec portfolio solide
- Maîtrise de JavaScript/TypeScript, React, Node.js
- Connaissance des bases de données SQL et NoSQL
- Expérience avec Git et méthodes Agile
- Capacité à travailler en autonomie
- Minimum 2 ans d'expérience en développement web`,
      benefits: `- Salaire attractif
- Télétravail flexible
- Matériel informatique fourni
- Connexion internet haut débit
- Formations et certifications prise en charge`,
      experienceLevel: "Intermediaire",
      salaryMin: 300000,
      salaryMax: 500000,
      featured: true,
    },
    {
      companyId: company4.id,
      title: "Chargé de Communication et Médias",
      slug: "charge-communication-medias-unicef",
      type: "CDD",
      category: "Communication & Marketing",
      location: "Bangui",
      remote: false,
      description: `L'UNICEF RCA recherche un(e) Chargé(e) de Communication pour renforcer sa stratégie de plaidoyer et de visibilité.

Principales fonctions :
- Développer et mettre en œuvre la stratégie de communication de l'UNICEF RCA
- Produire des contenus (articles, vidéos, infographies) pour les plateformes digitales
- Gérer les relations médias et presse
- Organiser des événements de communication
- Soutenir les activités de plaidoyer`,
      requirements: `- Diplôme en Communication, Journalisme, Sciences sociales
- Minimum 3 ans d'expérience en communication institutionnelle
- Excellentes capacités rédactionnelles en français
- Maîtrise des outils de PAO et des réseaux sociaux
- Expérience dans le secteur humanitaire ou développement
- Anglais professionnel requis`,
      salaryMin: 600000,
      salaryMax: 900000,
      experienceLevel: "Senior",
    },
    {
      companyId: company1.id,
      title: "Logisticien Terrain",
      slug: "logisticien-terrain-humanitas-bambari",
      type: "CDD",
      category: "Logistique & Transport",
      location: "Bambari",
      remote: false,
      description: `ONG Humanitas RCA recherche un Logisticien Terrain pour sa base de Bambari pour appuyer la gestion logistique des opérations humanitaires.

Responsabilités :
- Gérer les stocks, entrepôts et équipements
- Superviser le parc véhicules
- Assurer les approvisionnements terrain
- Respecter et faire respecter les procédures logistiques`,
      requirements: `- Formation en logistique humanitaire ou gestion
- 2 ans d'expérience en logistique terrain en contexte difficile
- Permis B obligatoire
- Capacité à travailler sous pression`,
      experienceLevel: "Intermediaire",
      salaryMin: 250000,
      salaryMax: 380000,
    },
    {
      companyId: company2.id,
      title: "Stage en Comptabilité et Finance",
      slug: "stage-comptabilite-finance-ecobank-2024",
      type: "Stage",
      category: "Comptabilité & Audit",
      location: "Bangui",
      remote: false,
      description: `Ecobank RCA offre un stage de 6 mois au sein de son Département Comptabilité et Finance.

Missions :
- Participer à la saisie et au traitement des opérations comptables
- Contribuer à la préparation des états financiers
- Assister dans la gestion de la trésorerie
- Apprentissage des normes IFRS`,
      requirements: `- Étudiant(e) en Bac+3/4 Comptabilité, Finance, Gestion
- Maîtrise d'Excel et des outils bureautiques
- Rigueur et discrétion
- Disponibilité immédiate`,
      experienceLevel: "Debutant",
      salaryMin: 75000,
      salaryMax: 100000,
    },
    {
      companyId: company4.id,
      title: "Spécialiste en Protection de l'Enfance",
      slug: "specialiste-protection-enfance-unicef-rca",
      type: "CDI",
      category: "Humanitaire & ONG",
      location: "Bangui",
      remote: false,
      description: `L'UNICEF RCA recherche un(e) Spécialiste en Protection de l'Enfance pour renforcer son programme national.

Responsabilités clés :
- Développer et superviser les programmes de protection de l'enfance
- Coordonner avec les partenaires gouvernementaux et les ONG
- Produire des analyses et rapports de situation
- Appuyer le renforcement des capacités nationales`,
      requirements: `- Master en Droit, Sciences sociales, Développement ou domaine connexe
- 5 ans d'expérience en protection de l'enfance
- Connaissance du droit international humanitaire
- Excellente maîtrise du français, anglais professionnel`,
      experienceLevel: "Expert",
      salaryMin: 700000,
      salaryMax: 1100000,
    },
    {
      companyId: company3.id,
      title: "Technicien Réseau Télécoms",
      slug: "technicien-reseau-telecoms-bangui",
      type: "CDI",
      category: "Informatique & Télécoms",
      location: "Bangui",
      remote: false,
      description: `TeleCa Centrafrique recherche un Technicien Réseau pour assurer le déploiement et la maintenance de son infrastructure télécoms.

Missions :
- Installation et configuration des équipements réseau (routeurs, switches, antennes BTS)
- Maintenance préventive et corrective du réseau
- Dépannage des incidents réseau
- Supervision du réseau via les outils NMS`,
      requirements: `- BTS/Licence en Télécommunications, Électronique ou Informatique réseau
- 1 à 3 ans d'expérience en maintenance réseau télécoms
- Connaissance des protocoles IP, GSM/UMTS/LTE
- Permis B souhaité pour interventions terrain`,
      experienceLevel: "Intermediaire",
      salaryMin: 200000,
      salaryMax: 320000,
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        ...job,
        published: true,
        featured: job.featured || false,
        salaryCurrency: "XAF",
      },
    });
  }

  // Create jobseeker users
  const seekerPw = await bcrypt.hash("seeker123", 12);
  const seeker1 = await prisma.user.upsert({
    where: { email: "amara.kette@gmail.com" },
    update: {},
    create: {
      email: "amara.kette@gmail.com",
      name: "Amara Ketté",
      password: seekerPw,
      role: "JOBSEEKER",
    },
  });

  await prisma.jobSeekerProfile.upsert({
    where: { userId: seeker1.id },
    update: {},
    create: {
      userId: seeker1.id,
      title: "Développeur Web Junior",
      bio: "Passionné d'informatique et développement web. À la recherche d'un CDI à Bangui.",
      location: "Bangui",
      skills: JSON.stringify(["JavaScript", "React", "Node.js", "HTML/CSS"]),
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test accounts:");
  console.log("  Employeur 1: rh@ong-humanitas.cf / employer123");
  console.log("  Employeur 2: recrutement@ecobank-rca.cf / employer123");
  console.log("  Employeur 3: rh@teleca.cf / employer123");
  console.log("  Candidat:    amara.kette@gmail.com / seeker123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
