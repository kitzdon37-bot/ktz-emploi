import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    },
  },
});

function slug(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).slice(2, 7);
}

async function main() {
  // 1. Supprimer les offres test
  const deleted = await prisma.job.deleteMany({
    where: {
      OR: [
        { title: { contains: "test", mode: "insensitive" } },
        { title: { contains: "mac", mode: "insensitive" } },
        { description: { contains: "test", mode: "insensitive" } },
      ],
    },
  });
  console.log(`✓ ${deleted.count} offre(s) test supprimée(s)`);

  // 2. Récupérer les entreprises existantes
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  if (companies.length === 0) {
    console.log("Aucune entreprise trouvée. Création d'entreprises fictives...");

    // Créer un user admin fictif pour chaque entreprise
    const userData = [
      { email: "rh@enerca-rca.com", name: "RH ENERCA" },
      { email: "rh@sodeca-rca.com", name: "RH SODECA" },
      { email: "rh@orange-rca.com", name: "RH Orange" },
      { email: "rh@bsca-rca.com", name: "RH BSCA" },
      { email: "rh@minsante-rca.com", name: "RH MinSanté" },
    ];

    for (const u of userData) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        await prisma.user.create({
          data: { email: u.email, name: u.name, role: "EMPLOYER" },
        });
      }
    }
  }

  // Re-fetch companies (ou utiliser ceux créés)
  const allCompanies = await prisma.company.findMany({ select: { id: true, name: true } });

  if (allCompanies.length === 0) {
    // Créer des entreprises fictives RCA
    const users = await prisma.user.findMany({
      where: { role: "EMPLOYER" },
      select: { id: true, email: true },
    });

    const companyData = [
      { name: "ENERCA", sector: "Énergie", location: "Bangui", description: "Énergie électrique de la RCA", email: "rh@enerca-rca.com" },
      { name: "SODECA", sector: "Eau & Assainissement", location: "Bangui", description: "Société de distribution d'eau en RCA", email: "rh@sodeca-rca.com" },
      { name: "Orange Centrafrique", sector: "Télécommunications", location: "Bangui", description: "Opérateur télécom leader en RCA", email: "rh@orange-rca.com" },
      { name: "BSCA", sector: "Finance & Banque", location: "Bangui", description: "Banque de développement de la RCA", email: "rh@bsca-rca.com" },
      { name: "Ministère de la Santé", sector: "Santé", location: "Bangui", description: "Ministère en charge de la santé publique", email: "rh@minsante-rca.com" },
    ];

    for (const c of companyData) {
      const user = users.find(u => u.email === c.email);
      if (!user) continue;
      const existing = await prisma.company.findFirst({ where: { name: c.name } });
      if (!existing) {
        await prisma.company.create({
          data: {
            userId: user.id,
            name: c.name,
            slug: slug(c.name),
            sector: c.sector,
            location: c.location,
            description: c.description,
            verified: true,
          },
        });
        console.log(`✓ Entreprise créée : ${c.name}`);
      }
    }
  }

  const finalCompanies = await prisma.company.findMany({ select: { id: true, name: true } });
  if (finalCompanies.length === 0) {
    console.log("❌ Impossible de créer des offres sans entreprises.");
    return;
  }

  const getCompany = (name) => {
    const c = finalCompanies.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return c ?? finalCompanies[0];
  };

  // 3. Ajouter les offres fictives
  const offres = [
    // Énergie / ENERCA
    {
      company: "ENERCA",
      title: "Ingénieur Électricien",
      type: "CDI",
      category: "Ingénierie & Technique",
      location: "Bangui",
      experienceLevel: "3-5 ans",
      salaryMin: 350000, salaryMax: 500000,
      description: "Nous recherchons un ingénieur électricien pour la maintenance et l'extension du réseau électrique de Bangui. Vous superviserez les travaux d'installation et assurerez la qualité du service.",
      requirements: "Diplôme d'ingénieur en électrotechnique ou génie électrique. Expérience de 3 ans minimum dans le secteur de l'énergie. Maîtrise des normes électriques.",
      benefits: "Assurance maladie, logement de fonction, véhicule de service, formation continue.",
    },
    {
      company: "ENERCA",
      title: "Technicien de Maintenance Réseau",
      type: "CDI",
      category: "Ingénierie & Technique",
      location: "Bangui",
      experienceLevel: "1-3 ans",
      salaryMin: 180000, salaryMax: 280000,
      description: "Rejoignez notre équipe technique chargée de la maintenance préventive et corrective du réseau électrique. Interventions sur le terrain à Bangui et en province.",
      requirements: "BTS Électrotechnique ou équivalent. Permis de conduire catégorie B. Disponibilité pour les astreintes.",
      benefits: "Prime de terrain, équipements fournis, mutuelle d'entreprise.",
    },

    // Eau / SODECA
    {
      company: "SODECA",
      title: "Responsable Qualité de l'Eau",
      type: "CDI",
      category: "Environnement & Agriculture",
      location: "Bangui",
      experienceLevel: "3-5 ans",
      salaryMin: 300000, salaryMax: 450000,
      description: "Vous serez responsable du contrôle qualité de l'eau distribuée à Bangui, de l'analyse des échantillons et de la mise en conformité avec les normes OMS.",
      requirements: "Master en chimie, biologie ou génie sanitaire. Connaissance des normes de potabilité de l'eau. Expérience en laboratoire d'analyse.",
      benefits: "Véhicule de service, prime de résultat, formation internationale.",
    },

    // Télécoms / Orange
    {
      company: "Orange",
      title: "Développeur Mobile Android",
      type: "CDI",
      category: "Informatique & Tech",
      location: "Bangui",
      experienceLevel: "2-4 ans",
      salaryMin: 400000, salaryMax: 600000,
      description: "Développez et maintenez les applications mobiles Android d'Orange Centrafrique. Vous travaillerez en étroite collaboration avec les équipes produit et design.",
      requirements: "Maîtrise de Kotlin/Java Android. Connaissance des API REST. Expérience avec Firebase. Portfolio d'applications requis.",
      benefits: "Téléphone de fonction, accès internet illimité, tickets repas, plan d'épargne entreprise.",
    },
    {
      company: "Orange",
      title: "Chargé de Service Client",
      type: "CDD",
      category: "Commerce & Vente",
      location: "Bangui",
      experienceLevel: "0-1 an",
      salaryMin: 120000, salaryMax: 180000,
      description: "Accueil et assistance des clients en boutique Orange. Vous conseillerez les clients sur les offres et services, gérerez les réclamations et assurerez la satisfaction client.",
      requirements: "Baccalauréat minimum. Bon relationnel et sens du service. Maîtrise du français et du sango. Débutants acceptés.",
      benefits: "Formation interne, commission sur ventes, uniforme fourni.",
    },
    {
      company: "Orange",
      title: "Ingénieur Réseau Télécoms",
      type: "CDI",
      category: "Informatique & Tech",
      location: "Bangui",
      experienceLevel: "3-5 ans",
      salaryMin: 500000, salaryMax: 750000,
      description: "Planification, déploiement et optimisation du réseau 4G/5G d'Orange Centrafrique. Vous analyserez la couverture réseau et proposerez des améliorations.",
      requirements: "Diplôme d'ingénieur en télécommunications. Maîtrise des technologies GSM/4G/LTE. Expérience avec les équipements Huawei ou Ericsson.",
      benefits: "Voiture de fonction, logement, prime annuelle, retraite complémentaire.",
    },

    // Finance / BSCA
    {
      company: "BSCA",
      title: "Analyste Crédit",
      type: "CDI",
      category: "Finance & Comptabilité",
      location: "Bangui",
      experienceLevel: "2-4 ans",
      salaryMin: 350000, salaryMax: 500000,
      description: "Analysez les dossiers de crédit des particuliers et entreprises, évaluez les risques et faites des recommandations d'octroi. Suivi du portefeuille clients.",
      requirements: "Licence en finance, comptabilité ou économie. Maîtrise d'Excel. Rigueur et sens de l'analyse. Expérience en banque appréciée.",
      benefits: "13ème mois, assurance vie, compte bancaire privilégié, formation certifiante.",
    },
    {
      company: "BSCA",
      title: "Caissier Principal",
      type: "CDI",
      category: "Finance & Comptabilité",
      location: "Bangui",
      experienceLevel: "1-3 ans",
      salaryMin: 150000, salaryMax: 220000,
      description: "Gestion des opérations de caisse, réception et remise de fonds, équilibrage en fin de journée. Garantissez la conformité des opérations bancaires.",
      requirements: "BTS Comptabilité ou Finance. Rigueur absolue. Expérience en manipulation de fonds. Casier judiciaire vierge exigé.",
      benefits: "Prime de caisse, mutuelle santé, transport.",
    },

    // Santé
    {
      company: "Ministère de la Santé",
      title: "Médecin Généraliste",
      type: "CDI",
      category: "Santé & Médecine",
      location: "Bangui",
      experienceLevel: "0-2 ans",
      salaryMin: 400000, salaryMax: 600000,
      description: "Consultations de médecine générale au sein d'un centre de santé de Bangui. Diagnostic, traitement et suivi des patients, participation aux programmes de santé publique.",
      requirements: "Doctorat en médecine. Inscription à l'Ordre des Médecins de RCA. Bonne connaissance des pathologies tropicales.",
      benefits: "Logement de fonction, indemnités de garde, formation médicale continue.",
    },
    {
      company: "Ministère de la Santé",
      title: "Infirmier Diplômé d'État",
      type: "CDI",
      category: "Santé & Médecine",
      location: "Bouar",
      experienceLevel: "0-1 an",
      salaryMin: 180000, salaryMax: 250000,
      description: "Soins infirmiers, suivi des patients hospitalisés, administration des traitements et participation aux campagnes de vaccination dans la région de Bouar.",
      requirements: "Diplôme d'État d'infirmier. Capacité à travailler en zone rurale. Sens de l'initiative et autonomie.",
      benefits: "Prime de zone, logement sur site, couverture médicale complète.",
    },

    // Domaines variés
    {
      company: "Orange",
      title: "Comptable Senior",
      type: "CDI",
      category: "Finance & Comptabilité",
      location: "Bangui",
      experienceLevel: "5+ ans",
      salaryMin: 450000, salaryMax: 650000,
      description: "Gestion de la comptabilité générale et analytique, préparation des états financiers, coordination avec les auditeurs externes et conformité fiscale.",
      requirements: "DSCG ou équivalent. Maîtrise des normes OHADA. Expérience de 5 ans minimum. Connaissance de SAP ou ERP similaire.",
      benefits: "Voiture de service, prime de bilan, mutuelle famille.",
    },
    {
      company: "ENERCA",
      title: "Juriste d'Entreprise",
      type: "CDI",
      category: "Droit & Juridique",
      location: "Bangui",
      experienceLevel: "3-5 ans",
      salaryMin: 350000, salaryMax: 500000,
      description: "Conseil juridique interne, rédaction et négociation des contrats, gestion du contentieux et veille réglementaire pour ENERCA.",
      requirements: "Master 2 en droit des affaires ou droit public. Maîtrise du droit OHADA. Expérience dans le secteur public appréciée.",
      benefits: "Assurance professionnelle, formation continue, prime de résultats.",
    },
    {
      company: "SODECA",
      title: "Responsable Communication",
      type: "CDI",
      category: "Marketing & Communication",
      location: "Bangui",
      experienceLevel: "2-4 ans",
      salaryMin: 250000, salaryMax: 380000,
      description: "Élaboration et mise en œuvre de la stratégie de communication de SODECA. Gestion des réseaux sociaux, relations presse et sensibilisation des usagers.",
      requirements: "Licence en communication, journalisme ou marketing. Maîtrise des outils digitaux. Créativité et aisance rédactionnelle.",
      benefits: "Forfait téléphone, budget communication, formation marketing digital.",
    },
    {
      company: "BSCA",
      title: "Chauffeur Coursier",
      type: "CDD",
      category: "Transport & Logistique",
      location: "Bangui",
      experienceLevel: "0-1 an",
      salaryMin: 80000, salaryMax: 120000,
      description: "Transport de documents et valeurs entre les agences BSCA de Bangui. Missions ponctuelles pour les cadres de direction.",
      requirements: "Permis de conduire catégorie B valide. Connaissance de Bangui. Sérieux et ponctualité. Casier judiciaire vierge.",
      benefits: "Véhicule fourni, carburant, prime de ponctualité.",
    },
    {
      company: "Ministère de la Santé",
      title: "Enseignant en Sciences (Lycée)",
      type: "CDI",
      category: "Éducation & Formation",
      location: "Bangui",
      experienceLevel: "0-2 ans",
      salaryMin: 150000, salaryMax: 220000,
      description: "Enseignement des sciences naturelles et physiques au lycée de Bangui. Préparation des cours, évaluation des élèves et participation aux activités scolaires.",
      requirements: "Licence en sciences ou CAPES. Pédagogie et patience. Connaissance des programmes officiels RCA.",
      benefits: "Congés scolaires, logement subventionné, formation pédagogique.",
    },
  ];

  let created = 0;
  for (const offre of offres) {
    const company = getCompany(offre.company);
    await prisma.job.create({
      data: {
        companyId: company.id,
        title: offre.title,
        slug: slug(offre.title),
        description: offre.description,
        requirements: offre.requirements,
        benefits: offre.benefits,
        type: offre.type,
        category: offre.category,
        location: offre.location,
        experienceLevel: offre.experienceLevel,
        salaryMin: offre.salaryMin,
        salaryMax: offre.salaryMax,
        salaryCurrency: "XAF",
        published: true,
        featured: created < 4,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ Offre créée : ${offre.title} (${company.name})`);
    created++;
  }

  console.log(`\n✅ ${created} offres ajoutées avec succès.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
