import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: { url: "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" },
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
  const companies = await prisma.company.findMany({ select: { id: true, name: true } });
  const get = (name) => companies.find(c => c.name.toLowerCase().includes(name.toLowerCase())) ?? companies[0];

  // Créer de nouvelles entreprises fictives
  const newCompanyDefs = [
    { name: "Hôtel Ledger Plaza Bangui", sector: "Hôtellerie & Tourisme", location: "Bangui", userId: null, email: "rh@ledger-bangui.com" },
    { name: "Cabinet Comptable FIDUCIA", sector: "Finance & Comptabilité", location: "Bangui", userId: null, email: "rh@fiducia-rca.com" },
    { name: "Clinique Sainte-Famille", sector: "Santé", location: "Bangui", userId: null, email: "rh@clinique-sf.com" },
    { name: "ACAP (Agence Centrafricaine de Presse)", sector: "Médias & Communication", location: "Bangui", userId: null, email: "rh@acap-rca.com" },
    { name: "BTP Centrafrique SARL", sector: "BTP & Construction", location: "Bangui", userId: null, email: "rh@btpca.com" },
    { name: "Pharmacie du Marché Central", sector: "Santé", location: "Bangui", userId: null, email: "rh@pharmacie-mc.com" },
  ];

  for (const c of newCompanyDefs) {
    const existing = await prisma.company.findFirst({ where: { name: c.name } });
    if (existing) continue;
    // Créer user employeur
    let user = await prisma.user.findUnique({ where: { email: c.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: c.email, name: `RH ${c.name}`, role: "EMPLOYER" } });
    }
    await prisma.company.create({
      data: { userId: user.id, name: c.name, slug: slug(c.name), sector: c.sector, location: c.location, verified: true },
    });
    console.log(`✓ Entreprise créée : ${c.name}`);
  }

  const allCompanies = await prisma.company.findMany({ select: { id: true, name: true } });
  const getC = (name) => allCompanies.find(c => c.name.toLowerCase().includes(name.toLowerCase())) ?? allCompanies[0];

  const offres = [
    // Hôtellerie
    {
      company: "Ledger",
      title: "Réceptionniste Hôtel",
      type: "CDI", category: "Hôtellerie & Tourisme", location: "Bangui",
      experienceLevel: "1-3 ans", salaryMin: 150000, salaryMax: 220000,
      description: "Accueil des clients nationaux et internationaux au Ledger Plaza Bangui. Gestion des réservations, check-in/check-out, facturation et service clientèle haut de gamme.",
      requirements: "BTS Hôtellerie ou équivalent. Anglais courant obligatoire. Présentation soignée. Expérience en hôtellerie appréciée.",
      benefits: "Uniforme fourni, repas sur place, prime de langue, assurance santé.",
    },
    {
      company: "Ledger",
      title: "Chef Cuisinier",
      type: "CDI", category: "Hôtellerie & Tourisme", location: "Bangui",
      experienceLevel: "5+ ans", salaryMin: 400000, salaryMax: 600000,
      description: "Gestion de la cuisine du restaurant de l'hôtel Ledger Plaza. Création des menus, supervision de l'équipe cuisine, gestion des stocks et contrôle qualité.",
      requirements: "CAP/BEP Cuisine ou formation équivalente. 5 ans d'expérience minimum. Connaissance des cuisines internationale et africaine.",
      benefits: "Logement possible, repas, prime mensuelle sur performance, formation internationale.",
    },
    {
      company: "Ledger",
      title: "Agent de Sécurité",
      type: "CDI", category: "Sécurité & Gardiennage", location: "Bangui",
      experienceLevel: "0-2 ans", salaryMin: 100000, salaryMax: 140000,
      description: "Surveillance des accès et des bâtiments de l'hôtel, contrôle des entrées et sorties, rondes de sécurité. Travail en équipe en rotation 3x8.",
      requirements: "Baccalauréat ou BEPC. Bonne condition physique. Sens de la vigilance. Formation sécurité appréciée.",
      benefits: "Uniforme fourni, repas inclus, prime de nuit.",
    },

    // BTP
    {
      company: "BTP Centrafrique",
      title: "Chef de Chantier",
      type: "CDI", category: "BTP & Construction", location: "Bangui",
      experienceLevel: "5+ ans", salaryMin: 450000, salaryMax: 650000,
      description: "Encadrement des équipes sur les chantiers de construction à Bangui. Suivi des travaux, respect des délais et des normes de sécurité, coordination avec la maîtrise d'œuvre.",
      requirements: "BTS Génie Civil ou équivalent. 5 ans d'expérience sur chantier. Permis B. Leadership et organisation.",
      benefits: "Véhicule de chantier, prime de fin de travaux, équipements EPI fournis.",
    },
    {
      company: "BTP Centrafrique",
      title: "Maçon Qualifié",
      type: "CDD", category: "BTP & Construction", location: "Bangui",
      experienceLevel: "2-5 ans", salaryMin: 120000, salaryMax: 180000,
      description: "Travaux de maçonnerie pour des chantiers résidentiels et commerciaux à Bangui : fondations, élévation des murs, enduits, carrelage.",
      requirements: "CAP Maçonnerie ou expérience équivalente. Sérieux et ponctualité. Capacité à travailler en équipe.",
      benefits: "Prime de productivité, équipements fournis, possibilité de CDI.",
    },
    {
      company: "BTP Centrafrique",
      title: "Dessinateur Projeteur",
      type: "CDI", category: "BTP & Construction", location: "Bangui",
      experienceLevel: "2-4 ans", salaryMin: 250000, salaryMax: 380000,
      description: "Réalisation des plans d'exécution et dessins techniques pour les projets de construction. Utilisation d'AutoCAD, coordination avec les ingénieurs.",
      requirements: "BTS Dessin de Bâtiment ou Génie Civil. Maîtrise d'AutoCAD. Rigueur et précision.",
      benefits: "Matériel informatique fourni, formation logiciels, mutuelle.",
    },

    // Santé / Clinique
    {
      company: "Clinique Sainte",
      title: "Sage-Femme",
      type: "CDI", category: "Santé & Médecine", location: "Bangui",
      experienceLevel: "0-3 ans", salaryMin: 220000, salaryMax: 320000,
      description: "Suivi des grossesses, accouchements et soins post-nataux à la Clinique Sainte-Famille de Bangui. Sensibilisation des patientes à la santé maternelle.",
      requirements: "Diplôme de Sage-Femme reconnu par l'État. Inscription à l'Ordre. Empathie et sang-froid.",
      benefits: "Logement de fonction possible, garde rémunérée, formation continue.",
    },
    {
      company: "Pharmacie du",
      title: "Pharmacien Assistant",
      type: "CDI", category: "Santé & Médecine", location: "Bangui",
      experienceLevel: "0-2 ans", salaryMin: 280000, salaryMax: 400000,
      description: "Délivrance des médicaments sur ordonnance, conseil pharmaceutique aux clients, gestion des stocks et des commandes auprès des grossistes.",
      requirements: "Diplôme de Pharmacien. Inscription à l'Ordre des Pharmaciens de RCA. Rigueur et sens du service.",
      benefits: "Prime mensuelle, assurance professionnelle, formation médicale.",
    },

    // Médias
    {
      company: "ACAP",
      title: "Journaliste Reporter",
      type: "CDI", category: "Médias & Communication", location: "Bangui",
      experienceLevel: "1-3 ans", salaryMin: 180000, salaryMax: 280000,
      description: "Collecte et rédaction de dépêches d'information sur l'actualité centrafricaine. Reportages terrain à Bangui et en province, coordination avec les correspondants régionaux.",
      requirements: "Licence en Journalisme ou Communication. Maîtrise du français et du sango. Permis de conduire. Capacité à travailler sous pression.",
      benefits: "Téléphone de service, indemnités de déplacement, carte de presse.",
    },
    {
      company: "ACAP",
      title: "Community Manager",
      type: "CDD", category: "Marketing & Communication", location: "Bangui",
      experienceLevel: "1-2 ans", salaryMin: 120000, salaryMax: 180000,
      description: "Animation des réseaux sociaux de l'ACAP (Facebook, Twitter/X, Instagram). Création de contenus, modération, reporting mensuel de performance.",
      requirements: "Formation en communication digitale ou marketing. Maîtrise de Canva et des réseaux sociaux. Créativité.",
      benefits: "Flexibilité des horaires, formation digitale, téléphone fourni.",
    },

    // Finance / Cabinet
    {
      company: "FIDUCIA",
      title: "Expert-Comptable",
      type: "CDI", category: "Finance & Comptabilité", location: "Bangui",
      experienceLevel: "5+ ans", salaryMin: 500000, salaryMax: 800000,
      description: "Tenue et supervision de la comptabilité de PME et ONG clientes. Établissement des bilans, déclarations fiscales, audit légal et conseil en gestion financière.",
      requirements: "DSCG ou équivalent. Inscription à l'Ordre des Experts-Comptables. Maîtrise des normes OHADA. 5 ans d'expérience minimum.",
      benefits: "Voiture de service, intéressement, formation continue, mutuelle famille.",
    },
    {
      company: "FIDUCIA",
      title: "Assistant Comptable",
      type: "CDI", category: "Finance & Comptabilité", location: "Bangui",
      experienceLevel: "0-2 ans", salaryMin: 130000, salaryMax: 200000,
      description: "Saisie comptable, rapprochements bancaires, préparation des déclarations TVA et assistance aux experts-comptables du cabinet.",
      requirements: "BTS Comptabilité. Maîtrise d'Excel. Sérieux et discrétion. Débutants acceptés avec formation interne.",
      benefits: "Formation interne, horaires réguliers, prime annuelle.",
    },

    // Divers
    {
      company: "Orange",
      title: "Technicien Informatique",
      type: "CDI", category: "Informatique & Tech", location: "Bangui",
      experienceLevel: "1-3 ans", salaryMin: 200000, salaryMax: 320000,
      description: "Maintenance du parc informatique, support utilisateurs niveau 1 et 2, installation de logiciels et gestion du réseau local dans les bureaux d'Orange Centrafrique.",
      requirements: "BTS Informatique ou Systèmes Réseaux. Connaissance Windows/Linux. Sens du service.",
      benefits: "Formation certifiante, matériel fourni, assurance maladie.",
    },
    {
      company: "ENERCA",
      title: "Responsable RH",
      type: "CDI", category: "Ressources Humaines", location: "Bangui",
      experienceLevel: "3-5 ans", salaryMin: 350000, salaryMax: 500000,
      description: "Gestion administrative du personnel ENERCA : recrutement, paie, formation, relations sociales, suivi des contrats et conformité légale.",
      requirements: "Master en Ressources Humaines ou Droit Social. Connaissance du droit du travail centrafricain. Discrétion et organisation.",
      benefits: "Véhicule de service, 13ème mois, formation RH, mutuelle.",
    },
    {
      company: "SODECA",
      title: "Plombier Industriel",
      type: "CDI", category: "Ingénierie & Technique", location: "Bangui",
      experienceLevel: "2-4 ans", salaryMin: 150000, salaryMax: 230000,
      description: "Maintenance et réparation des canalisations et installations hydrauliques du réseau SODECA. Interventions d'urgence 24h/24 en rotation.",
      requirements: "CAP Plomberie ou BTS Maintenance industrielle. Expérience en réseau hydraulique. Disponibilité pour astreintes.",
      benefits: "Véhicule d'intervention, tenue de travail, prime d'astreinte.",
    },
    {
      company: "BSCA",
      title: "Chargé de Clientèle Entreprises",
      type: "CDI", category: "Commerce & Vente", location: "Bangui",
      experienceLevel: "2-4 ans", salaryMin: 300000, salaryMax: 450000,
      description: "Développement et fidélisation du portefeuille clients entreprises de la BSCA. Montage de dossiers de crédit, négociation des conditions bancaires, reporting commercial.",
      requirements: "Bac+3 en Commerce, Finance ou Économie. Sens de la négociation. Réseau professionnel apprécié.",
      benefits: "Commission sur CA, véhicule, téléphone, mutuelle santé.",
    },
    {
      company: "Ministère de la Santé",
      title: "Chauffeur Ambulancier",
      type: "CDI", category: "Transport & Logistique", location: "Bangui",
      experienceLevel: "0-2 ans", salaryMin: 90000, salaryMax: 130000,
      description: "Transport des patients entre les structures de santé de Bangui. Conduite de l'ambulance, assistance aux secours, entretien du véhicule.",
      requirements: "Permis B valide depuis 2 ans minimum. Calme et sang-froid. Formation premiers secours appréciée.",
      benefits: "Véhicule fourni, indemnités de garde, couverture médicale.",
    },
    {
      company: "Ledger",
      title: "Agent de Nettoyage / Gouvernante",
      type: "CDI", category: "Services & Maintenance", location: "Bangui",
      experienceLevel: "0-1 an", salaryMin: 80000, salaryMax: 110000,
      description: "Entretien et nettoyage des chambres et parties communes de l'hôtel Ledger Plaza. Respect des standards d'hygiène hôtelière 5 étoiles.",
      requirements: "BEPC minimum. Sérieux, ponctualité, sens du détail. Débutants acceptés avec formation interne.",
      benefits: "Uniforme fourni, repas sur place, prime de présence.",
    },
  ];

  let created = 0;
  for (const offre of offres) {
    const company = getC(offre.company);
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
        featured: created < 6,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`✓ ${offre.title} (${company.name})`);
    created++;
  }

  const total = await prisma.job.count();
  console.log(`\n✅ ${created} nouvelles offres ajoutées. Total en base : ${total} offres.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
