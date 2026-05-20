import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
function uid() { return Math.random().toString(36).slice(2, 9); }

const candidates = [
  {
    user: { name: "Marie-Claire NGBONDA", email: "marieclaire.ngbonda@gmail.com", phone: "+236 75 12 34 56" },
    profile: {
      title: "Comptable senior",
      bio: "Comptable expérimentée avec 8 ans d'expérience dans la gestion financière des ONG et entreprises privées en RCA. Maîtrise de Sage Comptabilité, Excel avancé et des normes SYSCOHADA.",
      location: "Bangui",
      skills: "Sage Comptabilité, Excel avancé, SAP, SYSCOHADA, Gestion budgétaire, Audit interne, Trésorerie, QuickBooks",
      experience: "Comptable principale – UNDP Bangui (2019-2024) : Gestion du budget de 12M USD, clôtures mensuelles, rapports aux donateurs. Comptable – Ecobank RCA (2016-2019) : Tenue des livres, rapprochements bancaires, déclarations fiscales.",
      education: "Licence en Comptabilité – Université de Bangui (2015). BTS Finance-Comptabilité – ISBA (2013).",
    },
    cv: {
      firstName: "Marie-Claire", lastName: "NGBONDA", title: "Comptable senior",
      email: "marieclaire.ngbonda@gmail.com", phone: "+236 75 12 34 56", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Comptable expérimentée avec 8 ans d'expérience en ONG et secteur privé. Rigoureuse, autonome et maîtrisant les normes SYSCOHADA et les outils de reporting aux donateurs institutionnels.",
      experiences: [
        { id: uid(), company: "UNDP Bangui", position: "Comptable principale", location: "Bangui", startDate: "2019-03", endDate: "", current: true, description: "Gestion d'un budget annuel de 12M USD. Clôtures mensuelles, rapports aux donateurs (USAID, UE). Supervision d'une équipe de 3 comptables." },
        { id: uid(), company: "Ecobank RCA", position: "Comptable", location: "Bangui", startDate: "2016-06", endDate: "2019-02", current: false, description: "Tenue des livres comptables, rapprochements bancaires quotidiens. Préparation des déclarations fiscales mensuelles et annuelles." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Comptabilité & Finance", startDate: "2012-10", endDate: "2015-07", current: false },
        { id: uid(), school: "ISBA", degree: "BTS", field: "Finance-Comptabilité", startDate: "2010-10", endDate: "2012-06", current: false },
      ],
      skills: [
        { id: uid(), name: "Sage Comptabilité", level: 5 },
        { id: uid(), name: "Microsoft Excel", level: 5 },
        { id: uid(), name: "SAP", level: 4 },
        { id: uid(), name: "SYSCOHADA", level: 5 },
        { id: uid(), name: "Gestion budgétaire", level: 5 },
        { id: uid(), name: "Audit interne", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Courant" },
      ],
      interests: ["Lecture", "Bénévolat", "Cuisine"],
    },
    template: "modern",
  },
  {
    user: { name: "Josué KPANGOU", email: "josue.kpangou@gmail.com", phone: "+236 72 56 78 90" },
    profile: {
      title: "Développeur web full-stack",
      bio: "Développeur passionné spécialisé en React et Node.js. 5 ans d'expérience dans la création d'applications web pour des ONG et startups africaines.",
      location: "Bangui",
      skills: "React, Next.js, Node.js, TypeScript, PostgreSQL, MongoDB, Docker, Git, REST API, Tailwind CSS",
      experience: "Développeur full-stack – KTZ Digital (2021-2024) : Développement de plateformes web et applications mobiles. Développeur web – OIM Bangui (2019-2021) : Maintenance du système de gestion des bénéficiaires.",
      education: "Licence en Informatique – Université de Bangui (2019). Formation JavaScript – OpenClassrooms (2018).",
    },
    cv: {
      firstName: "Josué", lastName: "KPANGOU", title: "Développeur web full-stack",
      email: "josue.kpangou@gmail.com", phone: "+236 72 56 78 90", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Développeur full-stack React/Node.js avec 5 ans d'expérience. Passionné par les solutions tech adaptées au contexte africain. Capable de mener un projet de bout en bout.",
      experiences: [
        { id: uid(), company: "KTZ Digital", position: "Développeur full-stack", location: "Bangui", startDate: "2021-01", endDate: "", current: true, description: "Développement de plateformes web en React/Next.js et Node.js. Mise en place d'APIs REST, bases de données PostgreSQL. Livraison de 8 projets pour des ONG et PME." },
        { id: uid(), company: "OIM Bangui", position: "Développeur web", location: "Bangui", startDate: "2019-06", endDate: "2020-12", current: false, description: "Développement et maintenance du système de gestion des bénéficiaires (PHP/MySQL). Formation des utilisateurs." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Informatique & Réseaux", startDate: "2016-10", endDate: "2019-06", current: false },
      ],
      skills: [
        { id: uid(), name: "React / Next.js", level: 5 },
        { id: uid(), name: "Node.js", level: 5 },
        { id: uid(), name: "TypeScript", level: 4 },
        { id: uid(), name: "PostgreSQL", level: 4 },
        { id: uid(), name: "Docker", level: 3 },
        { id: uid(), name: "Git", level: 5 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Courant" },
      ],
      interests: ["Programmation", "Entrepreneuriat", "Football"],
    },
    template: "creative",
  },
  {
    user: { name: "Fatima OUMAR", email: "fatima.oumar@gmail.com", phone: "+236 77 34 56 78" },
    profile: {
      title: "Logisticienne ONG",
      bio: "Logisticienne humanitaire avec 6 ans d'expérience dans des contextes de crise en Afrique centrale. Spécialisée en gestion de la chaîne d'approvisionnement, gestion de flotte et gestion d'entrepôt.",
      location: "Bangui",
      skills: "Supply chain humanitaire, Gestion d'entrepôt, Gestion de flotte, Procurement, Kobo Toolbox, MS Excel, Rapport de stocks",
      experience: "Logisticienne – NRC Bangui (2021-2024) : Gestion des stocks (250K USD), coordination des transports. Assistante logistique – ACTED RCA (2018-2021) : Suivi des mouvements de fret, inventaires mensuels.",
      education: "Licence en Logistique & Transport – Université de Bangui (2018). Certifications OCHA Logistique Humanitaire.",
    },
    cv: {
      firstName: "Fatima", lastName: "OUMAR", title: "Logisticienne ONG",
      email: "fatima.oumar@gmail.com", phone: "+236 77 34 56 78", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Logisticienne humanitaire 6 ans d'expérience en RCA et Tchad. Expertise en supply chain, gestion d'entrepôt et flotte. Habituée des environnements complexes et des délais serrés.",
      experiences: [
        { id: uid(), company: "NRC Bangui", position: "Logisticienne", location: "Bangui", startDate: "2021-04", endDate: "", current: true, description: "Gestion d'un stock d'articles non-alimentaires d'une valeur de 250K USD. Coordination de 15 véhicules. Sélection et évaluation des fournisseurs locaux." },
        { id: uid(), company: "ACTED RCA", position: "Assistante logistique", location: "Bangui", startDate: "2018-09", endDate: "2021-03", current: false, description: "Suivi des mouvements de fret (air et route). Inventaires mensuels et rapports de stocks. Support aux équipes terrain en préfecture." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Logistique & Supply Chain", startDate: "2015-10", endDate: "2018-06", current: false },
      ],
      skills: [
        { id: uid(), name: "Supply chain humanitaire", level: 5 },
        { id: uid(), name: "Gestion d'entrepôt", level: 5 },
        { id: uid(), name: "Gestion de flotte", level: 4 },
        { id: uid(), name: "Microsoft Excel", level: 4 },
        { id: uid(), name: "Kobo Toolbox", level: 4 },
        { id: uid(), name: "Procurement", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Arabe", level: "Courant" },
        { id: uid(), name: "Sango", level: "Courant" },
        { id: uid(), name: "Anglais", level: "Intermédiaire" },
      ],
      interests: ["Voyage", "Cuisine", "Bénévolat"],
    },
    template: "classic",
  },
  {
    user: { name: "Pierre-Alain NZANGA", email: "pierrealain.nzanga@gmail.com", phone: "+236 70 89 01 23" },
    profile: {
      title: "Responsable RH & Administration",
      bio: "Professionnel RH avec 7 ans d'expérience dans des organisations internationales et nationales. Expert en recrutement, gestion de la paie, droit du travail centrafricain et développement des compétences.",
      location: "Bangui",
      skills: "Recrutement, Gestion de la paie, Droit du travail RCA, Rédaction de contrats, Formation, Évaluation de performance, SIRH, Excel avancé",
      experience: "Responsable RH – Welthungerhilfe RCA (2020-2024) : Management de 120 employés nationaux, recrutement, conformité droit du travail. Assistant RH – MINUSCA (2017-2020) : Gestion administrative du personnel, contrats et congés.",
      education: "Master en Gestion des Ressources Humaines – UCAC Yaoundé (2017). Licence en Sciences de Gestion – Université de Bangui (2015).",
    },
    cv: {
      firstName: "Pierre-Alain", lastName: "NZANGA", title: "Responsable RH & Administration",
      email: "pierrealain.nzanga@gmail.com", phone: "+236 70 89 01 23", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Professionnel RH avec 7 ans d'expérience dans des ONG internationales. Maîtrise du droit du travail centrafricain. Expert en recrutement, paie et développement des compétences.",
      experiences: [
        { id: uid(), company: "Welthungerhilfe RCA", position: "Responsable RH", location: "Bangui", startDate: "2020-02", endDate: "", current: true, description: "Management RH de 120 employés nationaux. Supervision du recrutement (30+ postes/an). Veille et application du code du travail centrafricain. Gestion des conflits et procédures disciplinaires." },
        { id: uid(), company: "MINUSCA", position: "Assistant RH", location: "Bangui", startDate: "2017-08", endDate: "2020-01", current: false, description: "Gestion administrative du personnel national (contrats, congés, absences). Préparation des éléments variables de paie. Classement et archivage des dossiers du personnel." },
      ],
      education: [
        { id: uid(), school: "Université Catholique de l'Afrique Centrale (UCAC)", degree: "Master", field: "Ressources humaines", startDate: "2015-09", endDate: "2017-06", current: false },
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Gestion d'entreprise", startDate: "2012-10", endDate: "2015-07", current: false },
      ],
      skills: [
        { id: uid(), name: "Recrutement", level: 5 },
        { id: uid(), name: "Gestion de la paie", level: 5 },
        { id: uid(), name: "Droit du travail RCA", level: 5 },
        { id: uid(), name: "Microsoft Excel", level: 4 },
        { id: uid(), name: "Formation & développement", level: 4 },
        { id: uid(), name: "Gestion des conflits", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Courant" },
      ],
      interests: ["Lecture", "Football", "Bénévolat"],
    },
    template: "modern",
  },
  {
    user: { name: "Angélique SAMBA", email: "angelique.samba@gmail.com", phone: "+236 75 23 45 67" },
    profile: {
      title: "Infirmière diplômée d'État",
      bio: "Infirmière diplômée avec 5 ans d'expérience en milieu hospitalier et dans des missions humanitaires. Spécialisée en soins d'urgence et en santé maternelle et infantile.",
      location: "Bangui",
      skills: "Soins infirmiers, Soins d'urgence, Santé maternelle et infantile, Vaccination, Prise en charge nutritionnelle, Conseil VIH/SIDA, Triage, Gestion de médicaments",
      experience: "Infirmière – Hôpital de l'Amitié Bangui (2021-2024) : Soins aux patients en service de médecine interne et urgences. Infirmière de terrain – MSF RCA (2019-2021) : Consultations externes, soins d'urgence en zone de conflit.",
      education: "Diplôme d'État Infirmier – Faculté des Sciences de la Santé, Université de Bangui (2019).",
    },
    cv: {
      firstName: "Angélique", lastName: "SAMBA", title: "Infirmière diplômée d'État",
      email: "angelique.samba@gmail.com", phone: "+236 75 23 45 67", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Infirmière diplômée d'État avec 5 ans d'expérience en hôpital et contexte humanitaire. Compétences en urgences, santé maternelle et consultations externes. Engagée et rigoureuse.",
      experiences: [
        { id: uid(), company: "Hôpital de l'Amitié", position: "Infirmière", location: "Bangui", startDate: "2021-07", endDate: "", current: true, description: "Soins aux patients hospitalisés en médecine interne (30 lits). Gestion des urgences de nuit. Supervision des étudiants en stage." },
        { id: uid(), company: "MSF RCA", position: "Infirmière de terrain", location: "Bambari", startDate: "2019-09", endDate: "2021-06", current: false, description: "Consultations externes (80-120 patients/jour). Soins d'urgence en contexte de conflit. Prise en charge de la malnutrition aiguë sévère." },
      ],
      education: [
        { id: uid(), school: "Faculté des Sciences de la Santé – Université de Bangui", degree: "Diplôme d'État", field: "Sciences Infirmières", startDate: "2016-10", endDate: "2019-06", current: false },
      ],
      skills: [
        { id: uid(), name: "Soins infirmiers", level: 5 },
        { id: uid(), name: "Soins d'urgence", level: 5 },
        { id: uid(), name: "Santé maternelle & infantile", level: 5 },
        { id: uid(), name: "Prise en charge nutritionnelle", level: 4 },
        { id: uid(), name: "Conseil VIH/SIDA", level: 4 },
        { id: uid(), name: "Gestion de médicaments", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Intermédiaire" },
      ],
      interests: ["Bénévolat", "Lecture", "Cuisine"],
    },
    template: "classic",
  },
  {
    user: { name: "Emmanuel YAKOMA", email: "emmanuel.yakoma@gmail.com", phone: "+236 72 67 89 01" },
    profile: {
      title: "Coordinateur de projet MEAL",
      bio: "Expert en Suivi-Évaluation-Redevabilité-Apprentissage (MEAL) avec 9 ans d'expérience dans des projets humanitaires et de développement. Maîtrise des méthodes quantitatives et qualitatives de collecte et d'analyse de données.",
      location: "Bangui",
      skills: "MEAL, Kobo Toolbox, ODK, SPSS, R, Excel avancé, Rédaction de rapports, Enquêtes terrain, Gestion de bases de données, QGIS",
      experience: "Coordinateur MEAL – IRC RCA (2019-2024) : Conception et mise en place du système MEAL pour 8 projets (12M USD). Chargé de suivi-évaluation – CARE International RCA (2015-2019) : Collecte de données terrain, analyse et reporting.",
      education: "Master en Statistiques Appliquées – Université de Bangui (2015). Licence en Mathématiques – Université de Bangui (2013).",
    },
    cv: {
      firstName: "Emmanuel", lastName: "YAKOMA", title: "Coordinateur de projet MEAL",
      email: "emmanuel.yakoma@gmail.com", phone: "+236 72 67 89 01", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Expert MEAL avec 9 ans d'expérience dans des projets humanitaires en RCA. Maîtrise des outils de collecte numérique (KoboToolbox, ODK) et d'analyse statistique (SPSS, R). Reconnu pour la qualité de ses rapports aux donateurs.",
      experiences: [
        { id: uid(), company: "IRC RCA", position: "Coordinateur MEAL", location: "Bangui", startDate: "2019-05", endDate: "", current: true, description: "Conception et gestion du système MEAL pour 8 projets (12M USD). Supervision de 6 agents MEAL terrain. Rédaction des rapports trimestriels aux donateurs (USAID, ECHO)." },
        { id: uid(), company: "CARE International RCA", position: "Chargé de suivi-évaluation", location: "Bangui", startDate: "2015-03", endDate: "2019-04", current: false, description: "Collecte de données terrain par enquêtes quantitatives (n=2000+). Analyse statistique (SPSS). Rédaction de rapports d'évaluation à mi-parcours et finaux." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Master", field: "Statistiques Appliquées", startDate: "2013-10", endDate: "2015-07", current: false },
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Mathématiques", startDate: "2010-10", endDate: "2013-07", current: false },
      ],
      skills: [
        { id: uid(), name: "MEAL", level: 5 },
        { id: uid(), name: "Kobo Toolbox / ODK", level: 5 },
        { id: uid(), name: "SPSS", level: 5 },
        { id: uid(), name: "R", level: 4 },
        { id: uid(), name: "Microsoft Excel", level: 5 },
        { id: uid(), name: "Rédaction de rapports", level: 5 },
        { id: uid(), name: "QGIS", level: 3 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Bilingue" },
      ],
      interests: ["Informatique", "Football", "Engagement associatif"],
    },
    template: "modern",
  },
  {
    user: { name: "Rosalie MBATINA", email: "rosalie.mbatina@gmail.com", phone: "+236 70 45 67 89" },
    profile: {
      title: "Chargée de communication & marketing",
      bio: "Communicante créative avec 4 ans d'expérience en communication institutionnelle, community management et production de contenus visuels. À l'aise sur les réseaux sociaux et la création graphique.",
      location: "Bangui",
      skills: "Community management, Canva, Adobe Photoshop, Rédaction web, Facebook/Instagram Ads, Stratégie digitale, Création de contenu, Relations presse",
      experience: "Chargée de communication – UNICEF RCA (2022-2024) : Gestion des réseaux sociaux, production de supports visuels, rédaction de communiqués. Assistante communication – Gouvernement RCA / MICT (2020-2022).",
      education: "Licence en Journalisme & Communication – Université de Bangui (2020).",
    },
    cv: {
      firstName: "Rosalie", lastName: "MBATINA", title: "Chargée de communication & marketing",
      email: "rosalie.mbatina@gmail.com", phone: "+236 70 45 67 89", location: "Bangui, RCA",
      website: "", linkedin: "",
      summary: "Communicante créative et polyvalente. Expérience en communication institutionnelle et digitale. Forte capacité de création de contenus visuels et rédactionnels adaptés aux publics africains.",
      experiences: [
        { id: uid(), company: "UNICEF RCA", position: "Chargée de communication", location: "Bangui", startDate: "2022-01", endDate: "", current: true, description: "Gestion des comptes Facebook/Twitter/Instagram (50K+ abonnés). Production de 30+ supports visuels/mois. Rédaction de communiqués et articles de presse." },
        { id: uid(), company: "Ministère des TIC – RCA", position: "Assistante communication", location: "Bangui", startDate: "2020-09", endDate: "2021-12", current: false, description: "Couverture photo et vidéo des événements officiels. Rédaction de discours et contenus pour le site du ministère." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Journalisme & Médias", startDate: "2017-10", endDate: "2020-07", current: false },
      ],
      skills: [
        { id: uid(), name: "Community management", level: 5 },
        { id: uid(), name: "Canva", level: 5 },
        { id: uid(), name: "Adobe Photoshop", level: 4 },
        { id: uid(), name: "Rédaction web", level: 5 },
        { id: uid(), name: "Stratégie digitale", level: 4 },
        { id: uid(), name: "Relations presse", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Natif" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Courant" },
      ],
      interests: ["Photographie", "Cinéma", "Voyages"],
    },
    template: "creative",
  },
  {
    user: { name: "Constant MOKOUA", email: "constant.mokoua@gmail.com", phone: "+236 77 90 12 34" },
    profile: {
      title: "Agronome – Superviseur agricole",
      bio: "Agronome avec 6 ans d'expérience dans des projets de sécurité alimentaire et de développement rural en RCA. Compétences en appui technique aux agriculteurs, gestion de semences et suivi des cultures vivrières.",
      location: "Bambari",
      skills: "Agronomie tropicale, Sécurité alimentaire, Gestion de semences, Formation agriculteurs, Kobo Toolbox, Rédaction de rapports, Travail en zone rurale",
      experience: "Superviseur agricole – FAO RCA (2020-2024) : Supervision de 1200 agriculteurs bénéficiaires, distribution de semences (40T), suivi des cultures dans 5 préfectures. Technicien agricole – CARITAS RCA (2018-2020).",
      education: "Licence en Agronomie – Université de Bangui (2018).",
    },
    cv: {
      firstName: "Constant", lastName: "MOKOUA", title: "Agronome – Superviseur agricole",
      email: "constant.mokoua@gmail.com", phone: "+236 77 90 12 34", location: "Bambari, RCA",
      website: "", linkedin: "",
      summary: "Agronome spécialisé en sécurité alimentaire et développement rural. 6 ans d'expérience sur le terrain en RCA. Maîtrise des techniques d'appui aux agriculteurs et de la gestion de projets agricoles en contexte difficile.",
      experiences: [
        { id: uid(), company: "FAO RCA", position: "Superviseur agricole", location: "Bambari / Bangui", startDate: "2020-03", endDate: "", current: true, description: "Supervision de 1200 agriculteurs bénéficiaires dans 5 préfectures. Distribution et suivi de 40 tonnes de semences certifiées. Collecte et analyse des données de production agricole." },
        { id: uid(), company: "CARITAS RCA", position: "Technicien agricole", location: "Bossangoa", startDate: "2018-08", endDate: "2020-02", current: false, description: "Formation de 350 familles aux bonnes pratiques agricoles. Mise en place de jardins maraîchers communautaires. Suivi phytosanitaire des cultures." },
      ],
      education: [
        { id: uid(), school: "Université de Bangui", degree: "Licence", field: "Agronomie", startDate: "2015-10", endDate: "2018-06", current: false },
      ],
      skills: [
        { id: uid(), name: "Agronomie tropicale", level: 5 },
        { id: uid(), name: "Sécurité alimentaire", level: 5 },
        { id: uid(), name: "Gestion de semences", level: 5 },
        { id: uid(), name: "Formation agriculteurs", level: 4 },
        { id: uid(), name: "Kobo Toolbox", level: 4 },
        { id: uid(), name: "Rédaction de rapports", level: 4 },
      ],
      languages: [
        { id: uid(), name: "Français", level: "Courant" },
        { id: uid(), name: "Sango", level: "Natif" },
        { id: uid(), name: "Anglais", level: "Débutant" },
      ],
      interests: ["Agriculture", "Jardinage", "Football"],
    },
    template: "classic",
  },
];

async function main() {
  const pw = await bcrypt.hash("KtzEmploi@2026", 12);
  let count = 0;

  for (const c of candidates) {
    try {
      const user = await prisma.user.create({
        data: {
          name: c.user.name,
          email: c.user.email,
          phone: c.user.phone,
          password: pw,
          role: "JOBSEEKER",
        },
      });

      await prisma.jobSeekerProfile.create({
        data: {
          userId: user.id,
          title: c.profile.title,
          bio: c.profile.bio,
          phone: c.user.phone,
          location: c.profile.location,
          skills: c.profile.skills,
          experience: c.profile.experience,
          education: c.profile.education,
          cvPublic: true,
        },
      });

      await prisma.cvBuilder.create({
        data: {
          userId: user.id,
          data: JSON.stringify(c.cv),
          template: c.template,
        },
      });

      count++;
      console.log("✓ " + c.user.name + " — " + c.profile.title);
    } catch (err) {
      console.error("✗ " + c.user.name + ":", err.message);
    }
  }

  console.log("\n" + count + "/" + candidates.length + " profils créés avec succès.");
  await prisma.$disconnect();
}

main().catch(console.error);
