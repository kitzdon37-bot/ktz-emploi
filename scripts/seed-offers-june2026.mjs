/**
 * seed-offers-june2026.mjs
 * Nouvelles offres d'emploi en RCA trouvées sur UNjobs, Impactpool, ReliefWeb, CCORCA
 * Sources scrapées le 16/05/2026
 * Nouvelles organisations : UNDP, DanChurchAid, COOPI, IRC, UNICEF, IOM,
 *   Solidarités International, IFRC, NRC, WHO/OMS, Welthungerhilfe
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres",
    },
  },
});

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const companies = [
  {
    name: "UNDP – Programme des Nations Unies pour le Développement",
    slug: "undp-rca",
    sector: "Humanitaire & ONG",
    description:
      "Le PNUD œuvre dans près de 170 pays pour éradiquer la pauvreté, réduire les inégalités et renforcer la résilience des populations. En RCA, il appuie la stabilisation, la gouvernance et le développement économique.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/UNDP_logo.svg/640px-UNDP_logo.svg.png",
    website: "https://www.undp.org/fr/central-african-republic",
    location: "Bangui",
    verified: true,
    email: "recrutement-undp-rca@undp.org",
  },
  {
    name: "DanChurchAid",
    slug: "danchurchaid-rca",
    sector: "Humanitaire & ONG",
    description:
      "DanChurchAid (DCA) est une ONG danoise qui travaille à réduire la vulnérabilité des personnes les plus démunies. En RCA, elle intervient dans les domaines de l'aide d'urgence, la résilience et la société civile.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/DanChurchAid_logo.svg/320px-DanChurchAid_logo.svg.png",
    website: "https://www.danchurchaid.org",
    location: "Bangui",
    verified: true,
    email: "jobs-rca@dca.dk",
  },
  {
    name: "COOPI – Cooperazione Internazionale",
    slug: "coopi-rca",
    sector: "Humanitaire & ONG",
    description:
      "COOPI est une ONG italienne fondée en 1965 qui mène des projets humanitaires et de développement dans plus de 30 pays. En RCA, COOPI intervient dans les secteurs de la sécurité alimentaire, la nutrition et la protection.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Coopi_logo.svg/320px-Coopi_logo.svg.png",
    website: "https://www.coopi.org",
    location: "Bangui",
    verified: true,
    email: "rca@coopi.org",
  },
  {
    name: "IRC – International Rescue Committee",
    slug: "irc-rca",
    sector: "Humanitaire & ONG",
    description:
      "L'IRC aide les personnes touchées par les crises humanitaires à survivre, se rétablir et reconstruire leur vie. En RCA, l'IRC apporte une aide d'urgence et des programmes de protection, santé et moyens de subsistance.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/IRC_logo.svg/320px-IRC_logo.svg.png",
    website: "https://www.rescue.org",
    location: "Bangui",
    verified: true,
    email: "emploi-rca@rescue.org",
  },
  {
    name: "UNICEF – Fonds des Nations Unies pour l'Enfance",
    slug: "unicef-rca",
    sector: "Humanitaire & ONG",
    description:
      "UNICEF travaille dans les endroits les plus difficiles pour protéger les enfants les plus défavorisés. En RCA, UNICEF soutient la nutrition, la santé, l'éducation, la protection de l'enfance et l'eau.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/UNICEF_Logo.svg/640px-UNICEF_Logo.svg.png",
    website: "https://www.unicef.org/car/fr",
    location: "Bangui",
    verified: true,
    email: "bgnhr@unicef.org",
  },
  {
    name: "IOM – Organisation Internationale pour les Migrations",
    slug: "iom-rca",
    sector: "Humanitaire & ONG",
    description:
      "L'OIM est l'organisation intergouvernementale de référence dans le domaine des migrations. En RCA, elle gère des programmes de déplacement interne, retour et réintégration des populations déplacées.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/IOM_logo.svg/640px-IOM_logo.svg.png",
    website: "https://www.iom.int",
    location: "Bangui",
    verified: true,
    email: "bangui@iom.int",
  },
  {
    name: "Solidarités International",
    slug: "solidarites-international-rca",
    sector: "Humanitaire & ONG",
    description:
      "Solidarités International est une ONG française spécialisée dans l'aide d'urgence aux populations victimes de conflits et catastrophes. En RCA, elle intervient dans l'eau, l'assainissement et la sécurité alimentaire.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Logo_Solidarit%C3%A9s_International.svg/320px-Logo_Solidarit%C3%A9s_International.svg.png",
    website: "https://www.solidarites.org",
    location: "Bangui",
    verified: true,
    email: "si-rca@solidarites.org",
  },
  {
    name: "IFRC – Fédération Internationale de la Croix-Rouge",
    slug: "ifrc-rca",
    sector: "Humanitaire & ONG",
    description:
      "La Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge soutient les populations vulnérables à travers ses sociétés nationales. En RCA, l'IFRC appuie la Croix-Rouge Centrafricaine.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/IFRC_logo.svg/320px-IFRC_logo.svg.png",
    website: "https://www.ifrc.org",
    location: "Bangui",
    verified: true,
    email: "bangui.delegation@ifrc.org",
  },
  {
    name: "NRC – Norwegian Refugee Council",
    slug: "nrc-rca",
    sector: "Humanitaire & ONG",
    description:
      "Le Conseil Norvégien pour les Réfugiés (NRC) aide les personnes déplacées de force à satisfaire leurs besoins essentiels. En RCA, le NRC intervient dans le shelter, l'éducation, la protection et les moyens de subsistance.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/NRC_logo_RGB.png/320px-NRC_logo_RGB.png",
    website: "https://www.nrc.no",
    location: "Bangui",
    verified: true,
    email: "car@nrc.no",
  },
  {
    name: "OMS – Organisation Mondiale de la Santé",
    slug: "oms-who-rca",
    sector: "Médecine & Santé",
    description:
      "L'OMS est l'autorité directrice et coordinatrice de la santé au sein du système des Nations Unies. En RCA, elle appuie le renforcement du système de santé, la surveillance épidémiologique et la réponse aux urgences sanitaires.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/World_Health_Organization_Logo.svg/500px-World_Health_Organization_Logo.svg.png",
    website: "https://www.afro.who.int/fr/countries/central-african-republic",
    location: "Bangui",
    verified: true,
    email: "carwho@who.int",
  },
  {
    name: "Welthungerhilfe",
    slug: "welthungerhilfe-rca",
    sector: "Humanitaire & ONG",
    description:
      "Welthungerhilfe (WHH) est l'une des plus grandes ONG allemandes d'aide au développement. En RCA, elle intervient dans la sécurité alimentaire, la résilience et le renforcement des capacités locales.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Welthungerhilfe_Logo.svg/320px-Welthungerhilfe_Logo.svg.png",
    website: "https://www.welthungerhilfe.org",
    location: "Bangui",
    verified: true,
    email: "rca@welthungerhilfe.de",
  },
];

// ─── Offres par organisation ───────────────────────────────────────────────────

const offersByCompany = {
  "undp-rca": [
    {
      title: "Roster des Chauffeur(e)s",
      category: "Logistique & Transport",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "JUNIOR",
      description: `Le PNUD en République Centrafricaine recrute des chauffeurs pour son roster afin de répondre aux besoins ponctuels et permanents de transport. Les titulaires seront chargés d'assurer le transport du personnel, des visiteurs et des biens selon les procédures de sécurité en vigueur.\n\nResponsabilités :\n- Conduire les véhicules du PNUD en toute sécurité\n- Assurer l'entretien courant et le suivi des véhicules\n- Tenir un journal de bord rigoureux\n- Respecter les règles de sécurité routière et les procédures internes`,
      requirements: `- Permis de conduire valide (catégorie B minimum)\n- Expérience d'au moins 3 ans comme chauffeur professionnel\n- Connaissance de Bangui et de ses environs\n- Capacité à lire et écrire en français\n- Bonne connaissance des règles de sécurité routière`,
      published: true,
      featured: false,
      deadline: new Date("2026-07-31"),
    },
    {
      title: "Assistant(e) Programme Small Grants",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "JUNIOR",
      description: `Réservé aux ressortissants centrafricains. Le/la titulaire apportera un appui administratif et programmatique au Programme de Petites Subventions (SGP) du PNUD/FEM en RCA.\n\nResponsabilités :\n- Appuyer la gestion administrative des subventions accordées aux OSC\n- Assurer le suivi des rapports des bénéficiaires\n- Préparer les réunions du Comité de pilotage\n- Contribuer à la communication et à la visibilité du programme`,
      requirements: `- Diplôme universitaire (Bac+3 minimum) en gestion, environnement, développement ou domaine connexe\n- Expérience d'au moins 2 ans en gestion de projets ou administration\n- Maîtrise du français ; l'anglais est un atout\n- Bonne maîtrise des outils informatiques (Word, Excel, PowerPoint)\n- Nationalité centrafricaine obligatoire`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
  ],

  "danchurchaid-rca": [
    {
      title: "Coordinateur(trice) Approvisionnement et Logistique",
      category: "Logistique & Transport",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `DanChurchAid recrute un(e) Coordinateur(trice) Approvisionnement et Logistique pour superviser et renforcer les systèmes logistiques dans ses opérations en RCA.\n\nResponsabilités :\n- Superviser la chaîne d'approvisionnement (achats, stockage, transport)\n- Élaborer et mettre à jour les procédures logistiques\n- Former et encadrer l'équipe logistique nationale\n- Assurer la conformité avec les politiques DCA et des bailleurs\n- Coordonner avec les équipes terrain à Bangui et sur les bases`,
      requirements: `- Diplôme en logistique, gestion de la chaîne d'approvisionnement ou domaine connexe\n- Minimum 5 ans d'expérience en logistique humanitaire\n- Expérience en contexte de crise ou post-conflit\n- Maîtrise du français ; anglais professionnel requis\n- Expérience avec les bailleurs (ECHO, BHA, SDC) un atout`,
      published: true,
      featured: true,
      deadline: new Date("2026-06-10"),
    },
  ],

  "coopi-rca": [
    {
      title: "Chef de Mission RCA",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `COOPI Cooperazione Internazionale recherche un(e) Chef de Mission pour sa mission en République Centrafricaine. Le/la titulaire sera responsable de la représentation de COOPI, de la coordination des programmes et de la gestion globale de la mission.\n\nResponsabilités :\n- Assurer la représentation institutionnelle de COOPI auprès des autorités et des partenaires\n- Piloter la stratégie pays et le développement programmatique\n- Superviser les chefs de projet et les équipes terrain\n- Gérer la sécurité du personnel et des opérations\n- Identifier de nouvelles opportunités de financement`,
      requirements: `- Master en coopération internationale, sciences politiques, gestion humanitaire ou équivalent\n- Minimum 7 ans d'expérience en ONG internationale dont 3 en poste de direction\n- Expérience en gestion de programmes multi-sectoriels (sécurité alimentaire, nutrition, protection)\n- Excellente maîtrise du français ; l'anglais et l'italien sont des atouts\n- Expérience en contexte sécuritaire complexe`,
      published: true,
      featured: true,
      deadline: new Date("2026-06-15"),
    },
  ],

  "irc-rca": [
    {
      title: "Officier Activités Génératrices de Revenus (AGR)",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "INTERMEDIATE",
      description: `L'IRC recrute un(e) Officier AGR pour appuyer les programmes de moyens de subsistance et de relèvement économique dans ses zones d'intervention en RCA.\n\nResponsabilités :\n- Identifier les bénéficiaires et évaluer leurs besoins en AGR\n- Organiser et animer des formations en gestion des petites entreprises\n- Appuyer la mise en place d'épargnes communautaires (VSLA)\n- Assurer le suivi et l'accompagnement des bénéficiaires\n- Produire des rapports de qualité sur les activités`,
      requirements: `- Bac+3 en économie, développement rural, gestion ou domaine connexe\n- Minimum 3 ans d'expérience dans des programmes AGR ou de moyens de subsistance\n- Bonne connaissance du contexte économique centrafricain\n- Capacité à travailler en milieu rural et en contexte de déplacement\n- Maîtrise du français ; le Sango est un atout`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
    {
      title: "Officière Psychosociale",
      category: "Médecine & Santé",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "INTERMEDIATE",
      description: `L'IRC recrute des Officières Psychosociales pour son programme de protection en RCA, notamment pour accompagner les survivant(e)s de violences basées sur le genre.\n\nResponsabilités :\n- Fournir un soutien psychosocial individuel et en groupe aux bénéficiaires\n- Conduire des séances de Case Management pour les survivantes de VBG\n- Orienter les bénéficiaires vers les services appropriés (santé, juridique)\n- Animer des activités psychosociales dans les espaces sûrs\n- Participer aux activités de sensibilisation communautaire`,
      requirements: `- Formation en psychologie, travail social ou santé mentale\n- Expérience en accompagnement psychosocial, idéalement en contexte humanitaire\n- Sensibilité aux questions de genre et de protection\n- Capacité d'écoute active et de gestion des cas sensibles\n- Maîtrise du français et du Sango`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
    {
      title: "Officier Accès Humanitaire et Sécurité",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `L'IRC recherche un(e) Officier Accès Humanitaire et Sécurité pour faciliter l'accès aux populations vulnérables dans un contexte de crise complexe en RCA.\n\nResponsabilités :\n- Analyser le contexte sécuritaire et identifier les risques pour les opérations IRC\n- Développer et maintenir des relations avec les acteurs armés et communautaires\n- Former le personnel sur les procédures de sécurité et d'accès humanitaire\n- Rédiger des rapports de situation sécuritaire et des analyses de risques\n- Appuyer la négociation d'accès dans les zones d'intervention`,
      requirements: `- Diplôme en sciences politiques, relations internationales, sécurité ou domaine connexe\n- Minimum 5 ans d'expérience en gestion de la sécurité ou accès humanitaire\n- Connaissance approfondie du contexte centrafricain\n- Excellentes compétences en analyse, négociation et communication\n- Maîtrise du français ; connaissance du Sango fortement souhaitée`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
  ],

  "unicef-rca": [
    {
      title: "Manager Approvisionnement et Logistique P-4",
      category: "Logistique & Transport",
      type: "CDI",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `L'UNICEF recrute un(e) Supply & Logistics Manager (P-4) pour diriger la chaîne d'approvisionnement de ses programmes en RCA.\n\nResponsabilités :\n- Diriger la planification et l'exécution de l'approvisionnement pour tous les secteurs programmatiques\n- Gérer les entrepôts, stocks et distribution de fournitures essentielles (médicales, scolaires, WASH)\n- Superviser une équipe supply chain nationale et internationale\n- Assurer la conformité avec les règles et règlements de l'UNICEF\n- Renforcer les capacités du gouvernement centrafricain en gestion logistique`,
      requirements: `- Master en gestion de la chaîne logistique, commerce international ou domaine connexe\n- Minimum 8 ans d'expérience en supply chain, dont 5 en contexte humanitaire\n- Expérience avec les systèmes ONU (VISION/SAP) un atout\n- Leadership et compétences managériales avérées\n- Maîtrise du français et de l'anglais (niveau professionnel obligatoire)`,
      published: true,
      featured: true,
      deadline: new Date("2026-06-01"),
    },
  ],

  "iom-rca": [
    {
      title: "Officier TIC (Technologie de l'Information et Communication)",
      category: "Informatique & Télécoms",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "INTERMEDIATE",
      description: `L'OIM recrute un(e) Officier TIC pour soutenir les opérations informatiques de la mission en RCA.\n\nResponsabilités :\n- Assurer le support technique du matériel informatique et des réseaux\n- Gérer l'infrastructure IT de la mission (serveurs, réseaux, téléphonie)\n- Appuyer le déploiement des systèmes d'information de l'OIM\n- Former le personnel aux outils informatiques\n- Assurer la sécurité des données et la continuité des systèmes`,
      requirements: `- Diplôme en informatique, télécommunications ou domaine connexe\n- Minimum 3 ans d'expérience en support IT, idéalement en contexte humanitaire\n- Connaissance des systèmes Windows Server, réseaux LAN/WAN, VPN\n- Capacité à travailler sous pression et en autonomie\n- Maîtrise du français ; l'anglais est un atout`,
      published: true,
      featured: false,
      deadline: new Date("2026-07-15"),
    },
    {
      title: "Officier Sécurité Terrain (Expédié)",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "INTERMEDIATE",
      description: `L'OIM recrute de manière urgente un(e) Officier Sécurité Terrain pour renforcer la sécurité des opérations et du personnel en RCA.\n\nResponsabilités :\n- Effectuer des évaluations régulières des risques de sécurité dans les zones d'opération\n- Rédiger et diffuser les briefings et rapports de sécurité\n- Assurer la gestion des incidents de sécurité\n- Former le personnel sur les procédures de sécurité\n- Coordonner avec UNDSS et les autres acteurs sécuritaires`,
      requirements: `- Formation en sécurité, gestion des risques ou domaine militaire/police\n- Minimum 4 ans d'expérience en gestion de sécurité en contexte humanitaire\n- Certification SSAFE ou HEIST est un atout\n- Excellente capacité d'analyse et de rédaction de rapports\n- Maîtrise du français obligatoire`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-15"),
    },
  ],

  "solidarites-international-rca": [
    {
      title: "Directeur(trice) de Zone Opérationnelle",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `Solidarités International recrute un(e) Directeur/trice de Zone Opérationnelle pour piloter ses opérations en RCA. Poste à pourvoir dès que possible, CDD 6 mois.\n\nResponsabilités :\n- Assurer la représentation de SI auprès des autorités locales et partenaires humanitaires\n- Superviser la mise en œuvre des programmes WASH et sécurité alimentaire\n- Gérer les équipes et ressources sur la zone\n- Garantir la sécurité du personnel et des biens\n- Contribuer à la stratégie pays et à la recherche de financement`,
      requirements: `- Master en gestion humanitaire, sciences politiques ou domaine connexe\n- Minimum 6 ans d'expérience en gestion opérationnelle dans une ONG internationale\n- Expérience WASH ou sécurité alimentaire fortement souhaitée\n- Solides compétences en gestion d'équipes multiculturelles\n- Maîtrise du français ; anglais professionnel souhaité`,
      published: true,
      featured: true,
      deadline: new Date("2026-06-20"),
    },
  ],

  "ifrc-rca": [
    {
      title: "Manager de Consortium SECURE",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `La Fédération Internationale de la Croix-Rouge recrute un(e) Manager de Consortium pour piloter le programme SECURE (Sécurité, Emploi, Communauté, Urgences, Résilience, Environnement) en RCA.\n\nResponsabilités :\n- Coordonner les activités des membres du consortium\n- Assurer la gestion fiduciaire et programmatique du projet\n- Animer les instances de gouvernance du consortium\n- Assurer les relations avec le bailleur et les parties prenantes\n- Superviser le MEAL du programme`,
      requirements: `- Master en gestion de projets, développement international ou domaine connexe\n- Minimum 7 ans d'expérience dont 3 en gestion de consortium\n- Connaissance du secteur de la résilience et développement en Afrique subsaharienne\n- Excellentes compétences relationnelles et de coordination\n- Maîtrise du français et de l'anglais`,
      published: true,
      featured: false,
      deadline: new Date("2026-07-01"),
    },
    {
      title: "Officier Senior Autonomisation Socio-Économique",
      category: "Humanitaire & ONG",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `La Fédération Internationale de la Croix-Rouge recrute un(e) Officier Senior en charge de l'autonomisation socio-économique dans le cadre de ses programmes en RCA.\n\nResponsabilités :\n- Concevoir et mettre en œuvre des activités de renforcement économique des ménages vulnérables\n- Encadrer des équipes terrain et des volontaires Croix-Rouge centrafricaine\n- Développer des partenariats avec les acteurs économiques locaux\n- Assurer la capitalisation et la documentation des bonnes pratiques\n- Contribuer au développement de nouveaux projets`,
      requirements: `- Bac+4 en économie, développement social ou domaine connexe\n- Minimum 5 ans d'expérience dans des programmes de développement économique\n- Maîtrise des approches VSLA, cash programming, AGR\n- Capacité à travailler avec des populations vulnérables\n- Maîtrise du français ; connaissance du Sango souhaitée`,
      published: true,
      featured: false,
      deadline: new Date("2026-07-01"),
    },
  ],

  "nrc-rca": [
    {
      title: "Assistant(e) Technique Abri (Shelter)",
      category: "BTP & Construction",
      type: "CDD",
      location: "Kaga Bandoro",
      experienceLevel: "JUNIOR",
      description: `Le Conseil Norvégien pour les Réfugiés (NRC) recrute un(e) Assistant(e) Technique Shelter pour appuyer son programme d'abri dans la région de Kaga Bandoro.\n\nResponsabilités :\n- Évaluer les besoins en abri des ménages déplacés et retournés\n- Superviser les constructions et réhabilitations de structures d'abri\n- Former les bénéficiaires aux techniques de construction\n- Assurer le contrôle qualité des réalisations\n- Produire les rapports d'avancement des travaux`,
      requirements: `- Diplôme en génie civil, architecture ou BTP\n- Expérience d'au moins 2 ans dans un projet d'abri ou de construction\n- Capacité à travailler en milieu rural éloigné\n- Maîtrise du français ; connaissance du Sango et du contexte local appréciée\n- Permis de conduire (moto) souhaité`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
  ],

  "oms-who-rca": [
    {
      title: "Consultant National Senior en Coordination de la Santé",
      category: "Médecine & Santé",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `L'OMS en RCA recrute un(e) Consultant(e) National(e) Senior pour appuyer la coordination des activités de santé dans le pays.\n\nResponsabilités :\n- Appuyer la coordination des partenaires du secteur santé (cluster santé)\n- Contribuer à l'élaboration des plans de réponse sanitaire\n- Assurer la compilation et analyse des données épidémiologiques\n- Rédiger des rapports techniques et des notes de situation\n- Faciliter les échanges entre le Ministère de la Santé et les partenaires`,
      requirements: `- Diplôme en médecine, santé publique ou épidémiologie (Bac+5 minimum)\n- Minimum 5 ans d'expérience en santé publique ou coordination humanitaire\n- Excellente connaissance du système de santé centrafricain\n- Maîtrise des outils de gestion de données (Excel, DHIS2)\n- Nationalité centrafricaine ou résidence en RCA obligatoire`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-15"),
    },
  ],

  "welthungerhilfe-rca": [
    {
      title: "Consultant — Évaluation des Procédures de Gestion de Stock",
      category: "Logistique & Transport",
      type: "Freelance",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `Welthungerhilfe recrute un(e) consultant(e) pour évaluer les procédures de gestion de stock dans le cadre de ses projets en RCA. La mission couvrira les sites de Bangui, Bouar, Birao et Ndjoukou.\n\nMission :\n- Analyser les procédures actuelles de gestion des stocks de WHH en RCA\n- Identifier les forces, faiblesses et risques du système actuel\n- Proposer des recommandations concrètes et un plan d'amélioration\n- Livrer un rapport détaillé avec des outils pratiques\n\nDurée estimée : 15-20 jours`,
      requirements: `- Expert en gestion logistique et des stocks en contexte humanitaire\n- Minimum 8 ans d'expérience, dont plusieurs missions de conseil\n- Expérience avec les systèmes d'inventaire et procédures ONG\n- Disponibilité pour des déplacements sur plusieurs sites en RCA\n- Maîtrise du français obligatoire`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-30"),
    },
  ],
};

// ─── Offres supplémentaires pour les orgas déjà existantes ────────────────────
// FAO : Expert vétérinaire (nouveau poste)
// WCS : Conservation Pilot
// PUI : Logisticien-Administrateur

const extraOffersByExistingSlug = [
  {
    companySlug: "fao-rca",
    offer: {
      title: "Expert(e) National(e) en Médecine Vétérinaire",
      category: "Agriculture & Élevage",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `La FAO recrute un(e) Expert(e) National(e) en médecine vétérinaire pour appuyer ses programmes d'élevage et de santé animale en République Centrafricaine.\n\nResponsabilités :\n- Appuyer les campagnes de vaccination et de contrôle des maladies animales\n- Renforcer les capacités des services vétérinaires gouvernementaux\n- Superviser les activités de terrain dans les zones d'élevage\n- Contribuer à l'élaboration des politiques et plans nationaux d'élevage\n- Produire des rapports techniques de qualité`,
      requirements: `- Diplôme de vétérinaire (Doctorat vétérinaire ou équivalent)\n- Minimum 5 ans d'expérience en santé animale ou élevage en Afrique subsaharienne\n- Connaissance du système vétérinaire centrafricain souhaitée\n- Maîtrise du français ; l'anglais est un atout\n- Nationalité centrafricaine ou résidence en RCA`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-01"),
    },
  },
  {
    companySlug: "wcs-rca",
    offer: {
      title: "Pilote Conservation Aérienne",
      category: "Environnement & Agriculture",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "SENIOR",
      description: `Wildlife Conservation Society (WCS) recrute un(e) Pilote Conservation pour ses opérations de surveillance aérienne des parcs nationaux et réserves en RCA.\n\nResponsabilités :\n- Piloter des avions légers pour les missions de surveillance des parcs\n- Appuyer les opérations anti-braconnage et de monitoring de la faune\n- Assurer la maintenance courante des aéronefs\n- Former des pilotes locaux si nécessaire\n- Respecter les protocoles de sécurité aérienne`,
      requirements: `- Licence de pilote professionnel (CPL) valide\n- Minimum 1 500 heures de vol dont 500 en Afrique ou contexte difficile\n- Expérience en navigation VFR dans des zones sans infrastructure\n- Qualification multi-moteur souhaitée\n- Maîtrise du français ou de l'anglais`,
      published: true,
      featured: false,
      deadline: new Date("2026-07-31"),
    },
  },
  {
    companySlug: "pui-rca",
    offer: {
      title: "Logisticien(ne)-Administrateur(trice)",
      category: "Logistique & Transport",
      type: "CDD",
      location: "Bangui",
      experienceLevel: "INTERMEDIATE",
      description: `Première Urgence Internationale recrute un(e) Logisticien(ne)-Administrateur(trice) pour renforcer la gestion opérationnelle de sa mission en RCA. Poste à pourvoir à partir du 1er juin 2026.\n\nResponsabilités :\n- Gérer les achats, stocks et équipements de la mission\n- Assurer l'administration RH (contrats, paie, congés) du personnel national\n- Superviser la gestion des véhicules et du parc informatique\n- Contribuer à l'élaboration et au suivi du budget administratif\n- Veiller au respect des procédures PUI et des bailleurs`,
      requirements: `- Formation en logistique humanitaire et/ou administration\n- Minimum 3 ans d'expérience combinée en logistique et administration en ONG\n- Connaissance des procédures ECHO, CDCS/BHA souhaitée\n- Rigueur, polyvalence et sens de l'organisation\n- Maîtrise du français ; anglais fonctionnel`,
      published: true,
      featured: false,
      deadline: new Date("2026-06-20"),
    },
  },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Début du seed — nouvelles offres juin 2026\n");

  // Compte de service partagé pour toutes les nouvelles orgas
  const password = await bcrypt.hash("RecruteurRCA2026!", 10);

  let totalCompanies = 0;
  let totalJobs = 0;

  for (const co of companies) {
    console.log(`\n📌 Organisation : ${co.name}`);

    // Créer ou récupérer l'utilisateur recruteur
    const user = await prisma.user.upsert({
      where: { email: co.email },
      update: {},
      create: {
        email: co.email,
        name: co.name,
        password,
        role: "EMPLOYER",
      },
    });

    // Créer ou mettre à jour la company
    const company = await prisma.company.upsert({
      where: { slug: co.slug },
      update: {
        logo: co.logo,
        description: co.description,
        website: co.website,
        verified: co.verified,
      },
      create: {
        name: co.name,
        slug: co.slug,
        sector: co.sector,
        description: co.description,
        logo: co.logo,
        website: co.website,
        location: co.location,
        verified: co.verified,
        userId: user.id,
      },
    });

    console.log(`   ✅ Company créée/mise à jour : ${company.name}`);
    totalCompanies++;

    // Ajouter les offres
    const offers = offersByCompany[co.slug] ?? [];
    for (const offer of offers) {
      const slug = slugify(offer.title) + "-" + co.slug;
      await prisma.job.upsert({
        where: { slug },
        update: { published: true },
        create: {
          ...offer,
          slug,
          companyId: company.id,
          remote: false,
          benefits: "Couverture médicale · Per diem terrain · Formation continue",
        },
      });
      console.log(`   📋 Offre : ${offer.title}`);
      totalJobs++;
    }
  }

  // ── Offres supplémentaires pour les orgas existantes ──────────────────────
  console.log("\n\n📌 Offres supplémentaires pour organisations existantes");
  for (const { companySlug, offer } of extraOffersByExistingSlug) {
    const company = await prisma.company.findUnique({ where: { slug: companySlug } });
    if (!company) {
      console.log(`   ⚠️  Company introuvable : ${companySlug} — offre ignorée`);
      continue;
    }
    const slug = slugify(offer.title) + "-" + companySlug;
    await prisma.job.upsert({
      where: { slug },
      update: { published: true },
      create: {
        ...offer,
        slug,
        companyId: company.id,
        remote: false,
        benefits: "Couverture médicale · Per diem terrain · Formation continue",
      },
    });
    console.log(`   📋 ${company.name} — ${offer.title}`);
    totalJobs++;
  }

  console.log(`\n✅ Seed terminé : ${totalCompanies} nouvelles organisations, ${totalJobs} nouvelles offres.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
