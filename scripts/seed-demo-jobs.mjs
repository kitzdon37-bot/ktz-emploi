import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slug(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).slice(2, 7);
}

const JOBS = [
  // ── Ecobank RCA ──────────────────────────────────────────────────────────
  {
    companyEmail: "rh@ecobank-rca.cf",
    title: "Chargé(e) de Clientèle Particuliers",
    type: "CDI",
    category: "Banque & Finance",
    location: "Bangui",
    remote: false,
    experienceLevel: "1-3 ans",
    salaryMin: 180000,
    salaryMax: 250000,
    description: `<p>Rejoignez <strong>Ecobank RCA</strong>, premier groupe bancaire panafricain en République Centrafricaine, en tant que <strong>Chargé(e) de Clientèle Particuliers</strong>.</p>
<p>Vous serez l'interlocuteur privilégié de nos clients particuliers, en charge de développer et fidéliser un portefeuille de clients au sein de notre agence de Bangui.</p>
<h3>Vos missions</h3>
<ul>
<li>Accueillir, conseiller et orienter les clients particuliers</li>
<li>Développer et fidéliser un portefeuille clients</li>
<li>Proposer des produits et services adaptés aux besoins des clients (épargne, crédit, assurance)</li>
<li>Traiter les opérations bancaires courantes et assurer le suivi des dossiers</li>
<li>Atteindre les objectifs commerciaux fixés par la direction</li>
</ul>`,
    requirements: `<ul>
<li>BAC+2/3 en Finance, Comptabilité, Gestion ou domaine similaire</li>
<li>1 à 3 ans d'expérience dans une banque ou une institution financière</li>
<li>Excellentes compétences relationnelles et sens du service client</li>
<li>Maîtrise du français ; la connaissance du Sango est un atout</li>
<li>Bonne maîtrise des outils bureautiques (Excel, Word)</li>
</ul>`,
    benefits: `<ul>
<li>Salaire compétitif + primes sur objectifs</li>
<li>Couverture médicale pour l'employé et sa famille</li>
<li>Formation continue et perspectives d'évolution au sein du groupe</li>
<li>Environnement de travail multiculturel et stimulant</li>
</ul>`,
  },
  {
    companyEmail: "rh@ecobank-rca.cf",
    title: "Responsable Comptabilité et Finances",
    type: "CDI",
    category: "Banque & Finance",
    location: "Bangui",
    remote: false,
    experienceLevel: "3-5 ans",
    salaryMin: 350000,
    salaryMax: 500000,
    description: `<p><strong>Ecobank RCA</strong> recherche un(e) <strong>Responsable Comptabilité et Finances</strong> pour renforcer son équipe financière.</p>
<p>Vous superviserez l'ensemble des opérations comptables et financières de la filiale et serez garant de la fiabilité des états financiers.</p>
<h3>Vos missions</h3>
<ul>
<li>Superviser la tenue de la comptabilité générale et analytique</li>
<li>Préparer les états financiers mensuels, trimestriels et annuels</li>
<li>Assurer la conformité avec les normes OHADA et les réglementations BEAC</li>
<li>Gérer la trésorerie et les relations avec les auditeurs</li>
<li>Encadrer une équipe de 3 comptables</li>
<li>Piloter les clôtures comptables et les reportings au siège</li>
</ul>`,
    requirements: `<ul>
<li>BAC+4/5 en Comptabilité, Finance ou DSCG</li>
<li>3 à 5 ans d'expérience dont 2 ans en management</li>
<li>Maîtrise des normes OHADA et SYSCOHADA révisé</li>
<li>Expérience dans le secteur bancaire ou financier souhaitée</li>
<li>Rigueur, sens de l'organisation et discrétion absolue</li>
</ul>`,
    benefits: `<ul>
<li>Package salarial attractif (fixe + variable)</li>
<li>Voiture de fonction</li>
<li>Couverture médicale famille</li>
<li>Plan d'épargne entreprise</li>
</ul>`,
  },

  // ── OCDH Centrafrique ────────────────────────────────────────────────────
  {
    companyEmail: "rh@ocdh-rca.org",
    title: "Coordinateur(trice) de Projet — Protection Communautaire",
    type: "CDD",
    category: "ONG & Humanitaire",
    location: "Bangui",
    remote: false,
    experienceLevel: "3-5 ans",
    salaryMin: 280000,
    salaryMax: 380000,
    description: `<p><strong>OCDH Centrafrique</strong> recrute un(e) <strong>Coordinateur(trice) de Projet — Protection Communautaire</strong> dans le cadre de son programme d'accompagnement des communautés vulnérables en RCA.</p>
<p>Sous la supervision du Directeur des Programmes, vous serez responsable de la mise en œuvre opérationnelle d'un projet de protection communautaire financé par un bailleur international.</p>
<h3>Vos missions</h3>
<ul>
<li>Planifier, coordonner et superviser les activités du projet sur le terrain</li>
<li>Gérer l'équipe terrain (6 agents communautaires) et les partenaires locaux</li>
<li>Assurer le suivi-évaluation et la rédaction des rapports d'activités</li>
<li>Entretenir les relations avec les autorités locales, les bénéficiaires et le bailleur</li>
<li>Gérer le budget du projet et assurer la conformité financière</li>
<li>Représenter l'OCDH lors des réunions de coordination humanitaire (OCHA, clusters)</li>
</ul>`,
    requirements: `<ul>
<li>BAC+4/5 en Sciences sociales, Droit humanitaire, Développement international ou équivalent</li>
<li>3 à 5 ans d'expérience en gestion de projets humanitaires ou de développement en Afrique centrale</li>
<li>Connaissance du contexte sécuritaire et humanitaire en RCA appréciée</li>
<li>Excellentes capacités rédactionnelles en français</li>
<li>Maîtrise des outils de gestion de projet (MS Project, Kobo Toolbox)</li>
<li>Permis de conduire obligatoire</li>
</ul>`,
    benefits: `<ul>
<li>Contrat CDD 12 mois renouvelable selon financement</li>
<li>Per diem pour les déplacements terrain</li>
<li>Assurance vie et rapatriement</li>
<li>Possibilité de formation et de renforcement des capacités</li>
</ul>`,
  },
  {
    companyEmail: "rh@ocdh-rca.org",
    title: "Chargé(e) de Communication et Plaidoyer",
    type: "CDI",
    category: "ONG & Humanitaire",
    location: "Bangui",
    remote: false,
    experienceLevel: "1-3 ans",
    salaryMin: 150000,
    salaryMax: 220000,
    description: `<p><strong>OCDH Centrafrique</strong> recherche un(e) <strong>Chargé(e) de Communication et Plaidoyer</strong> pour renforcer sa visibilité et amplifier son impact en RCA.</p>
<p>Vous serez en charge de la stratégie de communication de l'organisation et contribuerez aux actions de plaidoyer en faveur des droits humains en République Centrafricaine.</p>
<h3>Vos missions</h3>
<ul>
<li>Élaborer et mettre en œuvre la stratégie de communication de l'OCDH</li>
<li>Gérer les réseaux sociaux (Facebook, Twitter/X, LinkedIn) et le site web</li>
<li>Rédiger des communiqués de presse, rapports et articles de sensibilisation</li>
<li>Produire des contenus visuels (infographies, vidéos courtes) pour les campagnes</li>
<li>Organiser des événements de plaidoyer et de sensibilisation</li>
<li>Entretenir les relations avec les médias locaux et les partenaires</li>
</ul>`,
    requirements: `<ul>
<li>BAC+3 en Communication, Journalisme, Sciences politiques ou équivalent</li>
<li>1 à 3 ans d'expérience en communication, idéalement dans le secteur associatif ou humanitaire</li>
<li>Excellentes capacités rédactionnelles et de synthèse en français</li>
<li>Maîtrise des outils graphiques (Canva, Adobe) et des CMS</li>
<li>Sensibilité aux droits humains et connaissance du contexte centrafricain</li>
<li>La connaissance du Sango est un atout majeur</li>
</ul>`,
    benefits: `<ul>
<li>Salaire fixe selon grille salariale OCDH</li>
<li>Environnement de travail engagé et humain</li>
<li>Formations régulières en communication et droits humains</li>
<li>Congés payés et jours fériés RCA respectés</li>
</ul>`,
  },
];

async function main() {
  let created = 0;

  for (const jobData of JOBS) {
    // Trouve l'entreprise via l'email du recruteur
    const user = await prisma.user.findUnique({
      where: { email: jobData.companyEmail },
      include: { company: true },
    });

    if (!user?.company) {
      console.error(`✗ Entreprise introuvable pour ${jobData.companyEmail}`);
      continue;
    }

    const company = user.company;

    // Génère un slug unique
    let jobSlug = slug(jobData.title);
    const existing = await prisma.job.findUnique({ where: { slug: jobSlug } });
    if (existing) jobSlug = `${jobSlug}-${Date.now()}`;

    // Deadline dans 30 jours
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    await prisma.job.create({
      data: {
        companyId: company.id,
        title: jobData.title,
        slug: jobSlug,
        type: jobData.type,
        category: jobData.category,
        location: jobData.location,
        remote: jobData.remote,
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        experienceLevel: jobData.experienceLevel,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: "XAF",
        deadline,
        published: true,
        featured: false,
      },
    });

    console.log(`✓ [${company.name}] "${jobData.title}" publiée`);
    created++;
  }

  console.log(`\n✅ ${created} offre(s) créée(s) avec succès.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
