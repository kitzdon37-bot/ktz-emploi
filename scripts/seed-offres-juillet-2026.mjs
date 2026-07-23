/**
 * Seed — Offres d'emploi RCA juillet 2026
 * Sources : unjobs.org, reliefweb.int
 * node scripts/seed-offres-juillet-2026.mjs
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Génère un slug unique à partir d'un titre
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

// Hash simple pour le mot de passe des comptes fictifs
function fakeHash(email) {
  return "$2b$10$" + createHash("sha256").update(email).digest("hex").substring(0, 53);
}

// ─── Organisations ──────────────────────────────────────────────────────────
const ORGS = [
  {
    email:   "recrutement@iom-rca.org",
    name:    "OIM — Organisation Internationale pour les Migrations",
    slug:    "oim-organisation-internationale-migrations",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/3/3c/IOM_logo.png",
    website: "https://www.iom.int",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "L'Organisation Internationale pour les Migrations (OIM) est une organisation " +
      "intergouvernementale fondée en 1951. Présente en République Centrafricaine, elle " +
      "mène des programmes de réponse aux crises, stabilisation communautaire, santé des " +
      "migrants et gestion des déplacements.",
    verified: true,
  },
  {
    email:   "recrutement@minusca.unmissions.org",
    name:    "MINUSCA — Mission Multidimensionnelle de l'ONU en RCA",
    slug:    "minusca-mission-onu-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website: "https://minusca.unmissions.org",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "La MINUSCA est la mission de maintien de la paix des Nations Unies en République " +
      "Centrafricaine, créée en 2014. Elle emploie des civils, militaires et policiers " +
      "pour protéger les populations et soutenir le processus de paix.",
    verified: true,
  },
  {
    email:   "rh@ifrc-rca.org",
    name:    "FICR — Fédération Internationale de la Croix-Rouge",
    slug:    "ficr-federation-internationale-croix-rouge",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/5/55/IFRC_logo.svg",
    website: "https://www.ifrc.org",
    sector:  "Médecine & Santé",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "La Fédération Internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge " +
      "coordonne l'action humanitaire internationale dans des situations d'urgence et " +
      "renforce les capacités des sociétés nationales, dont la Croix-Rouge de RCA.",
    verified: true,
  },
  {
    email:   "rh@wfp-bangui.org",
    name:    "PAM — Programme Alimentaire Mondial",
    slug:    "pam-programme-alimentaire-mondial",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/5/5b/World-food-programme-logo.gif",
    website: "https://www.wfp.org",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "Le Programme Alimentaire Mondial (PAM / WFP) est la plus grande organisation " +
      "humanitaire au monde luttant contre la faim. En RCA, il apporte une aide alimentaire " +
      "à des millions de personnes affectées par les conflits et les déplacements.",
    verified: true,
  },
  {
    email:   "rh@undp-rca.org",
    name:    "PNUD — Programme des Nations Unies pour le Développement",
    slug:    "pnud-programme-nations-unies-developpement",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/e4/UNDP_logo.svg",
    website: "https://www.undp.org/fr/central-african-republic",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "Le PNUD soutient la République Centrafricaine dans ses efforts de développement " +
      "durable, de gouvernance, de relèvement post-conflit et de lutte contre la pauvreté. " +
      "Il finance des projets dans l'énergie, la justice, l'environnement et l'économie.",
    verified: true,
  },
  {
    email:   "rh@unicef-rca.org",
    name:    "UNICEF — Fonds des Nations Unies pour l'Enfance",
    slug:    "unicef-fonds-nations-unies-enfance",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/f/f4/UNICEF_Logo.png",
    website: "https://www.unicef.org/car",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "L'UNICEF travaille en République Centrafricaine pour protéger les droits des enfants " +
      "et améliorer leur survie, développement et protection dans les domaines de l'éducation, " +
      "la santé, la nutrition, l'eau et la protection de l'enfance.",
    verified: true,
  },
  {
    email:   "rh@street-child-rca.org",
    name:    "Street Child",
    slug:    "street-child-rca",
    logo:    "https://www.street-child.org/wp-content/uploads/2021/05/Street-Child-logo.png",
    website: "https://www.street-child.org",
    sector:  "Éducation & Formation",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "Street Child œuvre pour garantir aux enfants les plus vulnérables un accès à " +
      "l'éducation et une protection adaptée. En RCA, l'organisation soutient " +
      "l'intégration de ses méthodes pédagogiques dans le système éducatif national.",
    verified: true,
  },
];

// ─── Offres d'emploi ────────────────────────────────────────────────────────
const JOBS_DATA = [

  // ── IOM ───────────────────────────────────────────────────────────────────
  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) des Finances Nationale (2 postes)",
    category: "Comptabilité & Audit",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: true,
    description:
      "L'OIM recrute deux Chargé(e)s des Finances Nationale pour son bureau de Bangui. " +
      "Le titulaire assurera la gestion quotidienne des opérations financières et comptables, " +
      "les clôtures mensuelles, les réconciliations bancaires, la gestion de trésorerie, " +
      "la supervision budgétaire et l'encadrement de l'équipe comptable.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Tenir la comptabilité journalière selon les normes IOM\n" +
      "- Préparer les clôtures mensuelles et les rapports financiers\n" +
      "- Effectuer les réconciliations bancaires\n" +
      "- Assurer la gestion de la trésorerie et le contrôle budgétaire\n" +
      "- Superviser et former l'équipe comptable locale\n" +
      "- Veiller au respect des procédures internes et des réglementations locales",
    requirements:
      "- Master en comptabilité, économie, administration ou gestion des affaires " +
      "(ou Licence équivalente avec 2 ans d'expérience pertinente)\n" +
      "- Expérience professionnelle documentée en comptabilité ou administration\n" +
      "- Excellentes compétences organisationnelles et analytiques\n" +
      "- Maîtrise avancée d'Excel et des logiciels comptables\n" +
      "- Français courant (oral et écrit) ; connaissance de l'anglais appréciée\n" +
      "- Adhésion aux valeurs IOM : inclusion, intégrité, professionnalisme, courage, empathie",
    benefits:
      "- Contrat national IOM avec avantages sociaux\n" +
      "- Environnement de travail multiculturel et international\n" +
      "- Formation continue et développement professionnel",
    sourceUrl: "https://unjobs.org/vacancies/1783449071636",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) du Suivi, Évaluation et Reporting (MEL)",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: true,
    description:
      "L'OIM recherche un(e) Chargé(e) du Suivi, Évaluation et Reporting pour ses " +
      "programmes de stabilisation communautaire en RCA. Le poste soutient les fonctions " +
      "de monitoring, évaluation et reporting dans des contextes de post-conflit.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Développer des cadres et outils de suivi-évaluation\n" +
      "- Coordonner la collecte de données et tenir à jour les bases de données\n" +
      "- Préparer les rapports destinés aux bailleurs de fonds\n" +
      "- Conduire des missions de terrain pour le suivi des activités\n" +
      "- Renforcer les capacités du personnel et des partenaires\n" +
      "- Assurer l'alignement des rapports avec les exigences des donateurs",
    requirements:
      "- Master dans un domaine pertinent avec 2 ans d'expérience, " +
      "ou Licence avec 4 ans d'expérience\n" +
      "- Expérience en coordination avec différentes unités programmatiques\n" +
      "- Solide connaissance de la gestion axée sur les résultats (GAR)\n" +
      "- Expérience en contexte migratoire, développement ou post-conflit\n" +
      "- Anglais et français courants (oral et écrit)\n" +
      "- Maîtrise des outils de collecte de données (KoboToolbox, ODK)",
    benefits:
      "- Poste international OIM avec package complet\n" +
      "- Indemnité de poste difficile applicable\n" +
      "- Opportunités de formation et missions terrain",
    sourceUrl: "https://unjobs.org/vacancies/1783207383708",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) de Programme — Santé Mentale et Soutien Psychosocial (MHPSS)",
    category: "Médecine & Santé",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute un(e) Chargé(e) de Programme spécialisé(e) en Santé Mentale et " +
      "Soutien Psychosocial (MHPSS) pour ses centres de transit à Bangui. Le titulaire " +
      "coordonnera et mettra en œuvre les activités MHPSS au profit des migrants et " +
      "populations vulnérables.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Coordonner et mettre en œuvre les activités MHPSS dans les centres de transit\n" +
      "- Superviser le personnel clinique et les prestataires de services\n" +
      "- Développer des protocoles adaptés au contexte local\n" +
      "- Assurer la prestation de services psychosociaux directs\n" +
      "- Renforcer les capacités du personnel local\n" +
      "- Rédiger des rapports d'activités et assurer le reporting",
    requirements:
      "- Master en psychologie clinique, travail social, psychiatrie ou domaine connexe " +
      "(avec 2 ans d'expérience), ou Licence (avec 4 ans d'expérience)\n" +
      "- Expérience en programmation MHPSS dans des contextes humanitaires ou migratoires\n" +
      "- Expérience en prestation directe de services psychosociaux\n" +
      "- Expérience avec les migrants ou populations vulnérables\n" +
      "- Expérience en supervision et renforcement de capacités\n" +
      "- Anglais et français courants",
    benefits:
      "- Contrat OIM avec avantages complets\n" +
      "- Formation spécialisée MHPSS\n" +
      "- Impact direct sur les populations vulnérables",
    sourceUrl: "https://unjobs.org/vacancies/1783207432893",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) de Données et de Stabilisation",
    category: "Informatique & Télécoms",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM cherche un(e) Chargé(e) de Données et de Stabilisation pour ses opérations " +
      "de suivi des déplacements (DTM) et de stabilisation en RCA. Le rôle consiste à " +
      "superviser la collecte, l'analyse et le reporting de données sur les dynamiques " +
      "de déplacement et les solutions durables.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Appuyer techniquement la mise en œuvre du DTM et des enquêtes associées\n" +
      "- Assurer le contrôle qualité des données collectées\n" +
      "- Développer des produits analytiques : tableaux de bord, cartes, rapports\n" +
      "- Renforcer les capacités du personnel sur les standards de données\n" +
      "- Veiller au respect des principes de protection des données",
    requirements:
      "- Master en informatique, statistiques, ingénierie ou domaine connexe " +
      "(avec 2 ans d'expérience) ou Licence (avec 4 ans)\n" +
      "- Maîtrise des outils de collecte mobile de données (KoboToolbox, ODK)\n" +
      "- Maîtrise des logiciels statistiques : Python, R, Stata ou SPSS\n" +
      "- Expérience en gestion et analyse de bases de données\n" +
      "- Anglais et français courants",
    benefits:
      "- Poste OIM avec indemnité de poste difficile\n" +
      "- Travail sur des données humanitaires à fort impact\n" +
      "- Formation continue aux outils de données",
    sourceUrl: "https://unjobs.org/vacancies/1783207480259",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) du Développement et Reporting de Projets",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute un(e) Chargé(e) du Développement et Reporting de Projets pour " +
      "renforcer son portefeuille de projets en RCA. Le titulaire coordonnera la " +
      "rédaction de propositions de projets, assurera la liaison avec les bailleurs " +
      "et produira des rapports de qualité.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Coordonner la rédaction et la soumission de propositions de projets\n" +
      "- Assurer la liaison avec les partenaires financiers\n" +
      "- Préparer et consolider les rapports programmatiques et financiers\n" +
      "- Suivre le calendrier de reporting et les obligations contractuelles\n" +
      "- Appuyer le développement de la stratégie programme de la mission",
    requirements:
      "- Master en relations internationales, développement ou domaine connexe " +
      "(avec 2 ans d'expérience) ou Licence (avec 4 ans)\n" +
      "- Expérience confirmée en rédaction de rapports pour bailleurs dans " +
      "des contextes humanitaires ou de développement\n" +
      "- Connaissance de la gestion de subventions et des processus bailleurs\n" +
      "- Maîtrise de la gestion axée sur les résultats\n" +
      "- Anglais et français courants",
    benefits:
      "- Package OIM complet\n" +
      "- Exposition à des bailleurs majeurs (UE, USAID, etc.)\n" +
      "- Environnement multiculturel",
    sourceUrl: "https://unjobs.org/vacancies/1783207515450",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Médecin en Santé des Migrants (2 postes)",
    category: "Médecine & Santé",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute deux Médecins en Santé des Migrants pour renforcer son équipe " +
      "médicale à Bangui. Les titulaires assureront la prise en charge médicale des " +
      "migrants et personnes déplacées accueillis dans les centres de transit.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Fournir des soins médicaux directs aux migrants et personnes déplacées\n" +
      "- Effectuer les évaluations médicales pré-départ et à l'arrivée\n" +
      "- Gérer les cas de maladies chroniques et infections transmissibles\n" +
      "- Superviser le personnel infirmier et paramédical\n" +
      "- Assurer la vaccination et la santé préventive\n" +
      "- Produire des rapports médicaux réguliers",
    requirements:
      "- Diplôme de médecine (MD ou équivalent) reconnu\n" +
      "- Expérience en médecine de terrain, humanitaire ou en contexte de déplacement\n" +
      "- Connaissance des protocoles de santé en situation d'urgence\n" +
      "- Capacité à travailler sous pression dans des environnements difficiles\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Contrat OIM avec avantages médicaux\n" +
      "- Formation spécialisée en santé des migrants\n" +
      "- Impact direct sur des populations vulnérables",
    sourceUrl: "https://unjobs.org/vacancies/1782686619954",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Associé(e) MHPSS — Appui Psychosocial",
    category: "Médecine & Santé",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "L'OIM recrute un(e) Associé(e) MHPSS pour appuyer les activités de soutien " +
      "psychosocial auprès des migrants et déplacés internes en RCA. Sous la supervision " +
      "du Chargé de Programme MHPSS, le titulaire participera à la mise en œuvre des " +
      "interventions psychosociales sur le terrain.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Conduire des séances de soutien psychosocial individuel et en groupe\n" +
      "- Identifier et référer les cas nécessitant une prise en charge spécialisée\n" +
      "- Participer aux évaluations psychosociales dans les centres de transit\n" +
      "- Documenter et assurer le suivi des cas\n" +
      "- Participer aux réunions de coordination MHPSS",
    requirements:
      "- Licence en psychologie, travail social ou domaine connexe\n" +
      "- Expérience en appui psychosocial en contexte humanitaire\n" +
      "- Sensibilité interculturelle et capacité d'adaptation\n" +
      "- Français courant ; connaissance du Sango appréciée",
    benefits:
      "- Expérience terrain avec l'une des plus grandes organisations humanitaires\n" +
      "- Formation MHPSS certifiée\n" +
      "- Évolution possible au sein de l'IOM",
    sourceUrl: "https://unjobs.org/vacancies/1782686656383",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) MEAL (Suivi, Évaluation, Apprentissage)",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "L'OIM recherche un(e) Chargé(e) MEAL pour ses programmes en RCA. Le rôle consiste " +
      "à mettre en place des systèmes de suivi et d'évaluation robustes, à collecter " +
      "et analyser des données programmatiques, et à produire des rapports d'apprentissage.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Concevoir et mettre en place des outils MEAL\n" +
      "- Organiser et conduire les collectes de données terrain\n" +
      "- Analyser les données et produire des rapports d'avancement\n" +
      "- Assurer la redevabilité envers les populations bénéficiaires (AAP)\n" +
      "- Contribuer aux évaluations mi-parcours et finales",
    requirements:
      "- Licence ou Master en statistiques, sciences sociales ou domaine connexe\n" +
      "- Expérience en MEAL dans un contexte humanitaire ou de développement\n" +
      "- Maîtrise d'Excel, KoboToolbox ou outils similaires\n" +
      "- Rigueur analytique et bonne capacité de rédaction\n" +
      "- Français courant ; anglais apprécié",
    benefits: "- Poste terrain avec impact direct\n- Formation continue MEAL",
    sourceUrl: "https://unjobs.org/vacancies/1782506506238",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Ingénieur(e) de Construction",
    category: "BTP & Construction",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute un(e) Ingénieur(e) de Construction pour superviser ses projets " +
      "d'infrastructure en RCA, notamment la réhabilitation d'abris, de points d'eau " +
      "et d'équipements communautaires dans des zones affectées par les déplacements.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Superviser les travaux de construction et réhabilitation\n" +
      "- Évaluer les besoins en infrastructure dans les zones de déplacement\n" +
      "- Préparer les cahiers des charges et dossiers d'appel d'offres\n" +
      "- Contrôler la qualité des travaux et la conformité aux normes\n" +
      "- Gérer les relations avec les entrepreneurs locaux",
    requirements:
      "- Diplôme d'ingénieur en génie civil, architecture ou domaine connexe\n" +
      "- Expérience en gestion de projets de construction dans des contextes humanitaires\n" +
      "- Connaissance des normes de construction en contexte tropical\n" +
      "- Capacité à travailler en zone difficile d'accès\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Poste terrain avec déplacements en province\n" +
      "- Indemnité de poste difficile\n" +
      "- Projets à fort impact social",
    sourceUrl: "https://unjobs.org/vacancies/1782458901172",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Coordinateur/trice de l'Unité d'Appui aux Projets (PSU)",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: false,
    description:
      "L'OIM recrute un(e) Coordinateur/trice de l'Unité d'Appui aux Projets pour " +
      "renforcer la coordination opérationnelle de ses programmes en RCA. Le titulaire " +
      "assurera la gestion globale d'une unité multidisciplinaire en charge de l'appui " +
      "transversal aux projets.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Diriger et coordonner l'Unité d'Appui aux Projets\n" +
      "- Assurer la cohérence entre les différents projets de la mission\n" +
      "- Superviser les processus administratifs et financiers liés aux projets\n" +
      "- Assurer la liaison avec les partenaires et les bailleurs\n" +
      "- Produire des rapports de synthèse pour la direction de la mission",
    requirements:
      "- Master en gestion de projet, administration ou domaine connexe\n" +
      "- Minimum 7-10 ans d'expérience dont au moins 3 en coordination\n" +
      "- Expérience en contexte humanitaire ou post-conflit\n" +
      "- Leadership avéré et excellentes compétences interpersonnelles\n" +
      "- Anglais et français courants",
    benefits:
      "- Poste de direction avec responsabilités élargies\n" +
      "- Package OIM senior complet\n" +
      "- Rôle stratégique au sein de la mission RCA",
    sourceUrl: "https://unjobs.org/vacancies/1782458957812",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Chargé(e) de Programme — Coordination Terrain",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute un(e) Chargé(e) de Programme pour la Coordination Terrain afin " +
      "de renforcer la présence opérationnelle en dehors de Bangui. Le titulaire " +
      "coordonnera les activités des équipes terrain et assurera la liaison avec les " +
      "autorités locales et les communautés.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Coordonner les activités des équipes terrain en province\n" +
      "- Maintenir des relations avec les autorités locales et leaders communautaires\n" +
      "- Assurer la sécurité et la logistique des missions terrain\n" +
      "- Produire des rapports situationnels réguliers\n" +
      "- Identifier les besoins et opportunités programmatiques sur le terrain",
    requirements:
      "- Licence ou Master en humanitaire, développement ou domaine connexe\n" +
      "- Expérience en coordination terrain en contexte d'urgence ou post-conflit\n" +
      "- Bonne connaissance du contexte centrafricain appréciée\n" +
      "- Capacité à travailler en zone isolée et sous pression\n" +
      "- Français courant ; connaissance du Sango un atout",
    benefits:
      "- Missions terrain dans les préfectures de RCA\n" +
      "- Indemnité de risque et de terrain\n" +
      "- Expérience terrain précieuse avec l'IOM",
    sourceUrl: "https://unjobs.org/vacancies/1782458912425",
  },

  {
    orgEmail: "recrutement@iom-rca.org",
    title: "Officier Santé des Migrants — Réponse d'Urgence",
    category: "Médecine & Santé",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "L'OIM recrute un(e) Officier Santé des Migrants spécialisé(e) dans la réponse " +
      "d'urgence pour coordonner les interventions médicales d'urgence dans les zones " +
      "affectées par les crises en RCA.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Coordonner les interventions médicales d'urgence sur le terrain\n" +
      "- Évaluer les besoins sanitaires des populations affectées\n" +
      "- Gérer les stocks médicaux d'urgence\n" +
      "- Assurer la liaison avec les clusters Santé et les partenaires\n" +
      "- Produire des rapports sur la situation sanitaire",
    requirements:
      "- Diplôme médical ou paramédical reconnu\n" +
      "- Expérience en réponse d'urgence médicale dans un contexte humanitaire\n" +
      "- Connaissance des protocoles d'urgence sanitaire\n" +
      "- Capacité de déploiement rapide en zones difficiles\n" +
      "- Français courant",
    benefits:
      "- Indemnité de poste difficile et prime d'urgence\n" +
      "- Formation en médecine d'urgence humanitaire\n" +
      "- Expérience terrain avec une organisation internationale",
    sourceUrl: "https://unjobs.org/vacancies/1782459074070",
  },

  // ── MINUSCA ────────────────────────────────────────────────────────────────
  {
    orgEmail: "recrutement@minusca.unmissions.org",
    title: "Assistant(e) Spécial(e) aux Affaires Politiques (P-4)",
    category: "Humanitaire & ONG",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    description:
      "La MINUSCA recrute un(e) Assistant(e) Spécial(e) aux Affaires Politiques " +
      "de niveau P-4 pour appuyer le Représentant Spécial du Secrétaire Général. " +
      "Le titulaire fournira une analyse politique de haut niveau et coordonnera " +
      "les engagements stratégiques de la Mission.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Préparer les rapports du Conseil de Sécurité et les notes de briefing\n" +
      "- Conseiller la direction sur les questions politiques sensibles\n" +
      "- Gérer les réunions de haut niveau avec les parties prenantes\n" +
      "- Maintenir les relations avec le gouvernement, la société civile et les partenaires internationaux\n" +
      "- Rédiger des analyses politiques et des notes d'information",
    requirements:
      "- Master en sciences politiques, gestion, développement ou domaine connexe\n" +
      "- Minimum 7 ans d'expérience dans les affaires politiques, la diplomatie " +
      "ou le maintien de la paix\n" +
      "- Expérience confirmée en rédaction de rapports analytiques et de notes " +
      "de briefing pour la haute direction\n" +
      "- Anglais et français requis (niveau III ONU en lecture, écriture, écoute et expression orale)\n" +
      "- Connaissance du contexte centrafricain fortement appréciée",
    benefits:
      "- Grade P-4 avec barème ONU\n" +
      "- Indemnité de poste difficile (station D)\n" +
      "- Couverture médicale et retraite ONU",
    sourceUrl: "https://unjobs.org/vacancies/1783206727715",
  },

  // ── IFRC ───────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@ifrc-rca.org",
    title: "Responsable Programme Renforcement du Système de Santé",
    category: "Médecine & Santé",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    description:
      "La FICR (Croix-Rouge Internationale) recrute un(e) Responsable Programme pour " +
      "superviser son initiative de renforcement du système de santé financée par la " +
      "Coopération Allemande. Le rôle implique la gestion intégrée de la réhabilitation " +
      "des infrastructures, du renforcement des ressources humaines de santé et de " +
      "l'amélioration de la prestation de services.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Assurer la gestion globale du programme de santé\n" +
      "- Superviser la réhabilitation des infrastructures sanitaires\n" +
      "- Piloter le renforcement des capacités du personnel de santé\n" +
      "- Gérer un budget de plus de 10 millions d'euros\n" +
      "- Coordonner avec les donateurs (GIZ, Coopération Allemande, UE)\n" +
      "- Assurer la redevabilité et le reporting programmatique et financier",
    requirements:
      "- Licence en santé publique, développement international ou domaine connexe " +
      "(Master préféré)\n" +
      "- 8 à 10 ans d'expérience en gestion de programmes, idéalement en renforcement " +
      "des systèmes de santé\n" +
      "- Expérience en gestion budgétaire de plus de 10 millions EUR\n" +
      "- Expérience avec des donateurs bilatéraux/multilatéraux majeurs\n" +
      "- Expérience avérée dans des contextes fragiles ou affectés par les conflits\n" +
      "- Certifications en gestion de projet appréciées\n" +
      "- Français et anglais courants (oral et écrit)\n" +
      "- Compétences en leadership et gestion adaptative",
    benefits:
      "- Package salarial compétitif de la FICR\n" +
      "- Assurance médicale internationale\n" +
      "- Opportunité de diriger un programme à fort impact en RCA",
    sourceUrl: "https://unjobs.org/vacancies/1782856431948",
  },

  // ── WFP ────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@wfp-bangui.org",
    title: "Officier des Services de Gestion (Logistique/Carburant)",
    category: "Logistique & Transport",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "Le PAM (WFP) recrute un(e) Officier des Services de Gestion spécialisé(e) dans " +
      "la gestion du carburant pour son bureau de Bangui. Le titulaire assurera la " +
      "planification stratégique, la gestion des stocks et la supervision des opérations " +
      "de carburant au sein de l'unité administrative.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Planification stratégique et prévision des besoins en carburant\n" +
      "- Supervision des opérations et gestion des inventaires\n" +
      "- Analyse des données et production de rapports\n" +
      "- Standardisation des processus et digitalisation\n" +
      "- Conformité aux normes de sécurité (HSE/OSH)\n" +
      "- Coordination avec les fournisseurs et les services opérationnels",
    requirements:
      "- Licence en logistique, supply chain ou administration\n" +
      "- 3 ans d'expérience pertinente\n" +
      "- Expertise avancée en gestion de chaîne d'approvisionnement de carburant\n" +
      "- Connaissance des normes HSE/OSH pour le stockage de carburant\n" +
      "- Maîtrise d'Excel, des systèmes ERP et des outils de suivi de carburant\n" +
      "- Français natif ; anglais souhaitable\n" +
      "- Doit être ressortissant d'un autre pays que la RCA (Volontaire International)",
    benefits:
      "- Statut Volontaire International ONU\n" +
      "- Allocation mensuelle compétitive\n" +
      "- Expérience internationale avec une agence onusienne",
    sourceUrl: "https://unjobs.org/vacancies/1782675798042",
  },

  // ── UNDP ───────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@undp-rca.org",
    title: "Conseiller(ère) Technique National(e) en Énergie",
    category: "Environnement & Mines",
    type: "Consultant",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-07-08T17:00:00Z"),
    description:
      "Le PNUD recrute un(e) Conseiller(ère) Technique National(e) en Énergie pour " +
      "appuyer ses programmes de développement énergétique en République Centrafricaine. " +
      "Contrat de consultance de 120 jours ouvrables répartis sur 6 mois.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Fournir des conseils techniques sur les politiques et programmes énergétiques\n" +
      "- Appuyer la mise en œuvre des projets d'énergie renouvelable\n" +
      "- Développer des outils et documents techniques\n" +
      "- Assurer la liaison avec les partenaires gouvernementaux et techniques\n" +
      "- Contribuer aux rapports d'avancement et aux évaluations\n\n" +
      "**Note :** Soumission via le portail Quantum PNUD (ref. UNDP-CAF-00480). " +
      "Les offres soumises avec un identifiant de cabinet seront disqualifiées.",
    requirements:
      "- Expertise avérée en consulting énergétique\n" +
      "- Connaissance des politiques d'énergie en Afrique centrale\n" +
      "- Compétences en gestion de projet et procurement\n" +
      "- Excellentes aptitudes à la communication\n" +
      "- Français courant requis",
    benefits:
      "- Honoraires compétitifs PNUD\n" +
      "- Contribution directe à la politique énergétique nationale\n" +
      "- Accès aux réseaux PNUD",
    sourceUrl: "https://unjobs.org/vacancies/1782415459720",
  },

  // ── UNICEF ─────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@unicef-rca.org",
    title: "Jeunes Champions de l'UNICEF (5 postes — Bénévolat)",
    category: "Humanitaire & ONG",
    type: "Bénévolat",
    location: "Bangui",
    experienceLevel: "Debutant",
    featured: true,
    description:
      "L'UNICEF lance un appel à candidatures pour 5 postes de Jeunes Champions en " +
      "République Centrafricaine. Les volontaires sélectionnés appuieront les programmes " +
      "de l'UNICEF dans les domaines de l'éducation, la santé, la protection, la " +
      "nutrition et l'eau-assainissement.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Participer aux activités de communication pour le développement\n" +
      "- Soutenir l'engagement communautaire des jeunes\n" +
      "- Contribuer à l'établissement de communautés U-Report\n" +
      "- Sensibiliser les populations sur les droits de l'enfant\n" +
      "- Appuyer les équipes UNICEF sur le terrain\n\n" +
      "**Durée :** 6 mois, temps plein, sur site à Bangui\n" +
      "**Date de démarrage :** 1er juillet 2026",
    requirements:
      "- Minimum 18 ans avec diplôme secondaire ou technique\n" +
      "- Français courant requis ; Sango langue maternelle (souhaitable)\n" +
      "- 6 mois d'expérience en bénévolat communautaire\n" +
      "- Bonnes capacités de communication et résolution de problèmes\n" +
      "- Ressortissant(e) de RCA, résident(e) légal(e) ou réfugié(e) en RCA",
    benefits:
      "- Expérience avec l'une des plus grandes organisations de l'ONU\n" +
      "- Certificat de bénévolat UNICEF\n" +
      "- Opportunité de contribuer au développement de la RCA",
    sourceUrl: "https://unjobs.org/vacancies/1782836073681",
  },

  // ── Street Child ───────────────────────────────────────────────────────────
  {
    orgEmail: "rh@street-child-rca.org",
    title: "Spécialiste Éducation et Formation (Intégration Systémique)",
    category: "Éducation & Formation",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    salaryMin: 19500000,
    salaryMax: 22200000,
    description:
      "Street Child recrute un(e) Spécialiste en Éducation et Formation pour ancrer ses " +
      "méthodologies pédagogiques dans le système éducatif national de la RCA. Le titulaire " +
      "travaillera en étroite collaboration avec les responsables ministériels et les " +
      "institutions de formation des enseignants.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Aligner les méthodologies d'enseignement avec les standards éducatifs nationaux\n" +
      "- Renforcer les cadres de supervision et d'inspection du ministère\n" +
      "- Intégrer les contenus dans les cursus de formation des enseignants\n" +
      "- Coacher les formateurs et suivre la qualité de mise en œuvre\n" +
      "- Renforcer les capacités institutionnelles des partenaires gouvernementaux\n" +
      "- Documenter les bonnes pratiques et les leçons apprises",
    requirements:
      "- Master en éducation, affaires humanitaires, gestion de projet, " +
      "relations internationales ou sociologie\n" +
      "- 5 à 7 ans d'expérience en programmation éducative en contexte humanitaire\n" +
      "- Expérience avérée en renforcement systémique avec des ministères de l'éducation\n" +
      "- Connaissance de l'Éducation en Situations d'Urgence (EiE) et des programmes " +
      "d'apprentissage accéléré\n" +
      "- Français et anglais courants\n" +
      "- Excellentes compétences en facilitation, coaching et négociation\n" +
      "- Expérience préalable en RCA ou dans la région des Grands Lacs (souhaitée)",
    benefits:
      "- Salaire annuel : 35 000 – 40 000 USD\n" +
      "- Poste à pourvoir immédiatement (ASAP)\n" +
      "- Contrat à temps plein avec Street Child\n" +
      "- Outils numériques pour environnements à faible connectivité",
    sourceUrl: "https://unjobs.org/vacancies/1777199692180",
  },

  {
    orgEmail: "rh@street-child-rca.org",
    title: "Responsable Finance et Opérations",
    category: "Banque & Finance",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    description:
      "Street Child recrute un(e) Responsable Finance et Opérations pour gérer les " +
      "aspects financiers et opérationnels de ses programmes en RCA. Le titulaire " +
      "assurera la bonne gestion des ressources financières et la conformité aux " +
      "exigences des bailleurs de fonds.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer les finances du programme selon les procédures organisationnelles\n" +
      "- Assurer la conformité aux exigences contractuelles des bailleurs\n" +
      "- Superviser les opérations administratives et logistiques\n" +
      "- Préparer les budgets, prévisions et rapports financiers\n" +
      "- Gérer les relations avec les fournisseurs et prestataires locaux\n" +
      "- Appuyer les audits internes et externes",
    requirements:
      "- Licence ou Master en finance, comptabilité ou gestion\n" +
      "- Expérience en gestion financière de programmes humanitaires ou de développement\n" +
      "- Maîtrise des outils comptables et d'Excel\n" +
      "- Connaissance des procédures de bailleurs (institutionnels, privés)\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Rémunération compétitive Street Child\n" +
      "- Environnement de travail dynamique\n" +
      "- Poste à pourvoir rapidement",
    sourceUrl: "https://unjobs.org/vacancies/1777199686550",
  },

  {
    orgEmail: "rh@street-child-rca.org",
    title: "Chargé(e) MEAL — Street Child",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "Street Child recrute un(e) Chargé(e) MEAL pour ses programmes d'éducation en " +
      "RCA. Le rôle consiste à mettre en place des systèmes de suivi-évaluation adaptés " +
      "au contexte éducatif, à analyser les données programmatiques et à produire des " +
      "rapports d'apprentissage destinés aux équipes et aux bailleurs.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Développer et gérer le cadre MEAL du programme éducatif\n" +
      "- Concevoir des outils de collecte de données adaptés au contexte\n" +
      "- Former et superviser les enquêteurs terrain\n" +
      "- Analyser les données et produire des rapports d'apprentissage\n" +
      "- Assurer la redevabilité envers les bénéficiaires\n" +
      "- Contribuer aux évaluations d'impact",
    requirements:
      "- Licence en statistiques, sciences de l'éducation ou domaine connexe\n" +
      "- Expérience en MEAL dans un programme éducatif humanitaire\n" +
      "- Maîtrise des outils de collecte de données (KoboToolbox, ODK)\n" +
      "- Rigueur analytique et bonne capacité de rédaction en français\n" +
      "- Connaissance de la RCA ou de la région appréciée",
    benefits:
      "- Expérience dans un programme d'éducation en urgence reconnu\n" +
      "- Formation MEAL spécialisée\n" +
      "- Contribution directe à l'amélioration de l'éducation en RCA",
    sourceUrl: "https://unjobs.org/vacancies/1777199703347",
  },
];

// ─── Script principal ────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Démarrage du seed — Offres RCA juillet 2026\n");

  // 1. Créer les comptes entreprise si absents
  const companyMap = {};

  for (const org of ORGS) {
    let user = await prisma.user.findUnique({ where: { email: org.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email:    org.email,
          name:     org.name,
          role:     "EMPLOYER",
          password: fakeHash(org.email),
          emailVerified: new Date(),
        },
      });
      console.log(`✅ Utilisateur créé : ${org.name}`);
    } else {
      console.log(`⏭  Utilisateur existant : ${org.name}`);
    }

    let company = await prisma.company.findUnique({ where: { userId: user.id } });

    if (!company) {
      let slug = slugify(org.slug);
      // S'assurer que le slug est unique
      const existing = await prisma.company.findUnique({ where: { slug } });
      if (existing) slug = slug + "-" + Date.now();

      company = await prisma.company.create({
        data: {
          userId:      user.id,
          name:        org.name,
          slug,
          logo:        org.logo,
          website:     org.website,
          sector:      org.sector,
          size:        org.size,
          location:    org.location,
          description: org.description,
          verified:    org.verified,
        },
      });
      console.log(`  🏢 Entreprise créée : ${org.name}`);
    } else {
      console.log(`  🏢 Entreprise existante : ${org.name}`);
    }

    companyMap[org.email] = company.id;
  }

  // 2. Insérer les offres
  console.log("\n📋 Insertion des offres d'emploi...\n");
  let created = 0;
  let skipped = 0;

  for (const job of JOBS_DATA) {
    const companyId = companyMap[job.orgEmail];
    if (!companyId) {
      console.warn(`⚠️  Entreprise introuvable pour : ${job.orgEmail}`);
      continue;
    }

    // Générer un slug unique
    let baseSlug = slugify(job.title);
    let slug     = baseSlug;
    let suffix   = 1;
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    await prisma.job.create({
      data: {
        companyId,
        title:          job.title,
        slug,
        description:    job.description,
        requirements:   job.requirements ?? null,
        benefits:       job.benefits ?? null,
        type:           job.type,
        category:       job.category,
        location:       job.location,
        remote:         false,
        salaryMin:      job.salaryMin ?? null,
        salaryMax:      job.salaryMax ?? null,
        salaryCurrency: "XAF",
        experienceLevel: job.experienceLevel ?? null,
        deadline:       job.deadline ?? null,
        published:      true,
        featured:       job.featured ?? false,
      },
    });

    console.log(`  ✅ ${job.title}`);
    created++;
  }

  console.log(`\n🎉 Terminé ! ${created} offres créées, ${skipped} ignorées.`);
  console.log(`   Organisations : ${ORGS.length} comptes vérifiés/créés.`);
}

main()
  .catch((e) => { console.error("❌ Erreur :", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
