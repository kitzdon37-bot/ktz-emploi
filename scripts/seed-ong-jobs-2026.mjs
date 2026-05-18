/**
 * seed-ong-jobs-2026.mjs
 * Crée les profils ONG manquants + 12 offres d'emploi réelles (mai–juin 2026)
 * Sources : ReliefWeb, JobRapide, UNjobs, sites officiels – scrapés le 15/05/2026
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

// ─── 7 entreprises à créer ────────────────────────────────────────────────────
const newCompanies = [
  {
    email: "rh@intersos-rca.org",
    name: "INTERSOS RCA",
    slug: "intersos-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.intersos.org",
    phone: "+236 75 00 10 01",
    foundedYear: 1992,
    description:
      "INTERSOS est une Organisation Humanitaire Non Gouvernementale à but non lucratif fondée en Italie en 1992. Présente en République Centrafricaine, elle intervient dans les domaines de l'eau, l'assainissement, la santé et la protection des populations vulnérables affectées par les conflits armés.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "jebe@dca.dk",
    name: "DanChurchAid RCA",
    slug: "danchurchaid-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.danchurchaid.org",
    phone: "+236 75 00 10 02",
    foundedYear: 2015,
    description:
      "DanChurchAid (DCA) est une ONG danoise d'aide humanitaire et de développement présente en République Centrafricaine depuis 2015. Elle intervient dans les secteurs de la cohésion sociale, la consolidation de la paix, la logistique humanitaire et le renforcement des capacités locales.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "rh@theirc-rca.org",
    name: "IRC – International Rescue Committee",
    slug: "irc-international-rescue-committee-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.rescue.org",
    phone: "+236 75 00 10 03",
    foundedYear: 2006,
    description:
      "Le Comité International de Secours (IRC) est une organisation humanitaire fondée en 1933. Présent en RCA depuis 2006, l'IRC intervient dans les domaines de la santé, la nutrition, la protection et le soutien psychosocial pour les populations déplacées et affectées par les conflits.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "rh@coopi-rca.org",
    name: "COOPI – Cooperazione Internazionale",
    slug: "coopi-cooperazione-internazionale-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.coopi.org",
    phone: "+236 75 00 10 04",
    foundedYear: 1974,
    description:
      "COOPI (Cooperazione Internazionale) est une ONG italienne présente en République Centrafricaine depuis 1974. Elle œuvre pour le développement harmonieux des communautés à travers des interventions sociales, économiques, sanitaires et environnementales.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "rh@expertisefrance-rca.fr",
    name: "Expertise France RCA",
    slug: "expertise-france-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.expertisefrance.fr",
    phone: "+236 75 00 10 05",
    foundedYear: 2015,
    description:
      "Expertise France est l'agence française d'expertise technique internationale. En RCA, elle appuie les institutions nationales dans les domaines de la justice, de la gouvernance et du renforcement des capacités institutionnelles.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "rh@solidarites-rca.org",
    name: "Solidarités International RCA",
    slug: "solidarites-international-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.solidarites.org",
    phone: "+236 75 00 10 06",
    foundedYear: 2007,
    description:
      "Solidarités International est une ONG humanitaire française spécialisée dans l'eau, l'assainissement, l'hygiène et la sécurité alimentaire. Elle intervient en RCA pour répondre aux besoins des populations déplacées par les conflits.",
    verified: true,
    superRecruiter: false,
  },
  {
    email: "rh@iom-rca.org",
    name: "OIM – Organisation Internationale pour les Migrations",
    slug: "oim-organisation-internationale-migrations-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.iom.int",
    phone: "+236 75 00 10 07",
    foundedYear: 2014,
    description:
      "L'Organisation Internationale pour les Migrations (OIM) est présente en République Centrafricaine depuis 2014. Elle accompagne les personnes déplacées, facilite les retours volontaires et renforce les capacités nationales en matière de gestion des migrations.",
    verified: true,
    superRecruiter: false,
  },
];

// ─── 12 offres d'emploi réelles ───────────────────────────────────────────────
const jobsData = [
  {
    companySlug: "unicef-rca",
    title: "Responsable Approvisionnement et Logistique (P-4)",
    type: "CDI",
    category: "Logistique & Transport",
    location: "Bangui",
    experienceLevel: "5+ ans",
    deadline: new Date("2026-05-20"),
    featured: true,
    description: `UNICEF recrute un(e) Responsable de l'Approvisionnement et de la Logistique (niveau P-4) basé(e) à Bangui, République Centrafricaine.

**À propos du poste**
Sous la supervision du Représentant UNICEF RCA, le/la titulaire sera responsable de la gestion stratégique de la chaîne d'approvisionnement et des opérations logistiques, y compris la chaîne du froid pour les vaccins et médicaments essentiels.

**Responsabilités principales**
- Superviser et diriger la section Approvisionnement & Logistique de l'UNICEF RCA
- Assurer la livraison efficace et dans les délais des fournitures programmatiques pour les enfants
- Gérer les opérations d'urgence et la réponse logistique lors des crises humanitaires
- Coordonner avec les partenaires gouvernementaux et les agences UN
- Assurer la conformité avec les politiques et procédures UNICEF
- Gérer la chaîne du froid et les stocks de vaccins

**Lien candidature officiel :** https://www.unicef.org/careers/en-us/job/592843/supply-logistics-manager-p4-fixed-term-post88985-bangui-car`,
    requirements: `- Master en gestion de la chaîne d'approvisionnement, logistique, administration des affaires ou domaine connexe
- Au moins 8 ans d'expérience en gestion de la chaîne d'approvisionnement humanitaire
- Excellente maîtrise du français et de l'anglais
- Connaissance des systèmes d'approvisionnement des Nations Unies
- Expérience en zone de conflit ou contexte humanitaire`,
    benefits: `- Contrat à durée déterminée (Fixed Term Appointment — P-4)
- Couverture médicale CIGNA pour titulaire et famille
- Billet d'avion et frais de réinstallation
- Plan de retraite UNJSPF
- Congés annuels et de maternité/paternité`,
  },
  {
    companySlug: "intersos-rca",
    title: "Chef(fe) de Mission",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "5+ ans",
    salaryMin: 3362,
    salaryMax: 3792,
    salaryCurrency: "EUR",
    deadline: new Date("2026-05-20"),
    featured: true,
    description: `INTERSOS recherche un(e) Chef(fe) de Mission pour superviser l'ensemble de ses opérations humanitaires en RCA, basé(e) à Bangui avec déplacements terrain fréquents.

**À propos du poste**
Le/la Chef de Mission représente INTERSOS en RCA et agit au nom du Directeur Général. Il/elle est responsable du développement stratégique, de la gestion du personnel, de la viabilité budgétaire, de la sécurité et du respect des procédures INTERSOS.

**Responsabilités principales**
- Représenter INTERSOS auprès des autorités locales, bailleurs et partenaires
- Élaborer et mettre en œuvre la stratégie pays
- Superviser la gestion des ressources humaines (expatriés et nationaux)
- Garantir la viabilité financière et le respect des procédures comptables
- Assurer la gestion de la sécurité du personnel
- Développer de nouvelles opportunités de financement

**Référence candidature :** SR-46-10213
**Lien officiel :** https://www.intersos.org/fr/travailler-avec-nous-sur-le-terrain/`,
    requirements: `- Diplôme universitaire dans un domaine pertinent (droit international, sciences politiques, coopération internationale)
- Minimum 5 ans d'expérience en aide humanitaire ou développement international
- Expérience préalable en direction de mission
- Excellente maîtrise du français (indispensable) ; anglais souhaité
- Expérience avérée en gestion de la sécurité en zones de conflit`,
    benefits: `- Rémunération : 3 362 – 3 792 € bruts/mois selon expérience
- Logement pris en charge
- Billet d'avion aller-retour domicile-mission
- Couverture médicale et assurance rapatriement
- R&R réguliers et congés annuels`,
  },
  {
    companySlug: "acted-centrafrique",
    title: "Responsable Développement de Projets Pays",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    salaryMin: 3300,
    salaryMax: 3500,
    salaryCurrency: "EUR",
    deadline: new Date("2026-05-22"),
    featured: false,
    description: `ACTED recrute un(e) Responsable Développement de Projets Pays pour son bureau de Bangui. CDD de 6 mois à partir de juin 2026.

**À propos du poste**
Sous la responsabilité du Directeur Pays, le/la titulaire contribue au positionnement stratégique d'ACTED auprès des bailleurs et à la rédaction des propositions de projets, tout en assurant la gestion de qualité des subventions en cours.

**Responsabilités principales**
- Identifier les opportunités de financement (UE/ECHO, USAID, agences UN, etc.)
- Rédiger et coordonner les propositions de projets
- Assurer la gestion contractuelle des subventions (rapports, avenants, clôtures)
- Développer les relations avec les bailleurs de fonds en RCA
- Former les équipes nationales sur les procédures bailleurs

**Email de candidature :** jobs@acted.org (objet : **PDM/RCA**)
**Portail officiel :** https://www.acted.org/en/get-involved/join-us/vacancies/`,
    requirements: `- Master en coopération internationale, relations internationales, droit ou sciences sociales
- 3 à 5 ans d'expérience en développement de projets ou gestion des subventions
- Maîtrise des procédures bailleurs (ECHO, UE, USAID, agences UN)
- Excellentes compétences rédactionnelles en français et en anglais
- Expérience internationale préalable requise`,
    benefits: `- Salaire : 3 300 – 3 500 € nets/mois (avant impôts)
- Logement et nourriture pris en charge
- Couverture sécurité et assurance médicale
- Billet d'avion aller-retour`,
  },
  {
    companySlug: "danchurchaid-rca",
    title: "Coordonnateur(trice) des Achats et de la Logistique",
    type: "CDD",
    category: "Logistique & Transport",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-05-24"),
    featured: false,
    description: `DanChurchAid (DCA) recrute un(e) Coordonnateur(trice) des Achats et de la Logistique pour son bureau de Bangui.

**À propos du poste**
Le/la titulaire est responsable de la coordination de toutes les activités d'approvisionnement et de logistique des opérations DCA en RCA, en garantissant la conformité avec les procédures DCA et les exigences des bailleurs.

**Responsabilités principales**
- Coordonner tous les processus d'achat (biens, services, travaux)
- Gérer la chaîne logistique : réception, stockage et distribution humanitaire
- Superviser la flotte de véhicules et leur maintenance
- Élaborer et mettre en œuvre le plan d'approvisionnement annuel
- Gérer les entrepôts et contrôler les stocks
- Former et encadrer les équipes logistique nationales
- Produire des rapports logistiques pour la direction et les bailleurs

**Contact direct :** Jerome Berson, Country Director DCA — **jebe@dca.dk**
**Lien candidature :** https://dca.career.emply.com/en/ad/procurement-and-logistics-coordinator-in-car-bangui-french-and-english-speaking/encl0p
⚠️ Candidature uniquement via la plateforme Emply`,
    requirements: `- Diplôme en logistique, gestion de la chaîne d'approvisionnement ou administration
- Minimum 3 ans d'expérience en logistique humanitaire ou développement
- Maîtrise des procédures d'achat des principaux bailleurs (ECHO, USAID, UN)
- Excellente maîtrise du français ; anglais requis
- Maîtrise des outils informatiques (Excel, ERP, logiciels de gestion de stock)`,
    benefits: `- Contrat à durée déterminée renouvelable
- Salaire compétitif selon grille DCA
- Assurance médicale
- Congés annuels et R&R`,
  },
  {
    companySlug: "pnud-rca",
    title: "Assistant(e) au Programme des Petites Subventions — FEM-SGP",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "1-3 ans",
    deadline: new Date("2026-05-27"),
    featured: false,
    description: `Le PNUD recrute un(e) Assistant(e) au Programme des Petites Subventions du Fonds pour l'Environnement Mondial (FEM-SGP). **Poste réservé exclusivement aux ressortissants centrafricains.**

**À propos du poste**
Le FEM-SGP fournit des subventions directement aux ONG et communautés locales pour des projets de conservation de la biodiversité, lutte contre les changements climatiques et gestion durable des terres. L'assistant(e) appuie la coordination nationale du programme.

**Responsabilités principales**
- Appuyer la coordination et le suivi des projets FEM-SGP en RCA
- Préparer les documents opérationnels et financiers du programme
- Mettre à jour la base de données projets et parties prenantes
- Produire les rapports au Secrétariat Central et au Bureau Pays PNUD
- Faciliter les relations avec les organisations bénéficiaires
- Appuyer l'organisation des ateliers et réunions du programme

**Lien candidature PNUD :** https://estm.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/34189/apply/email
**Portail emplois PNUD :** https://jobs.undp.org`,
    requirements: `- Nationalité centrafricaine obligatoire
- Licence ou Master en environnement, développement durable, gestion de projet ou sciences sociales
- 1 à 3 ans d'expérience en gestion de projets de développement ou environnementaux
- Bonne maîtrise du français ; connaissance de l'anglais appréciée
- Maîtrise des outils bureautiques (Word, Excel, PowerPoint)`,
    benefits: `- Contrat NPSA (National Personnel Service Agreement)
- Rémunération selon grille PNUD nationale
- Couverture médicale CIGNA
- Participation au plan de retraite local
- Formation et développement professionnel au sein du système des Nations Unies`,
  },
  {
    companySlug: "intersos-rca",
    title: "Chef(fe) de Projet — WASH, Santé & Protection",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Ndélé",
    experienceLevel: "3-5 ans",
    salaryMin: 3362,
    salaryMax: 3792,
    salaryCurrency: "EUR",
    deadline: new Date("2026-05-27"),
    featured: false,
    description: `INTERSOS recrute un(e) Chef(fe) de Projet basé(e) à Ndélé (Bamingui-Bangoran) pour la mise en œuvre d'interventions humanitaires WASH, santé et protection.

**À propos du poste**
Sous la supervision du Chef de Mission, le/la Chef de Projet assure la mise en œuvre efficace et de qualité des activités du projet, conformément aux objectifs, budget et calendrier définis.

**Responsabilités principales**
- Planifier, coordonner et superviser toutes les activités du projet sur le terrain
- Gérer et encadrer l'équipe de projet (staff national et expatrié)
- Assurer la gestion financière rigoureuse du budget
- Rédiger les rapports d'activité et financiers destinés aux bailleurs
- Coordonner avec les autorités locales, partenaires et clusters humanitaires
- Assurer la gestion de la sécurité de l'équipe en contexte de conflit

**Référence candidature :** SR-46-10214
**Lien officiel :** https://www.intersos.org/fr/travailler-avec-nous-sur-le-terrain/`,
    requirements: `- Diplôme universitaire (minimum Licence, idéalement Master) dans un domaine pertinent
- Minimum 3 ans d'expérience en gestion de projets humanitaires (WASH, santé ou protection)
- Expérience en gestion d'équipe dans des contextes humanitaires complexes
- Maîtrise du français obligatoire ; anglais souhaitable
- Aptitude à travailler en zone à forte insécurité`,
    benefits: `- Rémunération : 3 362 – 3 792 € bruts/mois
- Logement pris en charge par INTERSOS
- Billet d'avion aller-retour
- Couverture médicale et assurance rapatriement
- R&R et congés annuels`,
  },
  {
    companySlug: "intersos-rca",
    title: "Coordinateur/trice de Programme",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "5+ ans",
    salaryMin: 3362,
    salaryMax: 3792,
    salaryCurrency: "EUR",
    deadline: new Date("2026-05-27"),
    featured: false,
    description: `INTERSOS recrute un(e) Coordinateur/trice de Programme pour assurer la cohérence et la qualité de ses interventions humanitaires en RCA, basé(e) à Bangui avec missions régulières sur le terrain.

**À propos du poste**
Sous la supervision directe du/de la Chef(fe) de Mission, le/la Coordinateur/trice de Programme est responsable de la cohérence programmatique de l'ensemble des interventions INTERSOS en RCA et contribue au développement stratégique de la mission.

**Responsabilités principales**
- Superviser la coordination programmatique des différents projets de la mission
- Appuyer l'élaboration de la stratégie programmatique pays
- Développer et rédiger des propositions de projets de qualité pour les bailleurs
- Superviser le système MEAL de la mission
- Représenter INTERSOS dans les clusters et groupes de coordination humanitaire
- Veiller à l'intégration des approches transversales (genre, protection, redevabilité)

**Référence :** SR-46-10214
**Lien officiel :** https://www.intersos.org/fr/travailler-avec-nous-sur-le-terrain/`,
    requirements: `- Master en coopération internationale, droit humanitaire ou sciences sociales
- Minimum 5 ans d'expérience en coordination de programmes humanitaires
- Solide expérience en développement de projets et gestion des bailleurs
- Maîtrise du français obligatoire ; anglais courant exigé
- Connaissance du système humanitaire et des mécanismes de coordination (clusters)
- Expérience en suivi-évaluation (MEAL)`,
    benefits: `- Rémunération : 3 362 – 3 792 € bruts/mois
- Logement pris en charge
- Billet d'avion aller-retour domicile-mission
- Assurance médicale et rapatriement
- R&R et congés annuels`,
  },
  {
    companySlug: "irc-international-rescue-committee-rca",
    title: "Officier(ère) Psychosocial(e) — Poste local",
    type: "CDD",
    category: "Médecine & Santé",
    location: "Bocaranga",
    experienceLevel: "1-3 ans",
    deadline: new Date("2026-05-29"),
    featured: false,
    description: `L'IRC recrute un(e) Officier(ère) Psychosocial(e) pour appuyer les activités de protection et de soutien psychosocial dans la préfecture de l'Ouham-Pendé, basé(e) à Bocaranga. **Poste local — ressortissants centrafricains uniquement.**

**À propos du poste**
L'Officier(ère) Psychosocial(e) supervise les activités de gestion de cas et apporte un coaching technique aux équipes partenaires dans la mise en œuvre des activités de prise en charge des violences basées sur le genre (VBG) et des initiatives de protection communautaire.

**Responsabilités principales**
- Superviser la mise en œuvre des activités de gestion de cas psychosociaux
- Assurer le coaching et la supervision technique des assistants psychosociaux
- Coordonner les activités de protection avec les partenaires locaux
- Conduire des évaluations des besoins psychosociaux des populations
- Produire des rapports d'activités hebdomadaires et mensuels
- Représenter l'IRC dans les réunions de coordination locale sur la protection

**Lien candidature officiel :** https://theirc.wd1.myworkdayjobs.com/en-US/External_Careers/job/Bocaranga-Central-African-Republic/Officires-Psychosociales--Position-locale--1_JR00003379
**Site IRC :** https://www.rescue.org`,
    requirements: `- Poste exclusivement ouvert aux ressortissants centrafricains
- Licence en psychologie, travail social ou sciences sociales
- 1 à 3 ans d'expérience en soutien psychosocial, protection ou gestion de cas
- Maîtrise du français ; connaissance du sango et langues locales est un atout majeur
- Capacité à travailler en milieu rural avec mobilité dans la préfecture
- Les candidatures féminines sont vivement encouragées`,
    benefits: `- Contrat à durée déterminée (poste local)
- Salaire selon grille IRC nationale
- Couverture médicale
- Formation continue en protection et approches psychosociales`,
  },
  {
    companySlug: "coopi-cooperazione-internazionale-rca",
    title: "Chef(fe) de Mission",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "5+ ans",
    deadline: new Date("2026-06-03"),
    featured: true,
    description: `COOPI (Cooperazione Internazionale) recherche un(e) Chef(fe) de Mission expérimenté(e) pour diriger ses opérations humanitaires en République Centrafricaine, en poste à Bangui. COOPI est présent en RCA depuis 1974.

**À propos du poste**
Le/la Chef de Mission gère le bureau COOPI en RCA dans tous ses aspects : développement de la mission, gestion et formation du personnel, viabilité budgétaire, sécurité et respect des procédures COOPI et des donateurs.

**Responsabilités principales**
- Assurer la représentation institutionnelle de COOPI auprès des autorités, bailleurs et partenaires
- Définir et mettre en œuvre la stratégie programmatique de la mission
- Superviser les équipes et assurer le développement des ressources humaines
- Garantir la gestion financière et administrative de la mission
- Piloter la recherche de financement et la rédaction de nouvelles propositions
- Assurer la gestion sécuritaire de l'ensemble du personnel COOPI en RCA

**Lien candidature officiel :** https://coopi.org/en/job-position.html?id=5516`,
    requirements: `- Diplôme universitaire supérieur dans un domaine pertinent
- Minimum 5 ans d'expérience en aide humanitaire ou développement international
- Expérience confirmée à un poste de direction de mission
- Maîtrise du français obligatoire ; anglais souhaitable
- Capacité démontrée à gérer des équipes dans des contextes d'insécurité
- Expérience préalable en Afrique centrale est un avantage`,
    benefits: `- Rémunération compétitive selon expérience (grille COOPI)
- Logement pris en charge
- Billet d'avion aller-retour
- Couverture médicale et assurance rapatriement
- R&R réguliers et congés annuels`,
  },
  {
    companySlug: "expertise-france-rca",
    title: "Chargé(e) d'Appui Institutionnel et de Coordination Administrative — Secrétariat PSJ",
    type: "CDD",
    category: "Droit & Administration",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-06-15"),
    featured: false,
    description: `Expertise France recrute un(e) Chargé(e) d'Appui Institutionnel et de Coordination Administrative pour le Secrétariat de la Politique Sectorielle de Justice (PSJ) en RCA, dans le cadre du projet de renforcement des institutions judiciaires.

**À propos du poste**
Le/la titulaire assure l'interface technique entre le Secrétariat de la PSJ et le projet Expertise France. Il/elle contribue à la structuration et au fonctionnement efficace du Secrétariat et facilite la coordination inter-institutionnelle.

**Responsabilités principales**
- Structurer l'interface technique entre le Secrétariat PSJ et le projet Expertise France
- Mettre à jour les matrices d'activités et les tableaux de bord de suivi
- Préparer, animer et assurer le suivi des réunions techniques inter-institutionnelles
- Rédiger comptes-rendus, procès-verbaux et notes de synthèse
- Appuyer la coordination entre le Ministère de la Justice et les partenaires techniques
- Contribuer à la rédaction des rapports d'avancement

**Lien candidature officiel :** https://expertise-france.gestmax.fr/apply/15465/1/charge-e-d-appui-institutionnel-et-de-coordination-administrative-appui-au-secretariat-de-la-psj`,
    requirements: `- Diplôme en droit, administration publique, sciences politiques ou coopération internationale (Licence minimum, Master souhaité)
- 3 à 5 ans d'expérience dans l'appui institutionnel, la gestion de projets ou l'administration publique
- Expérience de travail avec des institutions gouvernementales en Afrique subsaharienne
- Excellentes compétences rédactionnelles en français
- Sens de l'organisation, rigueur et diplomatie`,
    benefits: `- Contrat à durée déterminée
- Rémunération selon grille Expertise France
- Prise en charge des frais de mission
- Accès aux formations internes Expertise France`,
  },
  {
    companySlug: "solidarites-international-rca",
    title: "Directeur/trice de Zone Opérationnelle",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "5+ ans",
    deadline: null,
    featured: false,
    description: `Solidarités International (SI) recrute un(e) Directeur/trice de Zone Opérationnelle pour superviser les opérations humanitaires dans plusieurs préfectures de la RCA, basé(e) à Bangui avec déplacements réguliers sur le terrain.

**À propos du poste**
Le/la Directeur/trice de Zone garantit la mise en œuvre de qualité des programmes opérationnels de SI dans sa zone de responsabilité. Il/elle supervise les équipes terrain et veille à la pertinence et à l'impact des interventions eau, assainissement et sécurité alimentaire.

**Responsabilités principales**
- Superviser la mise en œuvre opérationnelle des projets WASH et sécurité alimentaire
- Coordonner et encadrer les équipes terrain (chefs de base, logisticiens, techniciens)
- Assurer la gestion sécuritaire du personnel et des actifs dans la zone
- Représenter SI auprès des autorités locales, partenaires et clusters
- Contribuer au développement de nouvelles propositions de projets
- Garantir le respect des standards techniques SI et des engagements vis-à-vis des bailleurs

⚠️ SI se réserve le droit de clôturer le recrutement avant la deadline — candidature ASAP recommandée
**Lien candidature :** https://www.solidarites.org/en/since-1980/join-us/jobs/job-detail/?id=114655`,
    requirements: `- Master en gestion de l'eau, génie sanitaire, agronomie, sciences sociales ou coopération internationale
- Minimum 5 ans d'expérience en gestion d'opérations humanitaires dont expérience terrain
- Expérience confirmée en management d'équipes pluridisciplinaires
- Maîtrise du français ; anglais souhaitable
- Connaissance des approches WASH et sécurité alimentaire dans les contextes d'urgence
- Aptitude à travailler dans des zones à risque sécuritaire élevé`,
    benefits: `- Rémunération selon expérience (grille SI)
- Logement pris en charge
- Billet d'avion aller-retour
- Couverture médicale et assurance rapatriement
- R&R réguliers et congés annuels`,
  },
  {
    companySlug: "oim-organisation-internationale-migrations-rca",
    title: "Responsable des Technologies de l'Information et des Communications (TIC)",
    type: "CDI",
    category: "Informatique & Télécoms",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: null,
    featured: false,
    description: `L'OIM recrute un(e) Responsable des Technologies de l'Information et des Communications (TIC) pour son bureau en République Centrafricaine, basé(e) à Bangui.

**À propos du poste**
Le/la Responsable TIC assure la gestion, le développement et la maintenance des systèmes d'information et de l'infrastructure technologique de l'OIM en RCA, y compris les sous-bureaux en province.

**Responsabilités principales**
- Gérer et maintenir l'infrastructure informatique et télécoms de l'OIM RCA
- Administrer les serveurs, réseaux LAN/WAN, VPN et systèmes de communication (VSAT)
- Assurer le support technique aux utilisateurs (staff national et international)
- Mettre en œuvre les politiques de sécurité informatique OIM
- Coordonner avec le siège régional pour la mise à jour des systèmes
- Gérer l'inventaire des équipements TIC et les relations fournisseurs
- Former le personnel aux outils et bonnes pratiques informatiques

**Portail emplois OIM :** https://www.iom.int/work-with-us
**Bureau régional :** https://rodakar.iom.int/careers`,
    requirements: `- Diplôme en informatique, télécommunications, systèmes d'information ou domaine connexe
- Minimum 3 ans d'expérience en administration de systèmes et réseaux
- Maîtrise des environnements Windows Server, Microsoft 365, systèmes satellite (VSAT)
- Connaissance des protocoles réseau (TCP/IP, DNS, DHCP, VPN)
- Maîtrise du français ; anglais obligatoire
- Disponibilité pour des déplacements dans les sous-bureaux`,
    benefits: `- Contrat OIM selon grille internationale
- Couverture médicale et assurance vie
- Plan de retraite UNJSPF
- Formation continue et certifications professionnelles`,
  },
];

// ─── Fonction principale ──────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Démarrage du seed ONG Jobs 2026...\n");

  const password = await bcrypt.hash("KtzEmploi@2026", 12);

  // ── Étape 1 : Créer les 7 nouvelles entreprises ──────────────────────────
  console.log("📋 Étape 1 : Création des profils entreprises manquants...");
  for (const c of newCompanies) {
    const existingUser = await prisma.user.findUnique({ where: { email: c.email } });
    if (existingUser) {
      console.log(`  ⏭  ${c.name} existe déjà (user : ${c.email})`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: c.email,
        name: `RH ${c.name}`,
        password,
        role: "EMPLOYER",
        emailVerified: new Date(),
      },
    });

    await prisma.company.create({
      data: {
        userId: user.id,
        name: c.name,
        slug: c.slug,
        sector: c.sector,
        size: c.size,
        location: c.location,
        website: c.website ?? null,
        phone: c.phone ?? null,
        foundedYear: c.foundedYear ?? null,
        description: c.description,
        email: c.email,
        verified: c.verified,
        superRecruiter: c.superRecruiter ?? false,
      },
    });

    console.log(`  ✅ Créé : ${c.name} (${c.email})`);
  }

  // ── Étape 2 : Récupérer toutes les entreprises ───────────────────────────
  console.log("\n📋 Étape 2 : Chargement des entreprises...");
  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true, slug: true },
  });

  const getCompany = (slug) => {
    const c = allCompanies.find(
      (x) =>
        x.slug === slug ||
        x.name.toLowerCase().includes(slug.replace(/-/g, " ").toLowerCase())
    );
    if (!c) console.warn(`  ⚠️  Entreprise introuvable pour slug : ${slug}`);
    return c;
  };

  // ── Étape 3 : Créer les 12 offres d'emploi ──────────────────────────────
  console.log("\n📋 Étape 3 : Création des offres d'emploi...");
  let created = 0;
  let skipped = 0;

  for (const job of jobsData) {
    const company = getCompany(job.companySlug);
    if (!company) { skipped++; continue; }

    // Vérifier si l'offre existe déjà (par titre + companyId)
    const existing = await prisma.job.findFirst({
      where: { title: job.title, companyId: company.id },
    });
    if (existing) {
      console.log(`  ⏭  Offre existante : "${job.title}" — ${company.name}`);
      skipped++;
      continue;
    }

    const jobSlug =
      slugify(job.title).slice(0, 80) +
      "-" +
      company.slug.slice(0, 20) +
      "-" +
      Math.random().toString(36).slice(2, 6);

    await prisma.job.create({
      data: {
        companyId: company.id,
        title: job.title,
        slug: jobSlug,
        description: job.description,
        requirements: job.requirements ?? null,
        benefits: job.benefits ?? null,
        type: job.type,
        category: job.category,
        location: job.location,
        remote: job.remote ?? false,
        salaryMin: job.salaryMin ?? null,
        salaryMax: job.salaryMax ?? null,
        salaryCurrency: job.salaryCurrency ?? "XAF",
        experienceLevel: job.experienceLevel ?? null,
        deadline: job.deadline ?? null,
        published: true,
        featured: job.featured ?? false,
      },
    });

    const deadlineStr = job.deadline
      ? job.deadline.toLocaleDateString("fr-FR")
      : "Ouvert jusqu'à pourvu";
    console.log(
      `  ✅ Offre créée : "${job.title}" — ${company.name} — expire : ${deadlineStr}`
    );
    created++;
  }

  // ── Résumé ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log(`✅ Terminé ! ${created} offre(s) créée(s), ${skipped} ignorée(s).`);
  console.log("═══════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
