/**
 * Seed v2 — Offres d'emploi RCA juillet 2026
 * Sources : jobscar.info, impactpool.org, unjobs.org, reliefweb.int
 * node scripts/seed-offres-juillet-2026-v2.mjs
 */

import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

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

function fakeHash(email) {
  return "$2b$10$" + createHash("sha256").update(email).digest("hex").substring(0, 53);
}

// ─── Organisations ────────────────────────────────────────────────────────────
const ORGS = [
  {
    email:   "rh@msf-hollande-rca.org",
    name:    "MSF — Médecins Sans Frontières (OCA)",
    slug:    "msf-medecins-sans-frontieres-oca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/d/d2/MSF_logo.svg",
    website: "https://www.msf.org",
    sector:  "Médecine & Santé",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "Médecins Sans Frontières (MSF) est une organisation médicale humanitaire internationale " +
      "indépendante. En République Centrafricaine, MSF-OCA (Amsterdam) gère plusieurs projets " +
      "médicaux à Bangui et en province, offrant des soins d'urgence aux populations déplacées " +
      "et touchées par les conflits.",
    verified: true,
  },
  {
    email:   "rh@msf-belgique-rca.org",
    name:    "MSF — Médecins Sans Frontières (Belgique)",
    slug:    "msf-medecins-sans-frontieres-belgique",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/d/d2/MSF_logo.svg",
    website: "https://www.msf-belgium.org",
    sector:  "Médecine & Santé",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "MSF Belgique (OCB — Operational Centre Brussels) est l'une des cinq sections opérationnelles " +
      "de Médecins Sans Frontières. Elle intervient en RCA dans les zones reculées comme Bangassou " +
      "pour la santé mentale communautaire, la nutrition et les soins d'urgence.",
    verified: true,
  },
  {
    email:   "rh@alima-rca.org",
    name:    "ALIMA — Alliance for International Medical Action",
    slug:    "alima-alliance-international-medical-action",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/d/d2/MSF_logo.svg",
    website: "https://www.alima.ngo",
    sector:  "Médecine & Santé",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "ALIMA est une organisation médicale humanitaire africaine créée en 2009. En RCA, " +
      "elle intervient principalement dans les zones de Bangui et de Haut-Mbomou (Obo) " +
      "pour la santé maternelle, la nutrition et la réponse aux urgences.",
    verified: true,
  },
  {
    email:   "rh@rescue-rca.org",
    name:    "IRC — International Rescue Committee",
    slug:    "irc-international-rescue-committee-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/7/71/International_Rescue_Committee_Logo.svg",
    website: "https://www.rescue.org",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "L'International Rescue Committee (IRC) répond aux pires crises humanitaires mondiales et " +
      "aide les populations à survivre, à se relever et à reprendre en main leur avenir. En RCA, " +
      "l'IRC œuvre dans les secteurs de la protection, la gouvernance, la santé et les moyens " +
      "de subsistance à Bangui et dans plusieurs préfectures.",
    verified: true,
  },
  {
    email:   "recrutement@intersos-rca.org",
    name:    "INTERSOS — Organisation Humanitaire Internationale",
    slug:    "intersos-organisation-humanitaire-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website: "https://www.intersos.org",
    sector:  "Humanitaire & ONG",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "INTERSOS est une organisation humanitaire non gouvernementale italienne fondée en 1992. " +
      "Présente en RCA depuis 1997, elle intervient dans les secteurs de la protection, " +
      "de la santé, de l'eau-assainissement et des abris dans plusieurs préfectures touchées " +
      "par les conflits.",
    verified: true,
  },
  {
    email:   "rh@nrc-rca.org",
    name:    "NRC — Norwegian Refugee Council",
    slug:    "nrc-norwegian-refugee-council-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/e4/Norwegian_Refugee_Council_ENG_logo.gif",
    website: "https://www.nrc.no",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Kaga Bandoro",
    description:
      "Le Conseil Norvégien pour les Réfugiés (NRC) est une ONG humanitaire indépendante qui " +
      "aide les personnes contraintes à fuir. En RCA, le NRC intervient dans les domaines " +
      "de l'éducation, l'abri, l'eau-hygiène, la protection et la distribution de vivres " +
      "dans plusieurs préfectures.",
    verified: true,
  },
  {
    email:   "rh@solidarites-rca.org",
    name:    "Solidarités International",
    slug:    "solidarites-international-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website: "https://www.solidarites.org",
    sector:  "Humanitaire & ONG",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "Solidarités International est une ONG française spécialisée dans la réponse aux urgences " +
      "humanitaires, notamment dans les domaines WASH (eau, assainissement et hygiène), " +
      "la sécurité alimentaire et les abris. En RCA, elle opère depuis ses bases de " +
      "Markounda et Bouar.",
    verified: true,
  },
  {
    email:   "rh@premiere-urgence-rca.org",
    name:    "PUI — Première Urgence Internationale",
    slug:    "pui-premiere-urgence-internationale-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website: "https://www.premiere-urgence.org",
    sector:  "Humanitaire & ONG",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "Première Urgence Internationale est une ONG humanitaire française qui intervient dans " +
      "les crises oubliées ou ignorées par les grands médias. En RCA, PUI gère des programmes " +
      "multisectoriels incluant la santé, la sécurité alimentaire, le WASH et la protection.",
    verified: true,
  },
  {
    email:   "rh@unops-rca.org",
    name:    "UNOPS — Bureau des Nations Unies pour les Services aux Projets",
    slug:    "unops-bureau-nations-unies-services-projets",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/5/57/UNOPS_logo_2016_website_blue_304x53.png",
    website: "https://www.unops.org",
    sector:  "Humanitaire & ONG",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "UNOPS aide les Nations Unies et ses partenaires à mettre en œuvre des projets de paix, " +
      "humanitaires et de développement dans le monde. En RCA, UNOPS soutient des projets " +
      "d'infrastructure, de développement social et de renforcement institutionnel " +
      "notamment dans les zones du nord-est du pays.",
    verified: true,
  },
  {
    email:   "rh@wcs-rca.org",
    name:    "WCS — Wildlife Conservation Society",
    slug:    "wcs-wildlife-conservation-society-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/d/d4/Wildlife_Conservation_Society_logo_%28since_2015%29.svg",
    website: "https://www.wcs.org",
    sector:  "Environnement & Mines",
    size:    "Moyenne entreprise (50-200)",
    location:"N'Délé",
    description:
      "La Wildlife Conservation Society (WCS) travaille à sauvegarder la faune sauvage et " +
      "les espaces naturels. En RCA, WCS gère la conservation du Complexe d'aires protégées " +
      "du nord-est (parc national Bamingui-Bangoran et Réserve de biosphère) tout en " +
      "appuyant les communautés locales et les forces de défense.",
    verified: true,
  },
  {
    email:   "rh@croixrouge-rca.org",
    name:    "Croix-Rouge Centrafricaine",
    slug:    "croix-rouge-centrafricaine",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_the_Red_Cross.svg",
    website: "https://www.croixrouge-rca.org",
    sector:  "Médecine & Santé",
    size:    "Grande entreprise (500+)",
    location:"Bangui",
    description:
      "La Croix-Rouge Centrafricaine est la société nationale du Mouvement international de la " +
      "Croix-Rouge et du Croissant-Rouge en RCA. Elle conduit des activités humanitaires dans " +
      "les domaines de la santé, des secours d'urgence, du soutien aux personnes vulnérables " +
      "et de la diffusion du droit international humanitaire sur l'ensemble du territoire.",
    verified: true,
  },
  {
    email:   "rh@welthungerhilfe-rca.org",
    name:    "WHH — Welthungerhilfe",
    slug:    "welthungerhilfe-rca",
    logo:    "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website: "https://www.welthungerhilfe.org",
    sector:  "Humanitaire & ONG",
    size:    "Moyenne entreprise (50-200)",
    location:"Bangui",
    description:
      "Welthungerhilfe (WHH) est l'une des plus grandes ONG allemandes d'aide humanitaire et " +
      "de développement. En RCA, WHH intervient dans les secteurs de la sécurité alimentaire, " +
      "de l'agriculture, du WASH et de la gestion de stocks pour les ménages vulnérables " +
      "dans plusieurs préfectures.",
    verified: true,
  },
];

// ─── Offres d'emploi ──────────────────────────────────────────────────────────
const JOBS_DATA = [

  // ── MSF Hollande ─────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@msf-hollande-rca.org",
    title: "Responsable des Activités d'Analyse de Données",
    category: "Informatique & Télécoms",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-07-23T00:00:00Z"),
    description:
      "MSF-OCA (Hollande) recrute un(e) Responsable des Activités d'Analyse de Données " +
      "pour son bureau de Bangui. Le titulaire gérera les outils de collecte de données " +
      "médicales, assurera le contrôle qualité et supervisera l'équipe de saisie.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Superviser la collecte, la saisie et la gestion des données médicales\n" +
      "- Assurer le contrôle qualité des bases de données\n" +
      "- Produire des analyses statistiques et des rapports épidémiologiques\n" +
      "- Former et superviser l'équipe de saisie de données\n" +
      "- Participer aux réunions de coordination médicale\n" +
      "- Veiller à la confidentialité et à la sécurité des données patients\n\n" +
      "**Candidature :** Envoyer CV + lettre de motivation à car-hrco-dep@oca.msf.org",
    requirements:
      "- Bac+3 minimum en épidémiologie, santé publique, biostatistiques ou domaine connexe\n" +
      "- Bac+5 préféré\n" +
      "- Minimum 2 ans d'expérience en gestion et analyse de données dans un contexte humanitaire\n" +
      "- Maîtrise des logiciels statistiques (Epi Info, SPSS, R, ou Excel avancé)\n" +
      "- Connaissance des outils de collecte mobile (KoboToolbox, ODK)\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Package MSF complet (indemnités, couverture médicale)\n" +
      "- Formation interne MSF",
    sourceUrl: "https://jobscar.info/jobs/medecins-sans-frontieres-hollande-msf-h-responsable-des-activites-danalyse-de-donnees/",
  },

  {
    orgEmail: "rh@msf-hollande-rca.org",
    title: "Assistant(e) Médical(e) — Équipe de Réponse aux Urgences (ERT)",
    category: "Médecine & Santé",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-23T00:00:00Z"),
    description:
      "MSF-OCA recrute un(e) Assistant(e) Médical(e) pour son Équipe de Réponse aux Urgences " +
      "(ERT) basée à Bangui, avec des déplacements fréquents sur le terrain. Le titulaire " +
      "effectuera le triage et l'examen clinique des patients dans les zones d'urgence.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Assurer le triage et l'examen clinique de base des patients\n" +
      "- Administrer les médicaments selon les protocoles MSF\n" +
      "- Collecter et documenter les données médicales des patients\n" +
      "- Participer aux missions de terrain de l'ERT\n" +
      "- Coordonner avec les équipes médicales lors des urgences\n" +
      "- Assurer la gestion des stocks médicaux d'urgence\n\n" +
      "**Candidature :** Envoyer CV + lettre de motivation à car-hrco-dep@oca.msf.org",
    requirements:
      "- Diplôme d'assistant médical reconnu\n" +
      "- Minimum 1 an d'expérience clinique\n" +
      "- Expérience en contexte humanitaire appréciée\n" +
      "- Capacité à travailler sous pression et en zones difficiles\n" +
      "- Disponibilité pour des déplacements fréquents en province\n" +
      "- Français courant ; Sango apprécié",
    benefits:
      "- CDD de 4 mois\n" +
      "- Formation ERT MSF\n" +
      "- Expérience terrain précieuse avec MSF",
    sourceUrl: "https://jobscar.info/jobs/medecins-sans-frontieres-hollande-msf-h-assistant-medical-equipe-de-reponse-aux-urgences-ert/",
  },

  // ── MSF Belgique ──────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@msf-belgique-rca.org",
    title: "Agent(e) de Santé Mentale Communautaire",
    category: "Médecine & Santé",
    type: "CDD",
    location: "Bangassou",
    experienceLevel: "Debutant",
    featured: false,
    deadline: new Date("2026-07-10T00:00:00Z"),
    description:
      "MSF Belgique recrute un(e) Agent(e) de Santé Mentale Communautaire pour son programme " +
      "à Bangassou (préfecture de Mbomou). Le titulaire assurera le soutien psychosocial " +
      "au niveau communautaire et orientera les cas nécessitant une prise en charge spécialisée.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Conduire des activités de soutien psychosocial et d'éducation à la santé mentale " +
      "dans les communautés\n" +
      "- Effectuer des visites à domicile auprès des personnes vulnérables\n" +
      "- Orienter les victimes de violence sexuelle et les patients VIH vers les services " +
      "appropriés\n" +
      "- Sensibiliser les communautés sur la santé mentale et réduire la stigmatisation\n" +
      "- Documenter les activités et les cas rencontrés",
    requirements:
      "- Aucun diplôme universitaire spécifique requis\n" +
      "- Expérience en travail communautaire ou associatif appréciée\n" +
      "- Sensibilité aux questions de santé mentale et de protection\n" +
      "- Capacité d'écoute empathique et de communication\n" +
      "- Résidence à Bangassou ou mobilité vers Bangassou requise\n" +
      "- Français ; Sango fortement apprécié",
    benefits:
      "- Formation en santé mentale communautaire par MSF\n" +
      "- Expérience avec une organisation médicale humanitaire internationale\n" +
      "- Impact direct sur les communautés vulnérables",
    sourceUrl: "https://jobscar.info/jobs/medecins-sans-frontieres-belgique-une-agent-de-sante-mentale-communautaire/",
  },

  // ── ALIMA ─────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@alima-rca.org",
    title: "Coordinateur/trice Financier(ère) de Mission",
    category: "Comptabilité & Audit",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    description:
      "ALIMA recrute un(e) Coordinateur/trice Financier(ère) pour diriger les fonctions " +
      "financières de sa mission en République Centrafricaine. Le poste couvre la gestion " +
      "budgétaire, la comptabilité, la trésorerie et la coordination des audits.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Superviser la gestion budgétaire et comptable de la mission\n" +
      "- Assurer le reporting financier aux bailleurs (BHA, ECHO, AFD, etc.)\n" +
      "- Gérer la trésorerie et les liquidités sur l'ensemble des bases\n" +
      "- Coordonner les audits internes et externes\n" +
      "- Former et encadrer l'équipe financière nationale\n" +
      "- Veiller au respect des procédures internes et des exigences bailleurs\n" +
      "- Se déplacer régulièrement sur les projets hors Bangui",
    requirements:
      "- Bac+5 en finance, comptabilité ou gestion (Master requis)\n" +
      "- Minimum 5 ans d'expérience dont 2 ans en coordination financière ONG\n" +
      "- Expérience confirmée en gestion de subventions (ECHO, BHA, etc.)\n" +
      "- Maîtrise de SAGA ou logiciel comptable ONG\n" +
      "- Français courant requis ; anglais apprécié\n" +
      "- Capacité à travailler sous pression et en environnement contraignant",
    benefits:
      "- CDD sous droit français — 6 mois renouvelable\n" +
      "- Salaire compétitif ALIMA + per diem\n" +
      "- Assurance médicale expatrié\n" +
      "- Billet d'avion AR inclus",
    sourceUrl: "https://alliance.alima.ngo/jobs/coordinateur-trice-financier-e-republique-centrafricaine-h-f-343",
  },

  {
    orgEmail: "rh@alima-rca.org",
    title: "Sage-Femme",
    category: "Médecine & Santé",
    type: "CDD",
    location: "Obo",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-13T00:00:00Z"),
    description:
      "ALIMA recrute une Sage-Femme pour son projet de santé reproductive à Obo (préfecture " +
      "du Haut-Mbomou). Le/La titulaire assurera les soins prénataux, les accouchements et " +
      "la prise en charge des survivantes de violences sexuelles.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Assurer les consultations prénatales et postnatales\n" +
      "- Gérer les accouchements normaux et à risque\n" +
      "- Conduire des cliniques mobiles de santé reproductive\n" +
      "- Prendre en charge les survivantes de violences sexuelles (PEP, suivi médical)\n" +
      "- Superviser les accoucheuses traditionnelles formées\n" +
      "- Assurer la tenue des registres et le reporting médical",
    requirements:
      "- Diplôme de sage-femme d'État reconnu\n" +
      "- Minimum 2 ans d'expérience, idéalement en contexte humanitaire\n" +
      "- Expérience en prise en charge des victimes de violences sexuelles appréciée\n" +
      "- Capacité à travailler en zone isolée\n" +
      "- Mobilité vers Obo (Haut-Mbomou) requise\n" +
      "- Français courant",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Package ALIMA (salaire, logement, transport)\n" +
      "- Formation spécialisée en santé reproductive en urgence",
    sourceUrl: "https://jobscar.info/jobs/alima-sage-femme/",
  },

  // ── IRC ───────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@rescue-rca.org",
    title: "Officier(ère) Administration",
    category: "Administration & RH",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-15T00:00:00Z"),
    description:
      "L'IRC recrute un(e) Officier(ère) Administration pour son bureau de Bangui. " +
      "Le/La titulaire gérera les fonctions administratives et financières de la base, " +
      "assurera les services généraux et la liaison avec les autorités locales.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer les opérations administratives quotidiennes du bureau\n" +
      "- Superviser les services généraux (maintenance, nettoyage, sécurité du bureau)\n" +
      "- Assurer la liaison avec les autorités locales et les prestataires\n" +
      "- Gérer les contrats de bail et les abonnements\n" +
      "- Appuyer les processus logistiques et de procurement\n" +
      "- Tenir les registres administratifs et produire les rapports",
    requirements:
      "- Bac+3 en gestion, administration ou logistique\n" +
      "- Minimum 2 ans d'expérience dans une ONG internationale\n" +
      "- Bonne connaissance des procédures administratives humanitaires\n" +
      "- Maîtrise du pack Office (Word, Excel)\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Contrat local IRC avec avantages\n" +
      "- Environnement de travail professionnel et multiculturel\n" +
      "- Développement professionnel avec l'IRC",
    sourceUrl: "https://www.impactpool.org/jobs/1224078",
  },

  {
    orgEmail: "rh@rescue-rca.org",
    title: "Officier(ère) Finance",
    category: "Comptabilité & Audit",
    type: "CDD",
    location: "N'Délé",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-09T00:00:00Z"),
    description:
      "L'IRC recrute un(e) Officier(ère) Finance pour sa base de N'Délé (préfecture de Bamingui-" +
      "Bangoran). Le/La titulaire assurera les opérations financières quotidiennes en conformité " +
      "avec les procédures IRC et les exigences des bailleurs.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer les opérations financières quotidiennes de la base\n" +
      "- Assurer la conformité avec les procédures financières IRC\n" +
      "- Traiter les paiements et gérer les avances\n" +
      "- Former le personnel sur le système INTEGRA (ERP IRC)\n" +
      "- Gérer les réconciliations et les rapports financiers mensuels\n" +
      "- Appuyer la préparation des audits",
    requirements:
      "- Licence en comptabilité, finance ou gestion\n" +
      "- Expérience en finance dans une ONG internationale\n" +
      "- Connaissance du système INTEGRA ou d'un ERP similaire appréciée\n" +
      "- Rigueur, intégrité et discrétion\n" +
      "- Mobilité vers N'Délé requise\n" +
      "- Français courant",
    benefits:
      "- Poste local IRC avec rémunération compétitive\n" +
      "- Formation sur les systèmes IRC\n" +
      "- Expérience en zone d'opérations humanitaires",
    sourceUrl: "https://careers.rescue.org/us/en/jobs/1223042",
  },

  {
    orgEmail: "rh@rescue-rca.org",
    title: "Senior Officier(ère) Gouvernance et Renforcement des Systèmes",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: true,
    description:
      "L'IRC recrute un(e) Senior Officier(ère) Gouvernance et Renforcement des Systèmes " +
      "pour contribuer à la mise en œuvre de sa Stratégie 100 en RCA. Le poste implique " +
      "la gestion des partenariats avec la société civile et la coordination de projets " +
      "de paix et de cohésion communautaire.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Mettre en œuvre les activités de gouvernance et de renforcement civique\n" +
      "- Gérer les partenariats avec les organisations de la société civile locale\n" +
      "- Coordonner les projets de consolidation de la paix et de cohésion communautaire\n" +
      "- Assurer la liaison avec les autorités locales et les communautés\n" +
      "- Produire les rapports programmatiques pour les bailleurs\n" +
      "- Former et encadrer le personnel de terrain",
    requirements:
      "- Bac+4 en sciences sociales, droit, sciences politiques ou domaine connexe\n" +
      "- Minimum 3 ans d'expérience en gouvernance ou renforcement institutionnel humanitaire\n" +
      "- Expérience en gestion de partenariats avec la société civile\n" +
      "- Connaissance du contexte centrafricain appréciée\n" +
      "- Capacité à se déplacer régulièrement hors Bangui\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Poste IRC avec package complet\n" +
      "- Travail sur des enjeux de paix et de gouvernance\n" +
      "- Réseau IRC international",
    sourceUrl: "https://theirc.wd1.myworkdayjobs.com/fr-FR/External_Careers/details/Senior-Officer-Gouvernance-et-Renforcement-des-Systmes_JR00003722-1",
  },

  // ── INTERSOS ──────────────────────────────────────────────────────────────────
  {
    orgEmail: "recrutement@intersos-rca.org",
    title: "Animateur/trice de Protection Communautaire (2 postes)",
    category: "Humanitaire & ONG",
    type: "CDD",
    location: "Sibut / Kaga-Bandoro",
    experienceLevel: "Debutant",
    featured: false,
    deadline: new Date("2026-07-10T00:00:00Z"),
    description:
      "INTERSOS recrute deux Animateurs/trices de Protection Communautaire " +
      "(candidatures féminines uniquement) pour ses bases de Sibut et Kaga-Bandoro. " +
      "Les titulaires mettront en œuvre des activités de protection communautaire au " +
      "profit des populations déplacées et vulnérables.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Conduire des activités de sensibilisation à la protection dans les communautés\n" +
      "- Cartographier les risques de protection et identifier les personnes vulnérables\n" +
      "- Orienter les cas de protection vers les services appropriés\n" +
      "- Collecter des données de protection et tenir les registres à jour\n" +
      "- Participer aux réunions de coordination protection\n\n" +
      "**Note :** Postes réservés aux candidatures féminines.\n" +
      "**Candidature :** recruitment.rca@intersos.org",
    requirements:
      "- Diplôme secondaire minimum\n" +
      "- Minimum 2 ans d'expérience dans le secteur humanitaire\n" +
      "- Expérience en protection ou travail communautaire appréciée\n" +
      "- Résidence à Sibut ou Kaga-Bandoro (ou mobilité possible)\n" +
      "- Sango courant ; français apprécié",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Formation en protection communautaire\n" +
      "- Expérience terrain avec une ONG internationale",
    sourceUrl: "https://jobscar.info/jobs/intersos-deux-2-animateur-de-protection-communautaire-2/",
  },

  {
    orgEmail: "recrutement@intersos-rca.org",
    title: "Chargé(e) de Gestion de Base de Données de Protection",
    category: "Informatique & Télécoms",
    type: "CDD",
    location: "Markounda / Nalinga",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-10T00:00:00Z"),
    description:
      "INTERSOS recrute un(e) Chargé(e) de Gestion de Base de Données de Protection " +
      "pour ses activités dans les sous-préfectures de Markounda et Nalinga. Le/La titulaire " +
      "sera responsable de l'analyse des données de protection et de la production " +
      "de rapports analytiques.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer et mettre à jour les bases de données de protection (incidents, cas, référencements)\n" +
      "- Produire des tableaux de bord et des rapports analytiques sur les tendances\n" +
      "- Assurer le contrôle qualité des données collectées par les équipes terrain\n" +
      "- Appuyer les responsables de protection dans l'interprétation des données\n" +
      "- Veiller à la confidentialité des données sensibles\n\n" +
      "**Candidature :** recruitment.rca@intersos.org",
    requirements:
      "- Licence en informatique, statistiques ou domaine connexe\n" +
      "- Expérience en gestion de bases de données de protection humanitaire\n" +
      "- Maîtrise d'Excel, Access, KoboToolbox ou Power BI\n" +
      "- Sensibilité aux questions de protection et de confidentialité\n" +
      "- Mobilité vers Markounda/Nalinga (nord de la RCA)\n" +
      "- Français courant",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Formation sur les outils de données de protection\n" +
      "- Contribution directe à la protection des populations",
    sourceUrl: "https://jobscar.info/jobs/intersos-un-1-charge-de-gestion-de-base-de-donnees-de-protection/",
  },

  {
    orgEmail: "recrutement@intersos-rca.org",
    title: "Assistant(e) en Logistique",
    category: "Logistique & Transport",
    type: "CDD",
    location: "Sibut",
    experienceLevel: "Debutant",
    featured: false,
    deadline: new Date("2026-07-10T00:00:00Z"),
    description:
      "INTERSOS recrute un(e) Assistant(e) en Logistique pour sa base de Sibut. " +
      "Le/La titulaire appuiera les opérations logistiques de la base, notamment " +
      "la gestion de l'entrepôt, la maintenance des véhicules et la gestion des stocks.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Appuyer les opérations d'entrepôt et de gestion des stocks\n" +
      "- Contribuer à la maintenance et au suivi des véhicules\n" +
      "- Gérer les stocks pharmaceutiques et non-médicaux\n" +
      "- Veiller au respect des protocoles de sécurité et d'inventaire\n" +
      "- Produire des rapports logistiques réguliers\n\n" +
      "**Candidature :** recruitment.rca@intersos.org",
    requirements:
      "- Diplôme en logistique, gestion ou domaine connexe\n" +
      "- Expérience en ONG souhaitée (au moins 1 an)\n" +
      "- Connaissance de base de la gestion de stocks\n" +
      "- Intégrité et sens des responsabilités\n" +
      "- Mobilité vers Sibut (préfecture de Kémo)\n" +
      "- Français courant ; Sango apprécié",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Formation aux procédures logistiques INTERSOS\n" +
      "- Expérience terrain humanitaire",
    sourceUrl: "https://jobscar.info/jobs/intersos-un-1-assistant-en-logistique/",
  },

  // ── NRC ───────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@nrc-rca.org",
    title: "Assistant(e) Technique Logistique — Flotte (Fleet)",
    category: "Logistique & Transport",
    type: "CDI",
    location: "Kaga Bandoro",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "Le NRC recrute un(e) Assistant(e) Technique Logistique spécialisé(e) dans la gestion " +
      "de flotte pour sa base de Kaga Bandoro. Le/La titulaire gérera les véhicules, planifiera " +
      "les transports et assurera le suivi du carburant et de la maintenance.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer le parc de véhicules de la base NRC\n" +
      "- Planifier les transports hebdomadaires selon les besoins des programmes\n" +
      "- Suivre la consommation de carburant et les coûts de maintenance\n" +
      "- Tenir le registre des actifs et les fichiers véhicules\n" +
      "- Produire des rapports mensuels de flotte\n" +
      "- Veiller au respect des règles de sécurité routière NRC",
    requirements:
      "- Bac+2 ou Bac+3 en logistique, mécanique ou domaine connexe\n" +
      "- Minimum 2 ans d'expérience en gestion de flotte humanitaire\n" +
      "- Permis de conduire valide (catégorie B minimum)\n" +
      "- Connaissance des procédures de maintenance préventive\n" +
      "- Maîtrise d'Excel et des outils de suivi de flotte\n" +
      "- Français courant",
    benefits:
      "- Contrat NRC avec rémunération compétitive\n" +
      "- Formation aux standards logistiques NRC\n" +
      "- Poste à Kaga Bandoro avec cadre de vie NRC",
    sourceUrl: "https://ekum.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2019/job/20983",
  },

  {
    orgEmail: "rh@nrc-rca.org",
    title: "Assistant(e) Technique Logistique — Achats (Procurement)",
    category: "Logistique & Transport",
    type: "CDI",
    location: "Kaga Bandoro",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "Le NRC recrute un(e) Assistant(e) Technique Logistique spécialisé(e) dans les achats " +
      "(procurement) pour sa base de Kaga Bandoro. Le/La titulaire gérera les processus " +
      "d'achats, assurera la coordination inter-départements et appuiera le responsable logistique.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer les processus d'achats selon les procédures NRC\n" +
      "- Suivre les commandes et les livraisons\n" +
      "- Tenir à jour les outils de suivi des achats\n" +
      "- Coordonner les besoins en approvisionnement entre les départements\n" +
      "- Appuyer le responsable logistique dans les négociations avec les fournisseurs\n" +
      "- Produire des rapports mensuels d'achats",
    requirements:
      "- Bac+2 ou Bac+3 en logistique, achats ou gestion\n" +
      "- Minimum 2 ans d'expérience en procurement humanitaire\n" +
      "- Connaissance des procédures d'achats des ONG (NRC, ECHO, etc.)\n" +
      "- Sens de l'organisation et rigueur\n" +
      "- Maîtrise d'Excel\n" +
      "- Français courant",
    benefits:
      "- Contrat NRC avec avantages\n" +
      "- Formation aux standards d'achats NRC\n" +
      "- Expérience terrain avec une grande ONG internationale",
    sourceUrl: "https://ekum.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2019/job/20975",
  },

  // ── Solidarités International ─────────────────────────────────────────────────
  {
    orgEmail: "rh@solidarites-rca.org",
    title: "Directeur/trice de Zone Opérationnelle",
    category: "Humanitaire & ONG",
    type: "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    description:
      "Solidarités International recrute un(e) Directeur/trice de Zone Opérationnelle pour " +
      "sa mission en République Centrafricaine. Le/La titulaire représentera l'organisation, " +
      "supervisera les opérations depuis Bangui et assurera la direction stratégique " +
      "des bases de Markounda et Bouar.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Représenter Solidarités International auprès des autorités, donateurs et partenaires\n" +
      "- Superviser les opérations WASH, sécurité alimentaire et abri sur la mission\n" +
      "- Gérer la sécurité du personnel et des biens dans un contexte post-électoral volatile\n" +
      "- Développer la stratégie programmatique 2026 de la mission RCA\n" +
      "- Assurer le suivi budgétaire et la conformité aux exigences des bailleurs\n" +
      "- Motiver et encadrer les équipes expatriées et nationales",
    requirements:
      "- Diplôme supérieur en sciences sociales, gestion ou domaine connexe\n" +
      "- Minimum 5 ans d'expérience en gestion de mission humanitaire\n" +
      "- Expérience avérée en gestion sécuritaire en contexte instable\n" +
      "- Excellentes compétences en représentation et négociation\n" +
      "- Connaissance du contexte centrafricain fortement appréciée\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Salaire brut : 3 400 €/mois + 720 USD/mois per diem\n" +
      "- Logement pris en charge\n" +
      "- Couverture médicale internationale\n" +
      "- Billet d'avion AR et R&R inclus",
    sourceUrl: "https://www.solidarites.org",
  },

  // ── PUI ───────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@premiere-urgence-rca.org",
    title: "Logisticien(ne)-Administrateur/trice de Base",
    category: "Administration & RH",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "Première Urgence Internationale (PUI) recrute un(e) Logisticien(ne)-Administrateur/trice " +
      "de Base pour sa mission en RCA. Le/La titulaire assurera la gestion financière, " +
      "comptable, budgétaire, des ressources humaines et de la logistique de la base.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer la comptabilité et le budget de la base\n" +
      "- Assurer les ressources humaines (paie, contrats, suivi administratif)\n" +
      "- Gérer la logistique et l'approvisionnement de la base\n" +
      "- Assurer la liaison avec les autorités locales\n" +
      "- Produire les rapports financiers et administratifs\n" +
      "- Former et superviser le personnel administratif national",
    requirements:
      "- Bac+2 ou Bac+3 en logistique, gestion financière ou administration\n" +
      "- Minimum 1 an d'expérience en ONG internationale\n" +
      "- Connaissance des procédures administratives et financières ONG\n" +
      "- Polyvalence et capacité à gérer plusieurs tâches simultanément\n" +
      "- Maîtrise d'Excel et des outils comptables\n" +
      "- Français courant",
    benefits:
      "- CDD de 6 mois\n" +
      "- Salaire : 2 190 – 2 420 €/mois selon expérience\n" +
      "- Package PUI expatrié complet",
    sourceUrl: "https://unjobs.org/vacancies/1777297671877",
  },

  // ── UNOPS ─────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@unops-rca.org",
    title: "Associé(e) Développement Social (HSSE)",
    category: "Humanitaire & ONG",
    type: "Consultant",
    location: "Birao / N'Délé",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-21T00:00:00Z"),
    description:
      "UNOPS recrute un(e) Associé(e) Développement Social spécialisé(e) dans les aspects " +
      "environnementaux, sociaux, de santé et de sécurité (HSSE) pour ses projets en " +
      "RCA (zones de Birao et N'Délé). Le/La titulaire intégrera les considérations " +
      "de sauvegarde dans les projets UNOPS.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Intégrer les considérations environnementales, sociales et de sécurité dans " +
      "les projets UNOPS\n" +
      "- Monitorer l'inclusion des groupes vulnérables dans les activités\n" +
      "- Assurer la conformité avec les politiques de sauvegarde (Banque mondiale, UNOPS)\n" +
      "- Préparer des rapports sur les risques HSSE et les mesures d'atténuation\n" +
      "- Sensibiliser les équipes aux normes de protection sociale\n\n" +
      "**Note :** Poste prioritairement ouvert aux candidatures internes.",
    requirements:
      "- Formation supérieure en développement social, environnement ou domaine connexe\n" +
      "- Expérience en gestion des sauvegardes environnementales et sociales\n" +
      "- Connaissance des politiques de sauvegarde Banque mondiale\n" +
      "- Capacité à travailler dans des zones reculées\n" +
      "- Français courant ; anglais apprécié",
    benefits:
      "- Contrat LICA 6 UNOPS\n" +
      "- Rémunération selon grille UNOPS locale\n" +
      "- Expérience avec une agence onusienne spécialisée",
    sourceUrl: "https://www.impactpool.org/jobs/1224289",
  },

  // ── WCS ───────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@wcs-rca.org",
    title: "Pilote de Conservation (Conservation Pilot)",
    category: "Environnement & Mines",
    type: "CDI",
    location: "Nord-Est RCA",
    experienceLevel: "Intermediaire",
    featured: false,
    description:
      "La WCS (Wildlife Conservation Society) recrute un(e) Pilote de Conservation pour " +
      "ses opérations dans le Complexe d'aires protégées du nord-est de la RCA " +
      "(Parc national Bamingui-Bangoran). Le/La titulaire pilotera des aéronefs légers " +
      "pour des missions de surveillance aérienne et d'appui logistique.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Piloter des aéronefs légers (type Cessna 182 ou similaire) pour les missions WCS\n" +
      "- Conduire des patrouilles aériennes anti-braconnage\n" +
      "- Réaliser des inventaires fauniques depuis les airs\n" +
      "- Assurer la logistique aérienne pour les équipes de terrain\n" +
      "- Maintenir les journaux de bord et les documents de navigabilité\n" +
      "- Veiller à la maintenance préventive des aéronefs",
    requirements:
      "- Licence de pilote commercial (CPL) valide\n" +
      "- Minimum 400 heures de vol en tant que Pilote Commandant de Bord (PIC)\n" +
      "- Expérience en aviation en Afrique subsaharienne appréciée\n" +
      "- Capacité à opérer sur pistes non aménagées en brousse\n" +
      "- Aptitude physique et psychologique en environnement isolé\n" +
      "- Anglais ou français courant",
    benefits:
      "- Contrat WCS à durée indéterminée\n" +
      "- Logement sur site dans le parc national\n" +
      "- Package d'expatriation WCS\n" +
      "- Rôle unique dans la conservation de la grande faune africaine",
    sourceUrl: "https://unjobs.org/vacancies/1778656208981",
  },

  // ── Croix-Rouge Centrafricaine ────────────────────────────────────────────────
  {
    orgEmail: "rh@croixrouge-rca.org",
    title: "Officier(ère) Senior Finance — Projet SECURE",
    category: "Comptabilité & Audit",
    type: "CDD",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    deadline: new Date("2026-07-10T00:00:00Z"),
    description:
      "La Croix-Rouge Centrafricaine recrute un(e) Officier(ère) Senior Finance pour " +
      "son projet SECURE, financé dans le cadre du Mouvement International de la Croix-Rouge. " +
      "Le/La titulaire assurera la gestion financière du projet avec des déploiements " +
      "dans les zones 1, 2, 4 et 7 du pays.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Gérer les finances du projet SECURE selon les procédures de la Croix-Rouge\n" +
      "- Assurer le contrôle budgétaire et la vérification des dépenses\n" +
      "- Préparer et tenir les documents comptables à jour\n" +
      "- Appuyer la préparation des rapports financiers pour les partenaires\n" +
      "- Se déployer dans les zones d'intervention pour l'appui financier terrain\n" +
      "- Participer aux audits internes",
    requirements:
      "- Licence en finance, comptabilité ou gestion\n" +
      "- Minimum 4 ans d'expérience en gestion financière\n" +
      "- Expérience en ONG ou Mouvement de la Croix-Rouge appréciée\n" +
      "- Rigueur, intégrité et sens de la confidentialité\n" +
      "- Mobilité pour des déploiements en province\n" +
      "- Français courant",
    benefits:
      "- CDD de 6 mois — temps plein\n" +
      "- Rémunération selon grille Croix-Rouge RCA\n" +
      "- Contribution au Mouvement international de la Croix-Rouge",
    sourceUrl: "https://jobscar.info/jobs/croix-rouge-centrafricaine-officier-senior-finance-2/",
  },

  // ── WHH ───────────────────────────────────────────────────────────────────────
  {
    orgEmail: "rh@welthungerhilfe-rca.org",
    title: "Consultant(e) — Évaluation des Procédures de Gestion de Stocks",
    category: "Logistique & Transport",
    type: "Consultant",
    location: "Bangui / Bouar / Birao / Ndjoukou",
    experienceLevel: "Expert",
    featured: false,
    description:
      "Welthungerhilfe (WHH) recrute un(e) Consultant(e) indépendant(e) pour réaliser un " +
      "audit des procédures de gestion de stocks dans ses entrepôts en RCA. La mission " +
      "couvrira les sites de Bangui, Bouar, Birao et Ndjoukou.\n\n" +
      "**Objectifs de la mission :**\n" +
      "- Réaliser des inventaires physiques dans les 4 entrepôts WHH\n" +
      "- Évaluer la conformité des procédures de gestion de stocks aux standards WHH\n" +
      "- Identifier les lacunes et les risques liés aux pertes et à la fraude\n" +
      "- Proposer des recommandations pratiques d'amélioration\n" +
      "- Former le personnel logistique aux bonnes pratiques\n" +
      "- Rédiger un rapport d'évaluation complet",
    requirements:
      "- Expertise confirmée en audit logistique et gestion de stocks\n" +
      "- Connaissance des procédures de stock humanitaires\n" +
      "- Expérience préalable en RCA ou en Afrique centrale appréciée\n" +
      "- Capacité à se déplacer sur les 4 sites (y compris zones reculées)\n" +
      "- Rigueur analytique et excellentes capacités de rédaction\n" +
      "- Français courant",
    benefits:
      "- Honoraires consultance compétitifs WHH\n" +
      "- Frais de déplacement pris en charge\n" +
      "- Mission de courte durée à fort impact opérationnel",
    sourceUrl: "https://ccorca.org/offres-emploi/consultant-evaluation-de-la-procedure-de-gestion-de-stock-du-projet/",
  },
];

// ─── Script principal ──────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Seed v2 — Offres RCA juillet 2026\n");

  const companyMap = {};

  for (const org of ORGS) {
    let user = await prisma.user.findUnique({ where: { email: org.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email:         org.email,
          name:          org.name,
          role:          "EMPLOYER",
          password:      fakeHash(org.email),
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

  console.log("\n📋 Insertion des offres d'emploi...\n");
  let created = 0;

  for (const job of JOBS_DATA) {
    const companyId = companyMap[job.orgEmail];
    if (!companyId) {
      console.warn(`⚠️  Entreprise introuvable : ${job.orgEmail}`);
      continue;
    }

    let baseSlug = slugify(job.title);
    let slug     = baseSlug;
    let suffix   = 1;
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    await prisma.job.create({
      data: {
        companyId,
        title:           job.title,
        slug,
        description:     job.description,
        requirements:    job.requirements ?? null,
        benefits:        job.benefits ?? null,
        type:            job.type,
        category:        job.category,
        location:        job.location,
        remote:          false,
        salaryMin:       job.salaryMin ?? null,
        salaryMax:       job.salaryMax ?? null,
        salaryCurrency:  "XAF",
        experienceLevel: job.experienceLevel ?? null,
        deadline:        job.deadline ?? null,
        published:       true,
        featured:        job.featured ?? false,
      },
    });

    console.log(`  ✅ ${job.title}`);
    created++;
  }

  console.log(`\n🎉 Terminé ! ${created} offres créées.`);
  console.log(`   Organisations : ${ORGS.length} vérifiées/créées.`);

  const total = await prisma.job.count({ where: { published: true } });
  console.log(`   Total offres publiées en base : ${total}`);
}

main()
  .catch((e) => { console.error("❌ Erreur :", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
