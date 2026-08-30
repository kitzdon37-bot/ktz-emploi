/**
 * Seed — Nouvelles offres d'emploi RCA août-septembre 2026
 * node scripts/seed-offres-aout-sept-2026.mjs
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Parse "600 000 FCFA – 900 000 FCFA" → { salaryMin: 600000, salaryMax: 900000 }
function parseSalary(str) {
  if (!str) return { salaryMin: null, salaryMax: null };
  const nums = str.replace(/[^\d\s–-]/g, "").split(/[–-]/).map(s => parseInt(s.replace(/\s/g, ""), 10)).filter(n => !isNaN(n));
  return { salaryMin: nums[0] ?? null, salaryMax: nums[1] ?? null };
}

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

// Nouvelles offres — toutes avec des deadlines en septembre/octobre 2026
const OFFERS = [

  // ── OIM — Chargé(e) de Projet DDR ────────────────────────────────────────────
  {
    orgEmail: "recrutement@iom-rca.org",
    title:    "Chargé(e) de Projet DDR (Désarmement, Démobilisation et Réintégration)",
    category: "Humanitaire & ONG",
    type:     "CDD",
    location: "Bangui",
    salary:   null,
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-09-12T00:00:00Z"),
    description:
      "L'OIM recrute un(e) Chargé(e) de Projet DDR pour appuyer la mise en œuvre des " +
      "programmes de désarmement, démobilisation et réintégration en RCA.\n\n" +
      "**Principales responsabilités :**\n" +
      "- Coordonner les activités DDR sur le terrain avec les partenaires nationaux et internationaux\n" +
      "- Assurer le suivi et l'évaluation des bénéficiaires tout au long du processus DDR\n" +
      "- Élaborer des rapports de situation hebdomadaires et mensuels\n" +
      "- Maintenir les bases de données de bénéficiaires et produire des analyses\n" +
      "- Appuyer la coordination inter-agences (MINUSCA, UNDP, gouvernement RCA)\n" +
      "- Faciliter les formations sur la réintégration socioéconomique\n\n" +
      "**Candidature :** CV + lettre de motivation à envoyer via le portail IOM : " +
      "https://recruit.iom.int",
    requirements:
      "- Licence ou Master en sciences sociales, droit, relations internationales ou équivalent\n" +
      "- Minimum 3 ans d'expérience dans des programmes DDR, réintégration ou paix\n" +
      "- Bonne connaissance du contexte sécuritaire centrafricain\n" +
      "- Maîtrise du français ; anglais professionnel apprécié\n" +
      "- Compétences en gestion de bases de données (Excel, kobo, ODK)\n" +
      "- Capacité à travailler sous pression dans des zones difficiles",
    benefits:
      "- Contrat CDD de 6 mois renouvelable\n" +
      "- Salaire selon grille IOM et expérience\n" +
      "- Couverture médicale et assurance vie\n" +
      "- Formation continue IOM",
    sourceUrl: "https://www.iom.int/careers",
  },

  // ── UNICEF — Consultant(e) en Communication pour le Développement ──────────────
  {
    orgEmail: "rh@unicef-rca.org",
    title:    "Consultant(e) en Communication pour le Développement (C4D)",
    category: "Communication / Médias",
    type:     "FREELANCE",
    location: "Bangui",
    salary:   "800 000 FCFA – 1 200 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-09-10T00:00:00Z"),
    description:
      "L'UNICEF RCA recherche un(e) Consultant(e) C4D pour renforcer ses activités de " +
      "communication et de mobilisation sociale dans les domaines de la santé, la nutrition " +
      "et la protection de l'enfance.\n\n" +
      "**Missions principales :**\n" +
      "- Concevoir et mettre en œuvre des stratégies de communication pour le changement " +
      "de comportement (CCC)\n" +
      "- Développer des supports IEC adaptés aux contextes locaux (affiches, spots radio, vidéos)\n" +
      "- Former les agents communautaires aux techniques de sensibilisation\n" +
      "- Superviser les campagnes de mobilisation sociale dans les préfectures ciblées\n" +
      "- Produire des rapports d'activité et évaluer l'impact des interventions\n\n" +
      "**Candidature :** Soumettre CV + proposition technique + offre financière à " +
      "bgnhr@unicef.org avec objet : C4D-RCA-2026",
    requirements:
      "- Master en communication, sciences sociales, santé publique ou équivalent\n" +
      "- Minimum 5 ans d'expérience en C4D, communication santé ou plaidoyer\n" +
      "- Expérience avérée avec des ONG/agences UN en contexte humanitaire\n" +
      "- Excellent rédactionnel en français ; connaissance du Sango appréciée\n" +
      "- Maîtrise des outils de création (Canva, Adobe, etc.)\n" +
      "- Disponibilité immédiate",
    benefits:
      "- Contrat de consultance de 3 mois\n" +
      "- Rémunération selon expérience et grille UNICEF\n" +
      "- Frais de déplacement terrain pris en charge",
    sourceUrl: "https://www.unicef.org/careers",
  },

  // ── ALIMA — Coordinateur(trice) Médical(e) de Projet ─────────────────────────
  {
    orgEmail: "rh@alima-rca.org",
    title:    "Coordinateur(trice) Médical(e) de Projet",
    category: "Médecine & Santé",
    type:     "CDD",
    location: "Bossangoa",
    salary:   null,
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-09-20T00:00:00Z"),
    description:
      "ALIMA recrute un(e) Coordinateur(trice) Médical(e) de Projet pour superviser ses " +
      "activités médicales dans la préfecture de l'Ouham (Bossangoa).\n\n" +
      "**Responsabilités :**\n" +
      "- Superviser la mise en œuvre médicale du projet (santé primaire, nutrition, maternité)\n" +
      "- Assurer la qualité des soins et le respect des protocoles ALIMA et nationaux\n" +
      "- Manager et former les équipes médicales nationales et expatriées\n" +
      "- Coordonner avec le ministère de la Santé, l'OMS et les autres acteurs santé\n" +
      "- Analyser les données épidémiologiques et alerter sur les tendances\n" +
      "- Participer aux réunions de coordination humanitaire (clusters santé, nutrition)\n\n" +
      "**Candidature :** Postuler via careers.alima.ngo",
    requirements:
      "- Diplôme de médecin généraliste ou spécialiste\n" +
      "- Minimum 2 ans d'expérience en médecine humanitaire\n" +
      "- Expérience en gestion d'équipes médicales multiculturelles\n" +
      "- Maîtrise du français ; anglais intermédiaire\n" +
      "- Sens de l'organisation et capacité à travailler en zone d'insécurité\n" +
      "- Permis de conduire valide",
    benefits:
      "- Salaire selon grille ALIMA expatrié\n" +
      "- Per diem, logement et transport assurés\n" +
      "- Couverture médicale complète + assurance rapatriement\n" +
      "- R&R tous les 2 mois",
    sourceUrl: "https://careers.alima.ngo",
  },

  // ── NRC — Chargé(e) d'Information Counselling and Legal Assistance ────────────
  {
    orgEmail: "rh@nrc-rca.org",
    title:    "Chargé(e) ICLA (Information, Conseil et Assistance Juridique)",
    category: "Droit & Justice",
    type:     "CDD",
    location: "Kaga Bandoro",
    salary:   "550 000 FCFA – 750 000 FCFA",
    experienceLevel: "Junior",
    featured: false,
    deadline: new Date("2026-09-05T00:00:00Z"),
    description:
      "Le Conseil Norvégien pour les Réfugiés (NRC) recrute un(e) Chargé(e) ICLA pour " +
      "appuyer les personnes déplacées dans leurs démarches administratives et juridiques " +
      "dans la région de Kaga Bandoro.\n\n" +
      "**Missions :**\n" +
      "- Conduire des séances d'information juridique collectives (droit civil, foncier, documentation)\n" +
      "- Fournir des conseils individuels aux bénéficiaires sur leurs droits et recours\n" +
      "- Accompagner les démarches d'obtention ou renouvellement de documents civils\n" +
      "- Effectuer des visites de monitoring dans les sites de déplacement\n" +
      "- Renseigner les bases de données et produire des rapports hebdomadaires\n\n" +
      "**Dépôt de candidature :** CV + lettre de motivation à envoyer à car@nrc.no " +
      "avant le 5 septembre 2026.",
    requirements:
      "- Licence en droit, sciences sociales ou équivalent\n" +
      "- Minimum 1 an d'expérience dans un contexte humanitaire ou légal\n" +
      "- Connaissance des lois centrafricaines sur les droits des personnes déplacées\n" +
      "- Maîtrise du français ; Sango courant indispensable\n" +
      "- Intégrité, empathie et sens de la confidentialité\n" +
      "- Résidence à Kaga Bandoro ou mobilité assurée",
    benefits:
      "- Contrat CDD de 6 mois renouvelable\n" +
      "- Salaire selon grille NRC nationale\n" +
      "- Indemnités de déplacement terrain\n" +
      "- Formation initiale NRC",
    sourceUrl: "https://www.nrc.no/careers",
  },

  // ── Expertise France — Chef de Projet Gouvernance ─────────────────────────────
  {
    orgEmail: "rh@expertisefrance-rca.fr",
    title:    "Chef(fe) de Projet Gouvernance et État de Droit",
    category: "Droit & Justice",
    type:     "CDD",
    location: "Bangui",
    salary:   null,
    experienceLevel: "Expert",
    featured: true,
    deadline: new Date("2026-09-25T00:00:00Z"),
    description:
      "Expertise France recrute un(e) Chef(fe) de Projet pour piloter un programme d'appui " +
      "à la gouvernance et à l'état de droit en République Centrafricaine.\n\n" +
      "**Responsabilités principales :**\n" +
      "- Assurer la coordination opérationnelle et stratégique du projet\n" +
      "- Superviser les experts nationaux et internationaux affectés au projet\n" +
      "- Gérer les relations avec les institutions bénéficiaires (ministères, justice, sécurité)\n" +
      "- Planifier et suivre les activités, le budget et les résultats (cadre logique)\n" +
      "- Préparer les rapports pour les bailleurs (UE, AFD)\n" +
      "- Représenter le projet dans les instances de coordination\n\n" +
      "**Candidature :** Via le portail Expertise France : www.expertisefrance.fr/offres-emploi",
    requirements:
      "- Master en droit public, sciences politiques, administration publique ou équivalent\n" +
      "- Minimum 7 ans d'expérience en gestion de projets de coopération\n" +
      "- Expérience confirmée en Afrique subsaharienne ou contexte post-conflit\n" +
      "- Maîtrise des outils de gestion de projet (cadre logique, GANTT)\n" +
      "- Excellente maîtrise du français ; anglais professionnel exigé\n" +
      "- Connaissance des procédures UE/AFD appréciée",
    benefits:
      "- Contrat de droit français, statut expatrié\n" +
      "- Package expatrié compétitif (logement, transport, assurance)\n" +
      "- Durée de mission : 24 mois renouvelables\n" +
      "- Prise de poste : novembre 2026",
    sourceUrl: "https://www.expertisefrance.fr/offres-emploi",
  },

  // ── Ecobank — Chargé(e) de Crédit PME ─────────────────────────────────────────
  {
    orgEmail: "rh@ecobank-rca.cf",
    title:    "Chargé(e) de Crédit PME",
    category: "Banque & Finance",
    type:     "CDI",
    location: "Bangui",
    salary:   "450 000 FCFA – 700 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-09-15T00:00:00Z"),
    description:
      "Ecobank RCA recrute un(e) Chargé(e) de Crédit PME pour développer et gérer " +
      "un portefeuille de clients PME/TPE dans le cadre de sa stratégie de financement " +
      "des entreprises locales.\n\n" +
      "**Missions :**\n" +
      "- Prospecter, développer et fidéliser un portefeuille de clients PME\n" +
      "- Analyser les dossiers de crédit et évaluer la capacité de remboursement\n" +
      "- Rédiger les propositions de financement et les soumettre au comité de crédit\n" +
      "- Assurer le suivi des engagements et le recouvrement des créances\n" +
      "- Veiller à la conformité des dossiers avec la réglementation bancaire COBAC\n" +
      "- Atteindre les objectifs commerciaux mensuels\n\n" +
      "**Candidature :** Envoyer CV + lettre de motivation à rh@ecobank-rca.cf " +
      "avec objet : CREDIT-PME-2026.",
    requirements:
      "- BTS ou Licence en banque, finance, comptabilité ou gestion\n" +
      "- Minimum 2 ans d'expérience en banque ou microfinance (analyse crédit)\n" +
      "- Bonne connaissance du tissu économique centrafricain\n" +
      "- Sens commercial, rigueur et autonomie\n" +
      "- Maîtrise des outils bureautiques (Excel avancé)\n" +
      "- Nationalité centrafricaine",
    benefits:
      "- CDI avec période d'essai de 3 mois\n" +
      "- Salaire fixe + primes sur objectifs\n" +
      "- Assurance maladie et prévoyance\n" +
      "- Formation Ecobank Group",
    sourceUrl: "https://ecobank.com/careers",
  },

  // ── SODECA — Ingénieur(e) en Génie Civil ─────────────────────────────────────
  {
    orgEmail: "rh@sodeca-rca.com",
    title:    "Ingénieur(e) en Génie Civil — Réseaux d'Eau",
    category: "BTP & Construction",
    type:     "CDI",
    location: "Bangui",
    salary:   "600 000 FCFA – 900 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-09-18T00:00:00Z"),
    description:
      "La SODECA (Société de Distribution d'Eau en Centrafrique) recrute un(e) Ingénieur(e) " +
      "en Génie Civil spécialisé(e) en réseaux d'eau potable pour renforcer ses équipes " +
      "techniques à Bangui.\n\n" +
      "**Responsabilités :**\n" +
      "- Concevoir, superviser et réceptionner les travaux d'extension ou de réhabilitation " +
      "du réseau d'adduction d'eau\n" +
      "- Établir les devis, métrés et cahiers des charges techniques\n" +
      "- Contrôler la qualité des travaux réalisés par les prestataires\n" +
      "- Assurer la maintenance préventive et curative des infrastructures hydrauliques\n" +
      "- Rédiger les rapports techniques et les plans de récolement\n" +
      "- Coordonner avec les services communaux et les bailleurs de fonds",
    requirements:
      "- Diplôme d'ingénieur en génie civil, hydraulique ou eau et assainissement\n" +
      "- Minimum 3 ans d'expérience en conception ou supervision de réseaux AEP\n" +
      "- Maîtrise des logiciels de conception (AutoCAD, EPANET)\n" +
      "- Connaissance des normes et réglementations en vigueur\n" +
      "- Rigueur, sens des responsabilités et esprit d'équipe\n" +
      "- Nationalité centrafricaine ou résidence permanente en RCA",
    benefits:
      "- CDI avec avantages sociaux SODECA\n" +
      "- Salaire selon expérience + prime de rendement\n" +
      "- Véhicule de service pour les déplacements terrain",
    sourceUrl: null,
  },

  // ── TeleCa — Responsable Marketing Digital ────────────────────────────────────
  {
    orgEmail: "rh@teleca.cf",
    title:    "Responsable Marketing Digital",
    category: "Marketing / Communication",
    type:     "CDI",
    location: "Bangui",
    salary:   "500 000 FCFA – 750 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-09-22T00:00:00Z"),
    description:
      "TeleCa Centrafrique recrute un(e) Responsable Marketing Digital pour piloter " +
      "sa stratégie de communication digitale et développer sa présence en ligne.\n\n" +
      "**Missions :**\n" +
      "- Définir et exécuter la stratégie digitale de TeleCa (réseaux sociaux, SEO/SEM, email marketing)\n" +
      "- Créer et gérer les contenus pour Facebook, Instagram, WhatsApp Business et le site web\n" +
      "- Piloter les campagnes publicitaires digitales et analyser leurs performances\n" +
      "- Gérer la communauté en ligne et l'e-réputation de la marque\n" +
      "- Coordonner avec les équipes commerciales pour les offres promotionnelles\n" +
      "- Réaliser des rapports mensuels de performance (KPIs, ROI)\n\n" +
      "**Candidature :** CV + portfolio + lettre de motivation à rh@teleca.cf",
    requirements:
      "- Licence ou Master en marketing, communication ou digital\n" +
      "- Minimum 2 ans d'expérience en marketing digital (entreprise ou agence)\n" +
      "- Maîtrise des outils : Meta Ads, Google Analytics, Canva, Mailchimp\n" +
      "- Créativité, autonomie et sens des résultats\n" +
      "- Bonne plume en français ; anglais apprécié\n" +
      "- Connaissance du marché centrafricain obligatoire",
    benefits:
      "- CDI avec période d'essai 3 mois\n" +
      "- Salaire selon profil + intéressement aux résultats\n" +
      "- Équipement informatique fourni\n" +
      "- Évolution rapide dans une entreprise en forte croissance",
    sourceUrl: null,
  },

  // ── Orange Centrafrique — Technicien(ne) Support Client ──────────────────────
  {
    orgEmail: "recrutement@orange-rca.cf",
    title:    "Technicien(ne) Support Client & Réseau",
    category: "Informatique & Télécoms",
    type:     "CDI",
    location: "Bangui",
    salary:   "350 000 FCFA – 500 000 FCFA",
    experienceLevel: "Junior",
    featured: false,
    deadline: new Date("2026-09-08T00:00:00Z"),
    description:
      "Orange Centrafrique recrute un(e) Technicien(ne) Support Client & Réseau pour " +
      "renforcer son centre de support technique et améliorer l'expérience client.\n\n" +
      "**Responsabilités :**\n" +
      "- Traiter les demandes et réclamations clients (téléphone, agence, email)\n" +
      "- Diagnostiquer et résoudre les incidents réseau, data et voix\n" +
      "- Assurer le suivi des tickets d'incidents jusqu'à résolution\n" +
      "- Configurer les équipements clients (box 4G, téléphones, paramétrage APN)\n" +
      "- Rédiger des rapports d'incidents et alimenter la base de connaissances\n" +
      "- Participer aux astreintes techniques si nécessaire",
    requirements:
      "- BTS ou Licence en informatique, réseaux ou télécommunications\n" +
      "- Première expérience en support technique ou relation client appréciée\n" +
      "- Connaissance des réseaux mobiles 2G/4G et protocoles IP\n" +
      "- Excellentes capacités relationnelles et sens du service\n" +
      "- Maîtrise du français ; Sango courant indispensable\n" +
      "- Disponibilité pour les horaires décalés (rotation)",
    benefits:
      "- CDI Orange Centrafrique\n" +
      "- Salaire fixe + prime qualité + ligne Orange offerte\n" +
      "- Formation initiale et continue Orange Group\n" +
      "- Mutuelle santé",
    sourceUrl: "https://www.orange.cf/fr/nous-rejoindre",
  },

  // ── WCS — Coordinateur(trice) Conservation Communautaire ─────────────────────
  {
    orgEmail: "rh@wcs-rca.org",
    title:    "Coordinateur(trice) Conservation Communautaire",
    category: "Environnement & Agriculture",
    type:     "CDD",
    location: "Dzanga-Sangha",
    salary:   "700 000 FCFA – 950 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: true,
    deadline: new Date("2026-09-30T00:00:00Z"),
    description:
      "La Wildlife Conservation Society (WCS) recrute un(e) Coordinateur(trice) de la " +
      "Conservation Communautaire pour sa réserve de Dzanga-Sangha.\n\n" +
      "**Missions :**\n" +
      "- Coordonner les activités de conservation avec les communautés riveraines de la réserve\n" +
      "- Mettre en œuvre les programmes d'éducation environnementale\n" +
      "- Appuyer les alternatives économiques durables pour les populations locales\n" +
      "- Superviser les éco-gardes communautaires et leurs patrouilles\n" +
      "- Développer des partenariats avec les leaders locaux, ONG et autorités\n" +
      "- Collecter et analyser les données socioéconomiques des communautés\n" +
      "- Rédiger des rapports d'activité et des propositions de projets",
    requirements:
      "- Licence ou Master en écologie, développement rural, sciences sociales ou équivalent\n" +
      "- Minimum 3 ans d'expérience en conservation ou développement communautaire\n" +
      "- Connaissance des forêts tropicales humides et des peuples autochtones (Baka, Aka)\n" +
      "- Capacité à travailler en zone isolée et en forêt dense\n" +
      "- Maîtrise du français ; langues locales (Sango, Aka) fortement appréciées\n" +
      "- Permis de conduire (moto) requis",
    benefits:
      "- CDD 12 mois renouvelable\n" +
      "- Salaire selon grille WCS + indemnités d'isolement\n" +
      "- Logement sur site fourni\n" +
      "- Couverture médicale complète",
    sourceUrl: "https://www.wcs.org/about-us/careers",
  },

  // ── MSF — Infirmier(ère) Superviseur(e) ─────────────────────────────────────
  {
    orgEmail: "rh@msf-rca.org",
    title:    "Infirmier(ère) Superviseur(e) — Santé Primaire",
    category: "Médecine & Santé",
    type:     "CDD",
    location: "Bambari",
    salary:   null,
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-09-14T00:00:00Z"),
    description:
      "MSF recrute un(e) Infirmier(ère) Superviseur(e) pour ses activités de santé " +
      "primaire à Bambari (province de la Ouaka).\n\n" +
      "**Responsabilités :**\n" +
      "- Superviser et encadrer les équipes soignantes dans les postes de santé\n" +
      "- Assurer la qualité des soins infirmiers et le respect des protocoles MSF\n" +
      "- Gérer les stocks de médicaments et de consommables médicaux\n" +
      "- Organiser les formations du personnel infirmier national\n" +
      "- Participer aux activités de surveillance épidémiologique\n" +
      "- Contribuer aux rapports médicaux hebdomadaires",
    requirements:
      "- Diplôme d'État d'infirmier(e) ou sage-femme\n" +
      "- Minimum 2 ans d'expérience en soins infirmiers, dont 1 an en supervision\n" +
      "- Expérience en ONG humanitaire appréciée\n" +
      "- Connaissance des maladies endémiques (paludisme, choléra, malnutrition)\n" +
      "- Maîtrise du français ; Sango indispensable\n" +
      "- Mobilité géographique obligatoire",
    benefits:
      "- Contrat MSF national de 6 mois renouvelable\n" +
      "- Salaire selon grille MSF + perdiem\n" +
      "- Formation MSF et couverture santé\n" +
      "- Logement ou indemnité logement",
    sourceUrl: "https://www.msf.org/careers",
  },

  // ── FAO — Agronome Terrain ────────────────────────────────────────────────────
  {
    orgEmail: "rh@fao-rca.org",
    title:    "Agronome de Terrain — Programme Sécurité Alimentaire",
    category: "Agriculture & Élevage",
    type:     "CDD",
    location: "Berbérati",
    salary:   "600 000 FCFA – 850 000 FCFA",
    experienceLevel: "Intermediaire",
    featured: false,
    deadline: new Date("2026-09-06T00:00:00Z"),
    description:
      "La FAO recrute un(e) Agronome de Terrain pour appuyer la mise en œuvre de son " +
      "programme de relèvement agricole dans la Mambéré-Kadéï (Berbérati).\n\n" +
      "**Tâches principales :**\n" +
      "- Appuyer les ménages agricoles dans la mise en place des activités maraîchères " +
      "et vivrières\n" +
      "- Former les agriculteurs sur les techniques agro-écologiques et la gestion des semences\n" +
      "- Superviser la distribution des intrants agricoles (semences, outils, engrais)\n" +
      "- Assurer le suivi-évaluation des activités agricoles (collecte de données, rapports)\n" +
      "- Coordonner avec les autorités locales, partenaires et bénéficiaires\n" +
      "- Contribuer aux enquêtes de sécurité alimentaire (Cadre Harmonisé, SMART)\n\n" +
      "**Dépôt :** CV + lettre de motivation à rh@fao-rca.org avant le 6 septembre 2026.",
    requirements:
      "- Licence ou Ingénieur en agronomie, agriculture, développement rural\n" +
      "- Minimum 2 ans d'expérience en terrain agricole ou sécurité alimentaire\n" +
      "- Connaissance des systèmes agricoles centrafricains\n" +
      "- Capacité à travailler en milieu rural et déplacements fréquents\n" +
      "- Maîtrise du français ; langues locales de la région appréciées\n" +
      "- Maîtrise d'Excel et koboToolbox",
    benefits:
      "- Contrat de 8 mois renouvelable\n" +
      "- Rémunération selon barème FAO nationale\n" +
      "- Frais de mission et transport pris en charge\n" +
      "- Formation sur les outils FAO",
    sourceUrl: "https://www.fao.org/careers",
  },

  // ── Street Child — Officier(e) MEAL ──────────────────────────────────────────
  {
    orgEmail: "rh@street-child-rca.org",
    title:    "Officier(e) MEAL (Suivi, Évaluation, Apprentissage et Redevabilité)",
    category: "Humanitaire & ONG",
    type:     "CDD",
    location: "Bangui",
    salary:   "500 000 FCFA – 700 000 FCFA",
    experienceLevel: "Junior",
    featured: false,
    deadline: new Date("2026-09-11T00:00:00Z"),
    description:
      "Street Child recrute un(e) Officier(e) MEAL pour renforcer ses systèmes de " +
      "suivi-évaluation dans ses programmes d'éducation et de protection de l'enfance.\n\n" +
      "**Responsabilités :**\n" +
      "- Développer et maintenir les outils MEAL (plans de S&E, bases de données, indicateurs)\n" +
      "- Conduire des visites de terrain régulières pour vérifier la qualité des données\n" +
      "- Organiser des évaluations de programmes et des enquêtes auprès des bénéficiaires\n" +
      "- Former les équipes terrain à la collecte de données (mobile data collection)\n" +
      "- Produire des rapports de qualité pour les bailleurs de fonds\n" +
      "- Gérer les mécanismes de remontée des feedbacks et plaintes des bénéficiaires",
    requirements:
      "- Licence en statistiques, sciences sociales, économie du développement ou équivalent\n" +
      "- Minimum 1 an d'expérience en MEAL dans le secteur humanitaire\n" +
      "- Maîtrise des outils de collecte de données mobiles (Kobo, ODK)\n" +
      "- Compétences analytiques (Excel, SPSS ou Stata)\n" +
      "- Bonne maîtrise du français ; anglais professionnel apprécié\n" +
      "- Rigueur, sens du détail et esprit d'équipe",
    benefits:
      "- CDD de 6 mois renouvelable\n" +
      "- Salaire selon grille Street Child\n" +
      "- Formation MEAL et opportunité de développement professionnel",
    sourceUrl: "https://www.street-child.org/careers",
  },
];

// ─── Insertion en base ────────────────────────────────────────────────────────
let created = 0;
let skipped = 0;

for (const offer of OFFERS) {
  // Récupérer la company liée à cet email
  const user = await prisma.user.findUnique({ where: { email: offer.orgEmail } });
  if (!user) { console.log(`⚠️  User introuvable : ${offer.orgEmail}`); skipped++; continue; }

  const company = await prisma.company.findUnique({ where: { userId: user.id } });
  if (!company) { console.log(`⚠️  Company introuvable pour : ${offer.orgEmail}`); skipped++; continue; }

  // Éviter les doublons
  const exists = await prisma.job.findFirst({ where: { title: offer.title, companyId: company.id } });
  if (exists) { console.log(`⏭️  Existe déjà : ${offer.title}`); skipped++; continue; }

  const slug = slugify(offer.title) + "-" + Date.now().toString().slice(-6);
  const { salaryMin, salaryMax } = parseSalary(offer.salary);

  await prisma.job.create({
    data: {
      title:           offer.title,
      slug,
      description:     offer.description,
      requirements:    offer.requirements ?? null,
      benefits:        offer.benefits ?? null,
      category:        offer.category,
      type:            offer.type,
      location:        offer.location,
      salaryMin,
      salaryMax,
      experienceLevel: offer.experienceLevel ?? null,
      published:       true,
      featured:        offer.featured ?? false,
      deadline:        offer.deadline ?? null,
      companyId:       company.id,
    },
  });

  console.log(`✓ Créé : ${offer.title} (${company.name})`);
  created++;
}

const total = await prisma.job.count({ where: { published: true } });
console.log(`\n✅ ${created} nouvelles offres créées | ${skipped} ignorées`);
console.log(`📋 Total offres actives sur le site : ${total}`);

await prisma.$disconnect();
