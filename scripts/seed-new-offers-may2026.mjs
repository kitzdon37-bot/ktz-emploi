/**
 * seed-new-offers-may2026.mjs
 * Crée les profils de 5 nouvelles organisations + leurs offres d'emploi en RCA
 * Sources : ReliefWeb, sites officiels — scrapés le 15/05/2026
 * Organisations : Street Child, MSF, Première Urgence Internationale, FAO, WCS
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

// ─── 5 nouvelles entreprises ──────────────────────────────────────────────────
const newCompanies = [
  {
    email: "rh@streetchild-rca.org",
    name: "Street Child",
    slug: "street-child-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.street-child.co.uk",
    phone: "+236 75 00 20 01",
    foundedYear: 2008,
    description:
      "Street Child est une ONG internationale britannique fondée en 2008 qui œuvre pour que les enfants vulnérables aient accès à une éducation de qualité et à un environnement familial stable. Présente en République Centrafricaine, elle intervient dans les domaines de l'éducation, de la protection de l'enfance et du renforcement des moyens de subsistance des familles.",
    verified: true,
    superRecruiter: false,
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    email: "rh@msf-rca.org",
    name: "MSF – Médecins Sans Frontières",
    slug: "msf-medecins-sans-frontieres-rca",
    sector: "Médecine & Santé",
    size: "Grande",
    location: "Bangui",
    website: "https://www.msf.org",
    phone: "+236 75 00 20 02",
    foundedYear: 1999,
    description:
      "Médecins Sans Frontières (MSF) est une organisation médicale humanitaire internationale indépendante qui apporte des soins médicaux d'urgence aux populations victimes de conflits armés, d'épidémies et de catastrophes naturelles. MSF est présent en République Centrafricaine depuis 1997 et maintient des équipes médicales dans plusieurs villes dont Bangui, Batangafo, Bossangoa et Kabo.",
    verified: true,
    superRecruiter: false,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/MSF_Logo_WEB.jpg",
  },
  {
    email: "rh@premiere-urgence-rca.org",
    name: "Première Urgence Internationale",
    slug: "premiere-urgence-internationale-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.premiere-urgence.org",
    phone: "+236 75 00 20 03",
    foundedYear: 1993,
    description:
      "Première Urgence Internationale (PUI) est une ONG humanitaire française qui couvre les besoins fondamentaux des personnes victimes de crises d'origine humaine ou naturelle. Présente en République Centrafricaine, PUI intervient dans les domaines de la sécurité alimentaire, la santé, l'eau et l'assainissement, et la coordination logistique humanitaire.",
    verified: true,
    superRecruiter: false,
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
  {
    email: "rh@fao-rca.org",
    name: "FAO – Organisation des Nations Unies pour l'Alimentation",
    slug: "fao-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.fao.org",
    phone: "+236 75 00 20 04",
    foundedYear: 1945,
    description:
      "La FAO (Organisation des Nations Unies pour l'alimentation et l'agriculture) est une agence spécialisée des Nations Unies dont le mandat est d'éradiquer la faim et améliorer la nutrition. En République Centrafricaine, la FAO appuie le gouvernement dans les secteurs de l'agriculture, l'élevage, la pêche et la forêt, tout en gérant des programmes d'urgence alimentaire pour les populations déplacées.",
    verified: true,
    superRecruiter: false,
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/db/FAO_logo.svg",
  },
  {
    email: "rh@wcs-rca.org",
    name: "WCS – Wildlife Conservation Society",
    slug: "wcs-wildlife-conservation-society-rca",
    sector: "Environnement & Agriculture",
    size: "Grande",
    location: "Bangui",
    website: "https://www.wcs.org",
    phone: "+236 75 00 20 05",
    foundedYear: 1895,
    description:
      "La Wildlife Conservation Society (WCS) est une organisation américaine à but non lucratif fondée en 1895 qui œuvre pour la conservation de la faune et de la flore sauvages dans le monde entier. En République Centrafricaine, WCS appuie la gestion des aires protégées (dont le Parc National de Dzanga-Sangha), la lutte anti-braconnage et le développement durable des communautés riveraines des forêts.",
    verified: true,
    superRecruiter: false,
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Flag_of_the_Central_African_Republic.svg",
  },
];

// ─── Offres d'emploi ──────────────────────────────────────────────────────────
const jobsData = [
  // ── STREET CHILD (9 postes) ─────────────────────────────────────────────────
  {
    companySlug: "street-child-rca",
    title: "Country Programme Director",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "5+ ans",
    deadline: new Date("2026-05-31"),
    featured: true,
    description: `Street Child recrute un(e) Country Programme Director pour diriger l'ensemble de ses opérations en République Centrafricaine, basé(e) à Bangui.

**À propos du poste**
Le/la Country Programme Director est responsable de la direction stratégique et opérationnelle de la mission Street Child en RCA. Il/elle supervise les équipes, pilote le développement programmatique et représente l'organisation auprès des partenaires institutionnels.

**Responsabilités principales**
- Diriger la stratégie pays de Street Child en RCA
- Superviser l'ensemble des programmes (éducation, protection, moyens de subsistance)
- Gérer les relations bailleurs et développer de nouveaux financements
- Assurer la gestion des ressources humaines (staff national et international)
- Représenter Street Child auprès des clusters, gouvernement et partenaires
- Garantir la conformité avec les politiques organisationnelles et les engagements bailleurs
- Produire les rapports stratégiques et assurer le reporting au siège (Londres)

**Comment postuler :** Via ReliefWeb ou le site officiel Street Child
**Lien :** https://reliefweb.int/jobs/street-child`,
    requirements: `- Master en développement international, gestion de projets, sciences sociales ou domaine connexe
- Minimum 7 ans d'expérience en gestion de programmes humanitaires ou de développement
- Expérience confirmée en direction de mission ou représentation pays
- Expérience dans les secteurs éducation, protection de l'enfance ou moyens de subsistance
- Maîtrise du français obligatoire ; anglais courant exigé
- Expérience en Afrique centrale ou subsaharienne est un atout
- Solide expérience en gestion des bailleurs (USAID, FCDO, UE)`,
    benefits: `- Package compétitif selon expérience
- Logement pris en charge
- Billet d'avion aller-retour
- Assurance médicale internationale
- R&R et congés annuels`,
  },
  {
    companySlug: "street-child-rca",
    title: "Education & Training Specialist",
    type: "CDD",
    category: "Éducation & Formation",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-05-31"),
    featured: false,
    description: `Street Child recrute un(e) Education & Training Specialist pour concevoir et superviser ses programmes d'éducation en République Centrafricaine, basé(e) à Bangui avec déplacements terrain.

**À propos du poste**
L'Education & Training Specialist est responsable de la qualité technique des programmes d'éducation de Street Child en RCA. Il/elle conçoit les curricula, supervise les enseignants et assure l'intégration des standards d'éducation en situation d'urgence (EiE).

**Responsabilités principales**
- Concevoir et mettre en œuvre les programmes d'éducation formelle et non-formelle
- Former et coacher les enseignants et les agents d'alphabétisation
- Développer les outils pédagogiques adaptés au contexte centrafricain
- Assurer le suivi de la qualité des apprentissages (évaluations, tests)
- Intégrer les approches d'éducation en situation d'urgence (EiE/INEE)
- Coordonner avec le cluster Éducation et le Ministère de l'Éducation
- Produire des rapports d'activité et contribuer aux rapports bailleurs

**Lien :** https://reliefweb.int/jobs/street-child`,
    requirements: `- Diplôme en sciences de l'éducation, pédagogie ou développement international
- 3 à 5 ans d'expérience en programmes éducatifs humanitaires ou de développement
- Connaissance des standards EiE (INEE Minimum Standards)
- Expérience en formation des enseignants et coaching pédagogique
- Maîtrise du français obligatoire ; anglais souhaitable
- Connaissance du système éducatif centrafricain est un atout`,
    benefits: `- Rémunération compétitive selon grille Street Child
- Logement pris en charge
- Couverture médicale et assurance
- Formation continue`,
  },
  {
    companySlug: "street-child-rca",
    title: "Finance & Operations Manager",
    type: "CDD",
    category: "Finance & Comptabilité",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-05-31"),
    featured: false,
    description: `Street Child recrute un(e) Finance & Operations Manager pour assurer la gestion financière et opérationnelle de sa mission en République Centrafricaine, basé(e) à Bangui.

**À propos du poste**
Le/la Finance & Operations Manager est responsable de la gestion financière, administrative et des opérations logistiques de la mission Street Child en RCA. Il/elle garantit la conformité financière et la fluidité des opérations.

**Responsabilités principales**
- Superviser la comptabilité, la trésorerie et les paiements de la mission
- Préparer les budgets, forecasts et rapports financiers bailleurs
- Assurer la conformité avec les procédures financières Street Child et les exigences des donateurs
- Gérer les achats, la logistique et les actifs de la mission
- Superviser les audits internes et externes
- Encadrer l'équipe finance et logistique nationale
- Produire les rapports financiers mensuels et trimestriels au siège

**Lien :** https://reliefweb.int/jobs/street-child`,
    requirements: `- Diplôme en finance, comptabilité, gestion ou administration des affaires
- Certification comptable (CPA, ACCA ou équivalent) appréciée
- 3 à 5 ans d'expérience en gestion financière d'ONG humanitaire
- Maîtrise des procédures financières des bailleurs (FCDO, USAID, UE)
- Excellente maîtrise d'Excel et logiciels de comptabilité
- Maîtrise du français ; anglais courant requis`,
    benefits: `- Salaire compétitif selon expérience
- Logement pris en charge
- Couverture médicale
- R&R et congés annuels`,
  },
  {
    companySlug: "street-child-rca",
    title: "MEAL Officer",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    experienceLevel: "1-3 ans",
    deadline: new Date("2026-05-31"),
    featured: false,
    description: `Street Child recrute un(e) MEAL Officer (Monitoring, Evaluation, Accountability & Learning) pour renforcer les systèmes de suivi et d'évaluation de ses programmes en RCA.

**À propos du poste**
Le/la MEAL Officer est responsable de la mise en place et du fonctionnement des systèmes de suivi-évaluation, de redevabilité et d'apprentissage (MEAL) pour les programmes Street Child en RCA.

**Responsabilités principales**
- Développer et mettre en œuvre les plans MEAL pour tous les projets
- Concevoir et gérer les bases de données de suivi des indicateurs
- Conduire des évaluations de base, intermédiaires et finales
- Mettre en place les mécanismes de redevabilité envers les bénéficiaires
- Former les équipes terrain aux outils de collecte de données
- Produire des analyses et rapports MEAL pour les bailleurs et le siège
- Contribuer à la capitalisation et à l'apprentissage organisationnel

**Lien :** https://reliefweb.int/jobs/street-child`,
    requirements: `- Licence ou Master en statistiques, sciences sociales, gestion de projets ou domaine connexe
- 1 à 3 ans d'expérience en MEAL dans le secteur humanitaire ou développement
- Maîtrise des outils de collecte de données (KoBoToolbox, ODK, CommCare)
- Compétences en analyse de données quantitatives et qualitatives
- Maîtrise du français obligatoire ; anglais apprécié
- Expérience en programmes éducatifs ou protection de l'enfance est un atout`,
    benefits: `- Salaire selon grille Street Child nationale
- Formation MEAL et certifications
- Couverture médicale
- Opportunités d'évolution professionnelle`,
  },
  {
    companySlug: "street-child-rca",
    title: "Field Officer – Éducation (x5 postes)",
    type: "CDD",
    category: "Éducation & Formation",
    location: "Bangui",
    experienceLevel: "Débutant",
    deadline: new Date("2026-05-31"),
    featured: false,
    description: `Street Child recrute 5 Field Officers pour assurer la mise en œuvre terrain de ses programmes d'éducation dans plusieurs préfectures de la République Centrafricaine.

**À propos du poste**
Les Field Officers sont chargés de la mise en œuvre opérationnelle quotidienne des activités éducatives et de protection sur le terrain. Ils/elles travaillent directement avec les communautés, les écoles et les familles bénéficiaires.

**Responsabilités principales**
- Assurer la mise en œuvre des activités éducatives et de formation dans la zone d'intervention
- Identifier, mobiliser et suivre les bénéficiaires du programme
- Animer des séances de formation pour les enseignants et les communautés
- Collecter les données de suivi (présences, apprentissages, indicateurs)
- Assurer la liaison entre les communautés bénéficiaires et l'équipe programme
- Rédiger des rapports d'activités hebdomadaires
- Participer aux réunions de coordination locale

**Zones d'affectation possibles :** Bangui, Bouar, Bossangoa, Kaga-Bandoro, Bambari
**Lien :** https://reliefweb.int/jobs/street-child`,
    requirements: `- Baccalauréat ou Licence dans n'importe quel domaine
- Intérêt fort pour l'éducation, la protection de l'enfance ou le développement communautaire
- Expérience préalable en travail communautaire ou associatif est un atout
- Maîtrise du français ; sango et langues locales sont un avantage majeur
- Capacité à travailler en zones rurales avec déplacements fréquents
- Les candidatures féminines sont vivement encouragées
- Résidence dans ou proximité de la zone d'affectation préférée`,
    benefits: `- Salaire selon grille Street Child locale
- Formation initiale et continue assurée
- Couverture médicale de base
- Expérience valorisante en ONG internationale`,
  },

  // ── MSF (1 poste) ────────────────────────────────────────────────────────────
  {
    companySlug: "msf-medecins-sans-frontieres-rca",
    title: "Médecin Généraliste — Batangafo",
    type: "CDD",
    category: "Médecine & Santé",
    location: "Batangafo",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-05-19"),
    featured: true,
    description: `MSF (Médecins Sans Frontières) recrute un(e) Médecin Généraliste pour son projet médical à Batangafo, dans la préfecture de l'Ouham, République Centrafricaine.

**À propos du poste**
Le/la médecin est responsable de la prise en charge médicale des patients hospitalisés et ambulatoires de l'hôpital de Batangafo géré par MSF, dans un contexte humanitaire complexe.

**Responsabilités principales**
- Assurer les consultations médicales et la prise en charge des patients hospitalisés
- Superviser et encadrer les infirmiers et les agents de santé nationaux
- Gérer les urgences médicales et les situations de masse (trauma, épidémies)
- Participer à la surveillance épidémiologique et au contrôle des infections
- Assurer la prescription rationnelle des médicaments selon les protocoles MSF
- Rédiger les rapports médicaux hebdomadaires et mensuels
- Participer à la formation continue du personnel médical national

⚠️ **Date limite : 19 mai 2026** — candidature urgente
**Portail MSF :** https://www.msf.org/work-with-msf
**Référence :** Médecin/Physician — Batangafo, CAR`,
    requirements: `- Diplôme de médecine (Docteur en médecine) reconnu internationalement
- Minimum 2 ans d'expérience clinique post-diplôme
- Expérience en contexte humanitaire ou tropical appréciée
- Maîtrise du français obligatoire
- Capacité à travailler sous pression dans un contexte sécuritaire instable
- Rigueur, adaptabilité et sens du travail en équipe
- Disponibilité immédiate ou à court terme`,
    benefits: `- Salaire MSF selon expérience et grille expatrié/national
- Logement et nourriture pris en charge sur mission
- Couverture médicale complète et assurance rapatriement
- Billet d'avion aller-retour
- Formation MSF (protocoles, sécurité, contexte humanitaire)
- R&R selon politique MSF`,
  },

  // ── PREMIÈRE URGENCE INTERNATIONALE (1 poste) ──────────────────────────────
  {
    companySlug: "premiere-urgence-internationale-rca",
    title: "Logisticien(ne) – Administrateur(trice)",
    type: "CDD",
    category: "Logistique & Transport",
    location: "Bangui",
    experienceLevel: "1-3 ans",
    deadline: new Date("2026-06-01"),
    featured: false,
    description: `Première Urgence Internationale (PUI) recrute un(e) Logisticien(ne)-Administrateur(trice) pour appuyer ses opérations humanitaires en République Centrafricaine, basé(e) à Bangui avec déplacements terrain possibles.

**À propos du poste**
Le/la Logisticien(ne)-Administrateur(trice) assure la gestion logistique et administrative du bureau PUI en RCA, en garantissant le bon fonctionnement des opérations quotidiennes et la conformité avec les procédures PUI et des bailleurs.

**Responsabilités principales**
- Gérer les achats et approvisionnements selon les procédures PUI
- Superviser la maintenance du parc de véhicules et des équipements
- Gérer les entrepôts, les stocks et les inventaires
- Assurer la gestion administrative (contrats, documents officiels, archives)
- Superviser les ressources humaines locales (contrats, paie, congés)
- Appuyer la comptabilité et la gestion de trésorerie
- Assurer la liaison avec les fournisseurs locaux et les autorités administratives

**Lien candidature PUI :** https://www.premiere-urgence.org/recrutement/
**Référence :** LOG-ADMIN/RCA/2026`,
    requirements: `- Diplôme en logistique, administration, gestion ou sciences sociales (Licence minimum)
- 1 à 3 ans d'expérience en logistique et/ou administration dans une ONG humanitaire
- Connaissance des procédures d'achat humanitaire (ECHO, BHA, agences UN)
- Maîtrise des outils bureautiques (Excel, Word)
- Maîtrise du français ; anglais de travail apprécié
- Rigueur, polyvalence et bonne capacité organisationnelle`,
    benefits: `- Contrat à durée déterminée renouvelable
- Rémunération selon grille PUI et expérience
- Logement pris en charge (selon profil)
- Couverture médicale et assurance rapatriement
- Formation aux procédures PUI`,
  },

  // ── FAO (1 poste) ────────────────────────────────────────────────────────────
  {
    companySlug: "fao-rca",
    title: "Expert National en Médecine Vétérinaire",
    type: "CDD",
    category: "Environnement & Agriculture",
    location: "Bangui",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-06-15"),
    featured: false,
    description: `La FAO (Organisation des Nations Unies pour l'Alimentation et l'Agriculture) recrute un(e) Expert(e) National(e) en Médecine Vétérinaire pour appuyer les programmes de santé animale et d'élevage en République Centrafricaine. **Poste réservé aux ressortissants centrafricains.**

**À propos du poste**
L'Expert(e) National(e) en Médecine Vétérinaire appuie le Ministère de l'Élevage et le programme FAO RCA dans la surveillance et le contrôle des maladies animales transfrontalières, le renforcement des services vétérinaires et la sécurité sanitaire des filières animales.

**Responsabilités principales**
- Appuyer la surveillance épidémiologique des maladies animales prioritaires (PPCB, FMD, PPA, etc.)
- Organiser et superviser les campagnes de vaccination animale
- Renforcer les capacités des vétérinaires et paravétérinaires nationaux
- Appuyer l'élaboration des plans de réponse aux urgences zoosanitaires
- Contribuer au programme One Health (interface animal-humain-environnement)
- Rédiger les rapports techniques pour le MINELEVAGE et la FAO
- Assurer la coordination avec les services vétérinaires des pays voisins et l'UA-BIRA

**Portail emplois FAO :** https://www.fao.org/employment/home/fr/
**Référence :** FAO/RCA/VET/2026`,
    requirements: `- Nationalité centrafricaine obligatoire
- Diplôme de Docteur Vétérinaire (DVM) d'une faculté reconnue
- 3 à 5 ans d'expérience en santé animale, épidémiologie vétérinaire ou services vétérinaires
- Connaissance des maladies animales transfrontalières prioritaires en Afrique centrale
- Expérience en programmes de vaccination animale de masse
- Bonne maîtrise du français ; anglais apprécié
- Disponibilité pour des déplacements dans les zones d'élevage en RCA`,
    benefits: `- Contrat NPSA (National Personnel Service Agreement) FAO
- Rémunération selon grille FAO nationale
- Indemnités de mission pour déplacements terrain
- Couverture médicale
- Accès aux formations et ressources techniques FAO`,
  },

  // ── WCS (1 poste) ────────────────────────────────────────────────────────────
  {
    companySlug: "wcs-wildlife-conservation-society-rca",
    title: "Responsable du Pastoralisme Durable",
    type: "CDD",
    category: "Environnement & Agriculture",
    location: "Bamingui-Bangoran",
    experienceLevel: "3-5 ans",
    deadline: new Date("2026-06-30"),
    featured: false,
    description: `La Wildlife Conservation Society (WCS) recrute un(e) Responsable du Pastoralisme Durable pour son programme en République Centrafricaine, basé(e) dans la préfecture de Bamingui-Bangoran avec déplacements fréquents.

**À propos du poste**
Le/la Responsable du Pastoralisme Durable pilote les activités de WCS visant à promouvoir la coexistence pacifique entre les éleveurs transhumants, les agriculteurs sédentaires et la faune sauvage dans la zone du complexe Bamingui-Bangoran / Manovo-Gounda-Saint Floris (patrimoine mondial UNESCO).

**Responsabilités principales**
- Concevoir et mettre en œuvre les activités de gestion durable du pastoralisme
- Faciliter le dialogue entre éleveurs, agriculteurs et autorités locales
- Appuyer le développement de mécanismes locaux de résolution des conflits agropastoraux
- Superviser les études sur les itinéraires de transhumance et les ressources pastorales
- Renforcer les capacités des acteurs pastoraux locaux (organisations d'éleveurs, comités)
- Coordonner avec les services de l'élevage, les préfectures et les partenaires
- Rédiger les rapports techniques et contribuer aux publications scientifiques WCS

**Portail emplois WCS :** https://www.wcs.org/our-work/wildlife-conservation-jobs
**Référence :** WCS-RCA-PAST-2026`,
    requirements: `- Diplôme en sciences pastorales, agronomie, gestion des ressources naturelles, géographie ou domaine connexe (Master souhaité)
- 3 à 5 ans d'expérience dans la gestion des conflits agropastoraux, l'élevage transhumant ou la conservation
- Connaissance du contexte pastoral sahélo-soudanien (Tchad, RCA, Cameroun)
- Expérience en facilitation communautaire et médiation
- Maîtrise du français obligatoire ; anglais apprécié
- Capacité à travailler dans des zones éloignées et à forte insécurité
- La connaissance du peul/fulfuldé est un atout majeur`,
    benefits: `- Rémunération selon grille WCS
- Logement et indemnités terrain pris en charge
- Couverture médicale
- Formation et participation aux réseaux WCS Afrique
- Contribution à un programme de conservation d'importance mondiale (UNESCO)`,
  },
];

// ─── Fonction principale ──────────────────────────────────────────────────────
async function main() {
  console.log("🚀 Démarrage du seed nouvelles offres mai 2026...\n");

  const password = await bcrypt.hash("KtzEmploi@2026", 12);

  // ── Étape 1 : Créer les 5 nouvelles entreprises ──────────────────────────
  console.log("📋 Étape 1 : Création des profils entreprises...");
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
        logo: c.logo ?? null,
      },
    });

    console.log(`  ✅ Créé : ${c.name} (${c.email})`);
  }

  // ── Étape 2 : Charger toutes les entreprises ─────────────────────────────
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

  // ── Étape 3 : Créer les offres d'emploi ──────────────────────────────────
  console.log("\n📋 Étape 3 : Création des offres d'emploi...");
  let created = 0;
  let skipped = 0;

  for (const job of jobsData) {
    const company = getCompany(job.companySlug);
    if (!company) { skipped++; continue; }

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
      `  ✅ "${job.title}" — ${company.name} — expire : ${deadlineStr}`
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
