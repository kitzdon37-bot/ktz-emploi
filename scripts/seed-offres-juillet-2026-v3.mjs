/**
 * Seed v3 — Offres d'emploi RCA juillet 2026
 * Sources : jobscar.info, impactpool.org, unjobs.org
 * node scripts/seed-offres-juillet-2026-v3.mjs
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
// Les emails marqués [EXISTING] correspondent à des comptes déjà en base.
// Le script les récupère sans les recréer.
const ORGS = [
  // ── Existantes (créées dans seeds précédents) ─────────────────────────────
  {
    email:    "recrutement@iom-rca.org",       // v1
    name:     "OIM — Organisation Internationale pour les Migrations",
    slug:     "oim-organisation-internationale-migrations",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/3/3c/IOM_logo.png",
    website:  "https://www.iom.int",
    sector:   "Humanitaire & ONG",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "L'Organisation Internationale pour les Migrations (OIM) est une organisation " +
      "intergouvernementale fondée en 1951. Présente en République Centrafricaine, elle " +
      "mène des programmes de réponse aux crises, stabilisation communautaire, santé des " +
      "migrants et gestion des déplacements.",
    verified: true,
  },
  {
    email:    "rh@unicef-rca.org",             // v1
    name:     "UNICEF — Fonds des Nations Unies pour l'Enfance",
    slug:     "unicef-fonds-nations-unies-enfance",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/f/f4/UNICEF_Logo.png",
    website:  "https://www.unicef.org/car",
    sector:   "Humanitaire & ONG",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "L'UNICEF travaille en République Centrafricaine pour protéger les droits des enfants " +
      "et améliorer leur survie, développement et protection dans les domaines de l'éducation, " +
      "la santé, la nutrition, l'eau et la protection de l'enfance.",
    verified: true,
  },
  {
    email:    "rh@undp-rca.org",               // v1
    name:     "PNUD — Programme des Nations Unies pour le Développement",
    slug:     "pnud-programme-nations-unies-developpement",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/e4/UNDP_logo.svg",
    website:  "https://www.undp.org/fr/central-african-republic",
    sector:   "Humanitaire & ONG",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "Le PNUD soutient la République Centrafricaine dans ses efforts de développement " +
      "durable, de gouvernance, de relèvement post-conflit et de lutte contre la pauvreté. " +
      "Il finance des projets dans l'énergie, la justice, l'environnement et l'économie.",
    verified: true,
  },
  {
    email:    "recrutement@intersos-rca.org",  // v2
    name:     "INTERSOS — Organisation Humanitaire Internationale",
    slug:     "intersos-organisation-humanitaire-rca",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website:  "https://www.intersos.org",
    sector:   "Humanitaire & ONG",
    size:     "Moyenne entreprise (50-200)",
    location: "Bangui",
    description:
      "INTERSOS est une organisation humanitaire non gouvernementale italienne fondée en 1992. " +
      "Présente en RCA depuis 1997, elle intervient dans les secteurs de la protection, " +
      "de la santé, de l'eau-assainissement et des abris dans plusieurs préfectures touchées " +
      "par les conflits.",
    verified: true,
  },
  {
    email:    "rh@rescue-rca.org",             // v2
    name:     "IRC — International Rescue Committee",
    slug:     "irc-international-rescue-committee-rca",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/7/71/International_Rescue_Committee_Logo.svg",
    website:  "https://www.rescue.org",
    sector:   "Humanitaire & ONG",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "L'International Rescue Committee (IRC) répond aux pires crises humanitaires mondiales et " +
      "aide les populations à survivre, à se relever et à reprendre en main leur avenir. En RCA, " +
      "l'IRC œuvre dans les secteurs de la protection, la gouvernance, la santé et les moyens " +
      "de subsistance à Bangui et dans plusieurs préfectures.",
    verified: true,
  },

  // ── Nouvelles organisations ────────────────────────────────────────────────
  {
    email:    "rh@imc-rca.org",
    name:     "IMC — International Medical Corps",
    slug:     "imc-international-medical-corps-rca",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website:  "https://internationalmedicalcorps.org",
    sector:   "Médecine & Santé",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "International Medical Corps (IMC) est une ONG médicale humanitaire mondiale fondée en 1984. " +
      "En République Centrafricaine, IMC intervient dans les préfectures de Haute-Kotto (Bria) " +
      "et Bamingui-Bangoran (N'Délé) pour renforcer les services de santé, notamment la " +
      "santé maternelle et les chirurgies réparatrices de fistule obstétricale.",
    verified: true,
  },
  {
    email:    "rh@impact-rca.org",
    name:     "IMPACT Initiatives",
    slug:     "impact-initiatives-rca",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website:  "https://www.impact-initiatives.org",
    sector:   "Humanitaire & ONG",
    size:     "Petite entreprise (10-50)",
    location: "Bangui",
    description:
      "IMPACT Initiatives est une ONG spécialisée dans la recherche et l'évaluation humanitaire. " +
      "En RCA, elle mène des études de situation, des évaluations des besoins et des analyses " +
      "de marchés pour informer la réponse humanitaire des acteurs présents sur le terrain.",
    verified: true,
  },
  {
    email:    "recrutement@acted-rca.org",
    name:     "ACTED Centrafrique",
    slug:     "acted-centrafrique-v3",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website:  "https://www.acted.org",
    sector:   "Humanitaire & ONG",
    size:     "Grande entreprise (500+)",
    location: "Bangui",
    description:
      "ACTED est une ONG humanitaire française présente dans plus de 40 pays. En République " +
      "Centrafricaine, elle intervient dans les domaines de la sécurité alimentaire, du WASH, " +
      "des abris, de la cohésion sociale et du développement économique local, notamment " +
      "dans les préfectures de Vakaga, Haute-Kotto et Ouham.",
    verified: true,
  },
  {
    email:    "rh@coopi-rca.org",
    name:     "COOPI — Cooperazione Internazionale",
    slug:     "coopi-cooperazione-internazionale-v3",
    logo:     "https://upload.wikimedia.org/wikipedia/commons/e/ee/UN_emblem_blue.svg",
    website:  "https://www.coopi.org",
    sector:   "Humanitaire & ONG",
    size:     "Moyenne entreprise (50-200)",
    location: "Bangui",
    description:
      "COOPI (Cooperazione Internazionale) est une ONG italienne fondée en 1965. " +
      "En République Centrafricaine depuis plusieurs décennies, elle mène des projets " +
      "multisectoriels dans les domaines du WASH, de la sécurité alimentaire, de la " +
      "protection et de la cohésion communautaire dans plusieurs préfectures.",
    verified: true,
  },
];

// ─── Offres d'emploi ──────────────────────────────────────────────────────────
const JOBS_DATA = [

  // ── INTERSOS — Logistique (Expatrié) ─────────────────────────────────────────
  {
    orgEmail: "recrutement@intersos-rca.org",
    title:    "Chargé(e) Log & Approv de Terrain (Expatrié)",
    category: "Logistique & Transport",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-22T00:00:00Z"),
    description:
      "INTERSOS recrute un(e) Chargé(e) Logistique & Approvisionnement de Terrain " +
      "(profil expatrié) pour sa mission en République Centrafricaine. Le/La titulaire " +
      "gérera les opérations logistiques et la chaîne d'approvisionnement depuis Bangui, " +
      "avec des déplacements réguliers sur les bases de terrain.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Saisir et tenir à jour les données logistiques dans la plateforme INTERSOS\n" +
      "- Planifier et coordonner les activités d'approvisionnement\n" +
      "- Conduire les achats locaux selon les procédures INTERSOS\n" +
      "- Gérer les paiements fournisseurs et la documentation contractuelle\n" +
      "- Superviser l'infrastructure des bureaux et hébergements\n" +
      "- Gérer le parc informatique et le parc véhicules\n" +
      "- Veiller au respect des protocoles de sécurité\n" +
      "- Produire les rapports logistiques mensuels\n\n" +
      "**Candidature :** Via le portail INTERSOS (lien ci-dessous). CV en PDF + " +
      "coordonnées de 3 références (2 superviseurs + 1 RH).",
    requirements:
      "- Diplôme secondaire avec formation technique certifiée\n" +
      "- Minimum 1 an d'expérience en logistique/approvisionnement\n" +
      "- Compétences informatiques de base (Word, Excel, Internet)\n" +
      "- Maîtrise du français (langue de mission)\n" +
      "- Langue locale appréciée\n" +
      "- Orientation service, flexibilité comportementale et gestion du stress\n" +
      "- Adhésion aux principes INTERSOS",
    benefits:
      "- CDD de 5 mois\n" +
      "- Package expatrié INTERSOS\n" +
      "- Formation aux procédures logistiques INTERSOS\n" +
      "- Départ : 1er août 2026",
    sourceUrl: "https://jobscar.info/jobs/intersos-charge-log-approv-de-terrain-expatrie/",
  },

  // ── IMC — Gynécologue consultant ──────────────────────────────────────────────
  {
    orgEmail: "rh@imc-rca.org",
    title:    "Gynécologue Consultant(e) — Chirurgie Fistule Obstétricale",
    category: "Médecine & Santé",
    type:     "CDD",
    location: "Bria / N'Délé",
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-08-15T00:00:00Z"),
    description:
      "International Medical Corps (IMC) recrute un(e) Gynécologue Consultant(e)-Chirurgien(ne) " +
      "pour renforcer les services de santé maternelle et soutenir les opérations de réparation " +
      "de fistule obstétricale à Bria et N'Délé.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Dispenser des formations théoriques sur l'étiologie, le diagnostic et les techniques " +
      "chirurgicales de la fistule\n" +
      "- Assurer la formation pratique aux techniques de réparation de fistule\n" +
      "- Superviser les interventions chirurgicales en temps réel\n" +
      "- Mentorer les jeunes chirurgiens, infirmiers et personnels d'anesthésie\n" +
      "- Développer des supports de formation standardisés et des protocoles chirurgicaux\n" +
      "- Assurer le suivi postopératoire et la qualité des soins\n\n" +
      "**Candidature :** Via le portail IMC : internationalmedicalcorps.hua.hrsmart.com",
    requirements:
      "- Obstétricien(ne)-Gynécologue avec certification chirurgicale\n" +
      "- Minimum 3 ans d'expérience en chirurgie gynécologique, spécifiquement en réparation " +
      "de fistule\n" +
      "- Compétences avérées en réparation de fistules simples et complexes\n" +
      "- Formation formelle en pédagogie et en techniques de communication\n" +
      "- Maîtrise du français et de l'anglais\n" +
      "- Engagement envers la sécurité des patients et le renforcement de capacités",
    benefits:
      "- Honoraires consultance compétitifs IMC\n" +
      "- Frais de déplacement et hébergement pris en charge\n" +
      "- Mission à fort impact sur la santé maternelle en RCA",
    sourceUrl: "https://jobscar.info/jobs/imc-gynecologue-consultant/",
  },

  // ── IRC — Manager Santé Nutrition ────────────────────────────────────────────
  {
    orgEmail: "rh@rescue-rca.org",
    title:    "Manager Santé Nutrition",
    category: "Médecine & Santé",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-07-25T00:00:00Z"),
    description:
      "L'IRC recrute un(e) Manager Santé Nutrition pour superviser la mise en œuvre " +
      "de ses programmes de santé et nutrition en République Centrafricaine. Le poste " +
      "implique la coordination des équipes terrain et la coordination inter-agences.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Développer des plans de travail mensuels et diriger les réunions d'équipe\n" +
      "- Superviser la mise en œuvre des procédures opérationnelles standard dans les " +
      "structures de santé\n" +
      "- Coordonner l'approvisionnement en équipements et médicaments\n" +
      "- Organiser des initiatives de renforcement des capacités\n" +
      "- Conduire des visites de supervision conjointes pour évaluer la qualité des soins\n" +
      "- Assurer la conformité aux protocoles (PCIME, soins obstétricaux d'urgence, " +
      "prise en charge de la malnutrition aiguë)\n" +
      "- Gérer la collecte et l'analyse de données des structures de santé\n" +
      "- Assurer les vérifications sécurité quotidiennes (6h30) et les rapports du soir\n\n" +
      "**Candidature :** Lettre de motivation adressée au Directeur RH IRC + CV " +
      "avec 5 références professionnelles + copies diplômes + pièce d'identité.",
    requirements:
      "- Diplôme de médecin, infirmier(e) ou sage-femme\n" +
      "- Minimum 2 ans d'expérience en administration ou supervision d'activités de santé\n" +
      "- Connaissance des protocoles nationaux (PCIME, soins d'urgence, vaccination)\n" +
      "- Expérience en gestion de projets santé-nutrition avec des ONG internationales " +
      "appréciée\n" +
      "- Connaissance du système de santé centrafricain\n" +
      "- Français courant ; langues locales (Sango, Foulani, Gbaya) appréciées\n" +
      "- Maîtrise de l'informatique ; permis moto valide\n" +
      "- **Nationalité centrafricaine requise**\n" +
      "- Disponibilité immédiate",
    benefits:
      "- Contrat national IRC avec avantages sociaux\n" +
      "- Environnement de travail professionnel et multiculturel\n" +
      "- Les candidatures féminines sont encouragées",
    sourceUrl: "https://jobscar.info/jobs/irc-manager-sante-nutrition/",
  },

  // ── UNICEF — Représentant adjoint des opérations ──────────────────────────────
  {
    orgEmail: "rh@unicef-rca.org",
    title:    "Représentant(e) Adjoint(e) des Opérations",
    category: "Humanitaire & ONG",
    type:     "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-07-20T00:00:00Z"),
    description:
      "L'UNICEF recrute un(e) Représentant(e) Adjoint(e) des Opérations pour son bureau " +
      "en République Centrafricaine. Ce poste senior assure la direction stratégique des " +
      "fonctions opérationnelles de la représentation UNICEF à Bangui.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Développer les ressources humaines et les compétences techniques de l'équipe " +
      "opérationnelle\n" +
      "- Sécuriser les ressources stratégiques pour une utilisation optimale des fonds\n" +
      "- Renforcer la gestion des risques institutionnels\n" +
      "- Optimiser les systèmes opérationnels (finances, achats, RH, logistique)\n" +
      "- Renforcer les partenariats internes et externes\n" +
      "- Représenter l'UNICEF dans les forums opérationnels inter-agences onusiennes",
    requirements:
      "- Master en gestion des affaires, finances, comptabilité, administration publique " +
      "ou fonctions opérationnelles connexes\n" +
      "- Minimum 8 ans d'expérience professionnelle pertinente aux niveaux national " +
      "et international\n" +
      "- Expérience dans le système des Nations Unies ou ONG internationales " +
      "fortement appréciée\n" +
      "- Connaissance des normes ERP et IPSAS\n" +
      "- Expérience dans des pays en développement ou en contexte humanitaire\n" +
      "- Anglais et français courants (obligatoires)",
    benefits:
      "- Contrat international UNICEF avec package expatrié complet\n" +
      "- Rémunération selon grille P-5 Nations Unies\n" +
      "- Assurance médicale et retraite ONU\n" +
      "- Indemnité de lieu d'affectation difficile applicable",
    sourceUrl: "https://jobscar.info/jobs/unicef-representant-adjoint-des-operations/",
  },

  // ── OIM — Chef de l'unité protection ─────────────────────────────────────────
  {
    orgEmail: "recrutement@iom-rca.org",
    title:    "Chef(fe) de l'Unité Protection, Retour et Réintégration",
    category: "Humanitaire & ONG",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-07-24T00:00:00Z"),
    description:
      "L'OIM recrute un(e) Chef(fe) d'Unité pour diriger ses activités de Protection, " +
      "Retour Volontaire Assisté et Réintégration (AVRR) en République Centrafricaine. " +
      "Le/La titulaire supervisera des équipes pluridisciplinaires et coordonnera avec " +
      "les partenaires humanitaires.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Établir des réponses de protection globales (gestion de cas protection générale, " +
      "VBG, protection de l'enfance, traite des êtres humains)\n" +
      "- Superviser les processus de retour et réintégration dans les zones d'origine\n" +
      "- Gérer et superviser les équipes de protection\n" +
      "- Coordonner avec les parties prenantes internes et externes\n" +
      "- Implémenter des activités de protection dans les centres de transit\n" +
      "- Développer des évaluations des risques et procédures opérationnelles\n" +
      "- Gérer les systèmes d'information de protection\n" +
      "- Assurer le renforcement des capacités du personnel et des partenaires",
    requirements:
      "- Master en travail social, droit international, sciences politiques ou domaine " +
      "connexe + 7 ans d'expérience, OU Licence + 9 ans d'expérience\n" +
      "- Leadership avéré de programmes de protection en contexte migratoire/déplacement\n" +
      "- Expertise en protection spécialisée (VBG, protection enfance, procédures d'intérêt " +
      "supérieur de l'enfant)\n" +
      "- Expérience des programmes de Retour Volontaire Assisté (AVR)\n" +
      "- Compétences en gestion d'équipe et coordination stratégique\n" +
      "- Anglais et français courants (oral et écrit)",
    benefits:
      "- Contrat OIM P-4 avec package international complet\n" +
      "- Indemnité de lieu d'affectation difficile\n" +
      "- Assurance médicale OIM\n" +
      "- Possibilité d'extension selon les financements",
    sourceUrl: "https://jobscar.info/jobs/oim-chef-de-lunite-de-protection-retour-et-reintegration/",
  },

  // ── OIM — Coordinateur programme Moyens de subsistance ───────────────────────
  {
    orgEmail: "recrutement@iom-rca.org",
    title:    "Coordinateur/trice de Programme — Moyens de Subsistance",
    category: "Humanitaire & ONG",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    deadline: new Date("2026-07-24T00:00:00Z"),
    description:
      "L'OIM recrute un(e) Coordinateur/trice de Programme pour ses activités de " +
      "Moyens de Subsistance en République Centrafricaine. Le poste implique la conception " +
      "et la mise en œuvre de programmes de relèvement économique pour les populations " +
      "déplacées et les communautés hôtes.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Conduire des évaluations des besoins et développer des stratégies d'intervention " +
      "adaptées au contexte centrafricain\n" +
      "- Superviser la mise en œuvre des projets de moyens de subsistance\n" +
      "- Établir des partenariats avec les entités gouvernementales, donateurs et " +
      "organisations communautaires\n" +
      "- Gérer le partage des connaissances et les cadres de S&E\n" +
      "- Fournir un appui technique aux chefs de projet\n" +
      "- Produire des rapports programmatiques de qualité",
    requirements:
      "- Master en sciences politiques/sociales, études de développement, droits de l'homme, " +
      "relations internationales, droit ou domaine connexe + 5 ans d'expérience, OU Licence " +
      "+ 7 ans d'expérience\n" +
      "- Expérience en recherche post-conflit et évaluations de consolidation de la paix " +
      "(idéalement en RCA ou Afrique)\n" +
      "- Solides compétences analytiques et de communication\n" +
      "- Connaissance approfondie du secteur non-gouvernemental et des mandats ONU\n" +
      "- Excellentes compétences en coordination et informatique\n" +
      "- Anglais et français courants",
    benefits:
      "- Contrat OIM avec package complet\n" +
      "- Travail dans un contexte humanitaire complexe et impactant\n" +
      "- Réseau onusien international",
    sourceUrl: "https://jobscar.info/jobs/oim-coordinateur-de-programme-moyens-de-subsistance/",
  },

  // ── ACTED — Volontaire Développement de Projets ───────────────────────────────
  {
    orgEmail: "recrutement@acted-rca.org",
    title:    "Volontaire Développement de Projets Pays",
    category: "Humanitaire & ONG",
    type:     "Bénévolat",
    location: "Bangui",
    experienceLevel: "Debutant",
    featured: false,
    deadline: new Date("2026-08-13T00:00:00Z"),
    description:
      "ACTED recherche un(e) Volontaire pour le Développement de Projets Pays en " +
      "République Centrafricaine. Ce poste offre une expérience terrain précieuse dans " +
      "la gestion du cycle de projet humanitaire.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Suivi des contrats de financement et des obligations contractuelles\n" +
      "- Rédaction de rapports narratifs pour les bailleurs de fonds\n" +
      "- Suivi des partenariats et des activités des partenaires\n" +
      "- Coordination interne entre les départements programmes et supports\n" +
      "- Appui à la communication institutionnelle\n" +
      "- Archivage et gestion documentaire\n" +
      "- Relations extérieures avec les partenaires et donateurs\n" +
      "- Contribution au développement de nouvelles propositions de projets\n\n" +
      "**Candidature :** CV + lettre de motivation à **jobs@acted.org** " +
      "avec référence **PDV/RCA**.",
    requirements:
      "- Master en relations internationales, développement, sciences politiques ou " +
      "domaine connexe\n" +
      "- Expérience professionnelle antérieure dans des domaines connexes\n" +
      "- Connaissance de l'écriture de propositions et du reporting\n" +
      "- Familiarité avec les cycles de projet humanitaire\n" +
      "- Excellentes compétences rédactionnelles et de communication en français\n" +
      "- Capacité à travailler sous pression avec des délais multiples\n" +
      "- Esprit d'équipe avec des profils divers\n" +
      "- **ACTED ne demande aucun frais à aucune étape du recrutement**",
    benefits:
      "- Couverture des frais de vie sur le terrain\n" +
      "- Expérience terrain en ONG internationale\n" +
      "- Durée : 6 mois (départ dès que possible)",
    sourceUrl: "https://jobscar.info/jobs/acted-volontaire-developpement-de-projets-pays/",
  },

  // ── COOPI — Chef de Mission ───────────────────────────────────────────────────
  {
    orgEmail: "rh@coopi-rca.org",
    title:    "Chef(fe) de Mission",
    category: "Humanitaire & ONG",
    type:     "CDI",
    location: "Bangui",
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-08-10T00:00:00Z"),
    description:
      "COOPI (Cooperazione Internazionale) recrute un(e) Chef(fe) de Mission pour sa " +
      "représentation en République Centrafricaine. Ce poste de direction stratégique " +
      "assure la représentation institutionnelle, la supervision des opérations et " +
      "le développement de la mission pays.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Représenter COOPI institutionnellement auprès des autorités, donateurs et " +
      "acteurs humanitaires\n" +
      "- Gérer les relations avec les donateurs et développer le portefeuille de financements\n" +
      "- Définir la stratégie nationale et superviser la documentation des projets\n" +
      "- Assurer la gestion du personnel national et expatrié\n" +
      "- Superviser la sécurité du personnel et des actifs de la mission\n" +
      "- Co-responsabilité budgétaire avec la coordination régionale\n" +
      "- Développer de nouvelles opportunités programmatiques",
    requirements:
      "- Diplôme universitaire supérieur (Master recommandé)\n" +
      "- Minimum 5 ans d'expérience prouvée dans le secteur humanitaire international\n" +
      "- Expérience avérée en gestion d'équipes pluridisciplinaires\n" +
      "- Maîtrise du français courant (obligatoire)\n" +
      "- Excellentes compétences en communication écrite et orale\n" +
      "- Expérience préalable en contexte de conflit fortement appréciée\n" +
      "- Connaissance de l'Afrique centrale ou de la RCA spécifiquement\n" +
      "- Compétences en logistique, achats, sécurité et gestion de partenariats complexes\n" +
      "- Anglais et expérience COOPI sont des atouts",
    benefits:
      "- CDD de 12 mois renouvelable\n" +
      "- Package expatrié COOPI complet (salaire, logement, R&R)\n" +
      "- Billet d'avion AR inclus\n" +
      "- Assurance médicale internationale",
    sourceUrl: "https://jobscar.info/jobs/coop-chef-de-mission/",
  },

  // ── PNUD/UNDP — Analyste SIG ──────────────────────────────────────────────────
  {
    orgEmail: "rh@undp-rca.org",
    title:    "Analyste de Projet — SIG et Gestion de Bases de Données",
    category: "Informatique & Télécoms",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-07-25T00:00:00Z"),
    description:
      "Le PNUD recrute un(e) Analyste de Projet spécialisé(e) en Système d'Information " +
      "Géographique (SIG) et Gestion de Bases de Données pour appuyer ses projets en " +
      "République Centrafricaine (postes ouverts niveaux 1 et 2).\n\n" +
      "**Principales responsabilités :**\n" +
      "- Concevoir des cartes thématiques et maintenir les registres fonciers\n" +
      "- Collecter des données socio-économiques géoréférencées\n" +
      "- Archiver et documenter les limites des parcelles (GPS, SIG, imagerie satellite)\n" +
      "- Former les équipes terrain aux outils de collecte numérique\n" +
      "- Superviser les équipes de collecte de données\n" +
      "- Produire des documents cartographiques pour le suivi et la communication " +
      "des projets\n\n" +
      "**Candidature :** Via ImpactPool (lien ci-dessous).",
    requirements:
      "- **Niveau 1 :** Master en Géomatique, Sciences de l'Information Géographique, " +
      "Télédétection ou domaines connexes (sans expérience requise)\n" +
      "- **Niveau 2 :** Licence dans ces domaines + 2 ans d'expérience professionnelle " +
      "en SIG, télédétection et gestion de BDD appliquée à la foresterie ou gestion " +
      "des ressources naturelles\n" +
      "- Maîtrise des logiciels SIG (ArcGIS, QGIS) et des outils GPS/satellite\n" +
      "- Compétences en analyse de données et gestion des parties prenantes\n" +
      "- Apprentissage continu, adaptabilité et collaboration (niveau 1)\n" +
      "- Français courant",
    benefits:
      "- Contrat national PNUD avec rémunération selon grille locale\n" +
      "- Expérience avec une agence onusienne reconnue\n" +
      "- Formation aux outils PNUD et développement professionnel",
    sourceUrl: "https://www.impactpool.org/jobs/1226261",
  },

  // ── IMPACT Initiatives — Responsable de Recherche ────────────────────────────
  {
    orgEmail: "rh@impact-rca.org",
    title:    "Responsable de Recherche (Expatrié)",
    category: "Humanitaire & ONG",
    type:     "CDD",
    location: "Bangui",
    experienceLevel: "Senior",
    featured: false,
    deadline: new Date("2026-07-31T00:00:00Z"),
    description:
      "IMPACT Initiatives recrute un(e) Responsable de Recherche expatrié(e) pour " +
      "diriger son unité de recherche en République Centrafricaine. Le poste implique " +
      "la supervision stratégique de l'ensemble des activités de recherche et d'évaluation " +
      "de la mission.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Développer et mettre en œuvre la stratégie de l'unité alignée sur les priorités " +
      "nationales\n" +
      "- Superviser l'ensemble des évaluations et recherches (évaluation des besoins, " +
      "analyses de marché, études de situation)\n" +
      "- Assurer la conformité avec les guidelines de recherche du siège IMPACT\n" +
      "- Monitorer les cycles de projet et assurer la qualité méthodologique\n" +
      "- Coordonner la collecte, la validation et l'analyse des données\n" +
      "- Gérer la logistique, les finances et les ressources humaines de l'unité\n" +
      "- Représenter IMPACT dans les forums de coordination humanitaire",
    requirements:
      "- Master en relations internationales, sciences politiques, recherche sociale, " +
      "économie ou études de développement\n" +
      "- Minimum 3 ans d'expérience dans des rôles similaires, ou progression avérée " +
      "au sein d'IMPACT\n" +
      "- Expérience préalable en gestion dans des ONG internationales\n" +
      "- Français et anglais courants\n" +
      "- Maîtrise avancée de Microsoft Office\n" +
      "- Logiciels statistiques (R, SPSS, STATA) appréciés",
    benefits:
      "- CDD de 6 mois — départ septembre 2026\n" +
      "- Package expatrié IMPACT Initiatives complet\n" +
      "- Formation aux méthodologies IMPACT/REACH\n" +
      "- Contribution directe à l'amélioration de la réponse humanitaire en RCA",
    sourceUrl: "https://jobscar.info/jobs/impact-initiatives-responsable-de-recherche-expatrie/",
  },
];

// ─── Script principal ──────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Seed v3 — Offres RCA juillet 2026\n");

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
        benefits:        job.benefits     ?? null,
        type:            job.type,
        category:        job.category,
        location:        job.location,
        remote:          false,
        salaryMin:       job.salaryMin    ?? null,
        salaryMax:       job.salaryMax    ?? null,
        salaryCurrency:  "XAF",
        experienceLevel: job.experienceLevel ?? null,
        deadline:        job.deadline     ?? null,
        published:       true,
        featured:        job.featured     ?? false,
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
