/**
 * seed-octobre-2026.mjs
 * 1. Supprime les offres expirées
 * 2. Réinitialise les mots de passe admin
 * 3. Ajoute 25 nouvelles offres (octobre-novembre 2026)
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import { createId } from '@paralleldrive/cuid2';

const { Client } = pg;
const DB = "postgresql://postgres.rtotnmbpwxfbiufcsvsx:rKyz3vHSkmADsKze@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

function slug(title, suffix) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + suffix;
}

// IDs entreprises depuis la DB
const COS = {
  acted:      'cmuwnfgow0002algsjnej84a4',
  acf:        'cmuwnfhsl0013algsgzfvpm52',
  alima:      'cmrc1mpmi0008al0wf22oucx1',
  caritas:    'cmuwnfhl3000walgs297hyu85',
  coopi1:     'cmp8p7r46000ealfks1xfleh0',
  crossrouge: 'cmrc1mukl000nal0whihah31h',
  ecobank1:   'cmopy9brs000cal4ojseohlhc',
  enerca:     'cmopqdyfp0006alhwuy6x4toa', // fallback
  expertisefr:'cmp6h1bf2000ealykntznt7c6',
  fao:        'cmp6vgmjv000balgwd0glbqgm',
  ficr:       'cmrbutag90008almwlfpbwchq',
  imc:        'cmrtt4f2x0002alboq0x88jp5',
  impact:     'cmrtt4fpg0005alboyl7v2cph',
  intersos1:  'cmrc1mr8v000eal0wd2pyny6d',
  iom1:       'cmp8p83ht000xalfkl6941hgj',
  irc1:       'cmp6h1b830008alyksh9vbgg4',
  ktz:        'cmt30zi3u0001aljcpmy1usxq',
  minusca:    'cmrbut9kd0005almwmorfwv60',
  msf1:       'cmp6vgm6l0005algwitbn3eu5',   // MSF
  nrc1:       'cmp8p85dq001qalfkswc5sb8q',
  oim1:       'cmp6h1bmu000kalykxh8kgk4y',
  oms:        'cmp8p84qd001lalfkkskhnlaj',
  orange:     'cmpebpoqs0001alzknoh5j7w6',
  pam:        'cmuwnfhdc000palgssauma3cq',
  pnud:       'cmp6h26vh0005al303x4c751y', // PNUD
  pui:        'cmp6vgmfr0008algwxmn1ll5s',
  save:       'cmuwnfgxv0009algs1eu8sox9',
  sodeca:     'cmopqdyfp0008alhw8qwaaooi',
  solidarites:'cmp6h1bix000halyko9wz7sr6',
  streetChild:'cmrbutdzm000kalmwwq44t9aw',
  telecel:    'cmp1to3mw000aalhc7ngzme53',
  unicef:     'cmrbutd3w000halmwq1m4x6rf',
  unops:      'cmrc1mtgq000kal0wav20v6er',
  wcs:        'cmp6vgmo1000ealgwrq5c7h0t',
  whh:        'cmrc1mvdb000qal0workpk9xh',
};

const JOBS = [
  // ── UNICEF ────────────────────────────────────────────────────────
  {
    companyId: COS.unicef,
    title: "Spécialiste en Protection de l'Enfance",
    type: "CDI", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-11-05",
    description: `UNICEF RCA recrute un(e) Spécialiste en Protection de l'Enfance pour renforcer les mécanismes de protection et de réponse aux violations des droits des enfants en République Centrafricaine.

**Responsabilités principales :**
- Coordonner les activités de protection de l'enfance dans les zones d'intervention
- Assurer le suivi et la supervision des partenaires d'exécution
- Contribuer à l'élaboration des politiques nationales de protection
- Animer les clusters et groupes de travail sectoriels
- Rédiger les rapports de situation et les notes d'analyse

**Contrat :** Contrat de service international
**Lieu :** Bangui avec déplacements fréquents en provinces`,
    requirements: `- Master en travail social, droit, sciences humaines ou domaine connexe
- Minimum 5 ans d'expérience en protection de l'enfance en contexte humanitaire
- Expérience en Afrique subsaharienne ou en contexte de crise souhaitée
- Maîtrise du français ; l'anglais est un atout
- Excellentes capacités rédactionnelles et analytiques`,
    benefits: "Package ONU compétitif, assurance santé, indemnité de logement, R&R"
  },
  // ── PAM ───────────────────────────────────────────────────────────
  {
    companyId: COS.pam,
    title: "Associé(e) Logistique — Chaîne d'Approvisionnement",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-10-28",
    description: `Le Programme Alimentaire Mondial (PAM) recrute un(e) Associé(e) Logistique pour appuyer les opérations de la chaîne d'approvisionnement alimentaire en RCA.

**Responsabilités :**
- Planifier et coordonner les transports et livraisons d'assistance alimentaire
- Gérer les relations avec les transporteurs et prestataires logistiques
- Assurer le suivi des stocks dans les entrepôts de Bangui et sous-bureaux
- Produire les rapports de performance logistique hebdomadaires et mensuels
- Contribuer à l'identification des prestataires locaux et leur évaluation

**Durée :** 12 mois renouvelables`,
    requirements: `- Diplôme Bac+3 minimum en logistique, supply chain, gestion ou équivalent
- 3 ans d'expérience en logistique humanitaire ou supply chain
- Connaissance des procédures WFP ou systèmes UN appréciée
- Maîtrise des outils bureautiques (Excel avancé, ERP)
- Permis de conduire valide`,
    benefits: "Salaire compétitif, assurance médicale, formation continue PAM"
  },
  // ── MSF ───────────────────────────────────────────────────────────
  {
    companyId: COS.msf1,
    title: "Médecin Généraliste — Programme Santé Primaire",
    type: "CDD", category: "Médecine & Santé", location: "Kaga-Bandoro",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-11-10",
    description: `MSF — Médecins Sans Frontières recrute un(e) Médecin Généraliste pour renforcer son équipe médicale à Kaga-Bandoro dans le cadre du programme de santé primaire et de nutrition.

**Responsabilités :**
- Assurer les consultations médicales ambulatoires et hospitalisées
- Gérer les cas de paludisme, malnutrition aiguë et infections respiratoires
- Superviser les agents de santé communautaire
- Participer aux activités de surveillance épidémiologique
- Contribuer aux formations du personnel médical local

**Lieu :** Kaga-Bandoro (Nana-Mambéré)
**Durée :** 6 à 12 mois`,
    requirements: `- Diplôme de médecine (Doctorat en médecine)
- Inscription à l'Ordre des Médecins de RCA ou pays d'origine
- Expérience en contexte de ressources limitées souhaitée
- Motivation pour la médecine humanitaire
- Maîtrise du français ; le sango est un atout majeur`,
    benefits: "Salaire MSF international, hébergement fourni, billet d'avion, assurance maladie-rapatriement, formation MSF"
  },
  // ── ACTED ─────────────────────────────────────────────────────────
  {
    companyId: COS.acted,
    title: "Chargé(e) de Programme WASH",
    type: "CDD", category: "Humanitaire & ONG", location: "Bambari",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-10-25",
    description: `ACTED RCA recrute un(e) Chargé(e) de Programme WASH pour superviser les activités d'eau, hygiène et assainissement dans la région de Bambari.

**Responsabilités :**
- Planifier et superviser les travaux de construction de points d'eau et latrines
- Animer les sessions de promotion à l'hygiène dans les communautés
- Assurer le suivi technique des infrastructures WASH réalisées
- Coordonner avec les autorités locales et les communautés bénéficiaires
- Produire les rapports d'activité mensuels et les données pour le cluster WASH

**Zone d'intervention :** Bambari et environs (Ouaka)`,
    requirements: `- Formation en génie sanitaire, génie civil, santé publique ou équivalent
- Minimum 2 ans d'expérience en programmes WASH en contexte humanitaire
- Maîtrise des techniques de forage et de traitement de l'eau
- Capacité à travailler dans un contexte sécuritaire difficile
- Bonne maîtrise du français et du sango`,
    benefits: "Salaire selon grille ACTED, perdiem, assurance, transport"
  },
  // ── NRC ───────────────────────────────────────────────────────────
  {
    companyId: COS.nrc1,
    title: "Officier(e) de Terrain — Éducation en Urgence",
    type: "CDD", category: "Éducation & Formation", location: "Bria",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-01",
    description: `Le NRC (Norwegian Refugee Council) recrute un(e) Officier(e) de Terrain pour ses activités d'éducation en urgence à Bria (Haute-Kotto).

**Responsabilités :**
- Mettre en œuvre les activités éducatives du programme (espaces sécurisés, cours de rattrapage)
- Former et encadrer les enseignants communautaires
- Collecter les données de suivi-évaluation sur les bénéficiaires
- Faciliter la distribution du matériel scolaire et des kits pédagogiques
- Assurer la liaison avec les communautés déplacées et les autorités éducatives

**Durée :** 12 mois renouvelables`,
    requirements: `- Licence en éducation, sciences de l'éducation ou domaine connexe
- 2 ans minimum d'expérience dans l'éducation en urgence ou le développement
- Connaissance du contexte RCA et des populations déplacées
- Capacité à effectuer des déplacements réguliers sur le terrain
- Maîtrise du français et du sango oral`,
    benefits: "Salaire NRC, assurance, transport, hébergement selon disponibilité"
  },
  // ── IRC ───────────────────────────────────────────────────────────
  {
    companyId: COS.irc1,
    title: "Chargé(e) de Projet Moyens de Subsistance",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-15",
    description: `L'IRC (International Rescue Committee) recrute un(e) Chargé(e) de Projet pour le programme de relèvement économique et de moyens de subsistance à Bangui et dans les zones de retour.

**Responsabilités :**
- Implémenter les activités de transferts monétaires et de formation professionnelle
- Identifier et accompagner les bénéficiaires (femmes, jeunes, PDI retournés)
- Assurer la qualité des formations entrepreneuriales et techniques
- Collaborer avec les institutions de microfinance locales
- Produire les rapports d'activité et tableaux de bord mensuels`,
    requirements: `- Licence ou Master en économie, développement rural, gestion de projet ou similaire
- Minimum 2 ans d'expérience en relèvement économique ou microfinance
- Connaissance des mécanismes de cash transfer (e-vouchers, mobile money)
- Expérience avec les populations vulnérables (PDI, réfugiés)
- Maîtrise du français et du sango`,
    benefits: "Salaire IRC, assurance maladie, formation professionnelle"
  },
  // ── Save the Children ──────────────────────────────────────────────
  {
    companyId: COS.save,
    title: "Nutritionniste Terrain",
    type: "CDD", category: "Médecine & Santé", location: "Paoua",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-10-20",
    description: `Save the Children RCA recrute un(e) Nutritionniste Terrain pour renforcer ses équipes à Paoua (Ouham-Pendé) dans le cadre du programme nutrition intégrée.

**Responsabilités :**
- Dépister et prendre en charge les cas de malnutrition aiguë sévère (MAS) et modérée (MAM)
- Superviser la distribution d'aliments thérapeutiques (RUTF, RUSF)
- Former et encadrer les relais communautaires et les mères
- Assurer le suivi des indicateurs nutritionnels et la mise à jour des bases de données
- Participer aux évaluations nutritionnelles et enquêtes SMART`,
    requirements: `- Diplôme en nutrition, santé publique, ou médecine
- Expérience (même stage) en programmes de nutrition communautaire ou hospitalière
- Connaissance des protocoles nationaux et OMS de prise en charge de la malnutrition
- Disponibilité pour travailler en zone rurale
- Maîtrise du français ; le peuhl ou le gbaya est un avantage`,
    benefits: "Salaire Save the Children, hébergement, transport local, assurance"
  },
  // ── OMS ───────────────────────────────────────────────────────────
  {
    companyId: COS.oms,
    title: "Consultant(e) Surveillance Épidémiologique",
    type: "Consultant", category: "Médecine & Santé", location: "Bangui",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-10-22",
    description: `L'OMS (Organisation Mondiale de la Santé) recrute un(e) Consultant(e) National(e) en Surveillance Épidémiologique pour renforcer le Système de Surveillance Intégré des Maladies et Riposte (SMIR) en RCA.

**Responsabilités :**
- Renforcer les capacités de détection et de notification des épidémies au niveau districts et régional
- Analyser les données épidémiologiques hebdomadaires et produire les bulletins
- Former les équipes de santé de district aux outils de surveillance numérique (DHIS2)
- Appuyer les enquêtes et investigations d'alertes et d'épidémies
- Contribuer aux plans de préparation et de riposte aux épidémies

**Durée :** 6 mois, renouvelable
**Démarrage :** Novembre 2026`,
    requirements: `- Médecin, épidémiologiste ou biologiste avec spécialisation en santé publique
- Minimum 5 ans d'expérience en surveillance épidémiologique
- Maîtrise des outils épidémiologiques (Epi Info, R, DHIS2)
- Bonne connaissance du système de santé centrafricain
- Excellentes aptitudes pédagogiques`,
    benefits: "Honoraires OMS, frais de mission couverts"
  },
  // ── Ecobank ───────────────────────────────────────────────────────
  {
    companyId: COS.ecobank1,
    title: "Chargé(e) de Relations Clientèle — Entreprises",
    type: "CDI", category: "Banque & Finance", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-08",
    description: `Ecobank RCA recrute un(e) Chargé(e) de Relations Clientèle Entreprises (Corporate Relationship Manager) pour développer son portefeuille PME et grandes entreprises à Bangui.

**Responsabilités :**
- Prospecter et développer un portefeuille de clients entreprises
- Analyser les besoins financiers et proposer des solutions de crédit, trésorerie et trade finance
- Structurer et suivre les dossiers de crédit jusqu'à leur déblocage
- Assurer le suivi régulier des clients et le recouvrement
- Atteindre les objectifs de production et de qualité de portefeuille fixés

**Avantages :** Commission sur performance, voiture de fonction`,
    requirements: `- Bac+4/5 en finance, banque, comptabilité, gestion
- Minimum 3 ans d'expérience dans le financement des entreprises
- Bonne maîtrise de l'analyse financière et du risque de crédit
- Réseau professionnel dans le tissu économique centrafricain
- Maîtrise du français ; l'anglais est un plus`,
    benefits: "Salaire fixe + commission, voiture de fonction, assurance groupe, plan d'épargne"
  },
  // ── Orange Centrafrique ────────────────────────────────────────────
  {
    companyId: COS.orange,
    title: "Ingénieur(e) Data & Business Intelligence",
    type: "CDI", category: "Informatique & Télécoms", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-20",
    description: `Orange Centrafrique recrute un(e) Ingénieur(e) Data & Business Intelligence pour piloter la valorisation des données dans ses différentes directions métiers.

**Responsabilités :**
- Concevoir et maintenir les tableaux de bord analytiques (Power BI, Tableau)
- Collecter, nettoyer et modéliser les données issues des systèmes Orange (CRM, réseau, finance)
- Produire des analyses mensuelles pour le comité de direction
- Développer des modèles prédictifs (churn, fraude, performance réseau)
- Former les utilisateurs métiers aux outils de data visualisation`,
    requirements: `- Ingénieur ou Master en informatique, statistiques, mathématiques appliquées
- 3 ans minimum en data analysis ou business intelligence
- Maîtrise de SQL, Python et outils BI (Power BI ou Tableau)
- Connaissance des bases de données relationnelles (PostgreSQL, MySQL)
- Autonomie, rigueur et sens de la synthèse`,
    benefits: "Salaire attractif, prime de performance, assurance santé famille, formation internationale"
  },
  // ── TeleCa ────────────────────────────────────────────────────────
  {
    companyId: COS.telecel,
    title: "Technicien(ne) Réseau & Infrastructure 5G",
    type: "CDI", category: "Informatique & Télécoms", location: "Bangui",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-11-12",
    description: `TeleCa Centrafrique recrute un(e) Technicien(ne) Réseau & Infrastructure pour accompagner le déploiement et la maintenance de son réseau télécom à Bangui et dans les préfectures.

**Responsabilités :**
- Installer, configurer et maintenir les équipements BTS, antennes et faisceaux hertziens
- Diagnostiquer et résoudre les pannes réseau (2G/3G/4G)
- Assurer la supervision du réseau via les outils NMS
- Participer aux audits réseau et aux projets d'optimisation
- Rédiger les rapports d'intervention et de maintenance préventive`,
    requirements: `- BTS ou Licence en télécommunications, électronique, réseaux
- Connaissance des technologies GSM/UMTS/LTE
- Habilitation travaux en hauteur souhaitée
- Disponibilité pour les astreintes et déplacements en provinces
- Sens du travail en équipe et rigueur technique`,
    benefits: "Salaire fixe, primes, flotte téléphonique, formation technique"
  },
  // ── SODECA ────────────────────────────────────────────────────────
  {
    companyId: COS.sodeca,
    title: "Chimiste / Ingénieur(e) Traitement des Eaux",
    type: "CDI", category: "Eau & Assainissement", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-18",
    description: `La SODECA (Société de Distribution d'Eau en Centrafrique) recrute un(e) Chimiste / Ingénieur(e) Traitement des Eaux pour renforcer son service technique de production.

**Responsabilités :**
- Contrôler la qualité de l'eau potable distribuée (analyses physico-chimiques et bactériologiques)
- Gérer les procédés de traitement (coagulation, floculation, filtration, chloration)
- Optimiser la consommation de produits de traitement (chlore, sulfate d'alumine)
- Rédiger les bulletins quotidiens et mensuels de qualité de l'eau
- Proposer des améliorations du système de traitement

**Démarrage :** Immédiat`,
    requirements: `- Ingénieur ou Master en chimie, génie chimique, génie sanitaire ou génie civil
- 2 ans minimum d'expérience en traitement de l'eau ou industrie chimique
- Maîtrise des normes OMS et nationales de qualité de l'eau potable
- Connaissance des appareils d'analyse de laboratoire (spectrophotomètre, pH-mètre)
- Rigueur, sens des responsabilités et autonomie`,
    benefits: "Salaire SODECA, avantages en nature, formation continue"
  },
  // ── Expertise France ──────────────────────────────────────────────
  {
    companyId: COS.expertisefr,
    title: "Assistant(e) Technique — Réforme de l'État Civil",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-10-31",
    description: `Expertise France recrute un(e) Assistant(e) Technique pour appuyer la réforme du système d'état civil en République Centrafricaine dans le cadre d'un projet financé par l'UE.

**Responsabilités :**
- Appuyer la Direction de l'État Civil dans la modernisation de ses procédures et systèmes
- Accompagner le déploiement du système informatisé d'enregistrement des naissances
- Organiser et animer des formations pour les officiers d'état civil
- Produire des rapports d'avancement et assurer la capitalisation des bonnes pratiques
- Participer aux réunions de coordination avec les parties prenantes (ministères, UNICEF, UNHCR)

**Durée :** 24 mois
**Financement :** Union Européenne`,
    requirements: `- Master en droit public, administration publique, sciences politiques ou équivalent
- Expérience confirmée en appui institutionnel ou réforme de l'administration publique
- Connaissance des systèmes d'état civil en Afrique subsaharienne
- Excellentes aptitudes rédactionnelles en français
- Expérience avec les bailleurs de fonds (UE, AFD, Banque Mondiale)`,
    benefits: "Salaire Expertise France, per diem, billet d'avion, assurance complète"
  },
  // ── MINUSCA ───────────────────────────────────────────────────────
  {
    companyId: COS.minusca,
    title: "Interprète / Traducteur(trice) — Bambara/Peulh/Français",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-10-18",
    description: `La MINUSCA (Mission Multidimensionnelle Intégrée des Nations Unies pour la Stabilisation en RCA) recrute des Interprètes / Traducteurs pour ses opérations sur le terrain.

**Responsabilités :**
- Assurer l'interprétation consécutive et simultanée lors des réunions, patrouilles et enquêtes
- Traduire des documents officiels, rapports et correspondances
- Faciliter la communication entre le personnel ONU et les communautés locales
- Rédiger des comptes rendus de réunion et synthèses
- Assurer la confidentialité des informations traitées`,
    requirements: `- Bonne maîtrise du français et d'au moins une langue locale (bambara, peulh, sango, gbaya, banda, haoussa)
- Expérience dans l'interprétariat ou la traduction (même bénévole)
- L'anglais est un atout supplémentaire
- Sens de la discrétion, neutralité et éthique professionnelle
- Disponibilité pour des déplacements sur le terrain`,
    benefits: "Indemnité mensuelle MINUSCA, assurance accident, transport"
  },
  // ── FAO ───────────────────────────────────────────────────────────
  {
    companyId: COS.fao,
    title: "Consultant(e) Sécurité Alimentaire — Analyse IPC",
    type: "Consultant", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-10-26",
    description: `La FAO (Organisation des Nations Unies pour l'Alimentation et l'Agriculture) recrute un(e) Consultant(e) National(e) en Sécurité Alimentaire pour coordonner le processus IPC (Cadre Intégré de Classification de la Sécurité Alimentaire) en RCA.

**Responsabilités :**
- Coordonner la collecte et l'analyse des données de sécurité alimentaire à l'échelle nationale
- Animer les ateliers IPC avec l'ensemble des parties prenantes (gouvernement, ONG, agences ONU)
- Produire les rapports et cartes IPC et les présenter aux décideurs et bailleurs
- Renforcer les capacités nationales en matière de collecte et d'analyse de données
- Assurer le lien avec le réseau régional IPC

**Durée :** 6 mois
**Démarrage :** Novembre 2026`,
    requirements: `- Master ou PhD en agriculture, économie, nutrition, géographie ou statistiques
- Minimum 5 ans d'expérience en sécurité alimentaire / analyse IPC
- Maîtrise de la méthodologie IPC et des outils d'analyse (FEWS NET, SMART)
- Connaissance approfondie du contexte agricole et alimentaire en RCA
- Excellentes capacités analytiques et rédactionnelles`,
    benefits: "Honoraires FAO compétitifs, frais de mission couverts"
  },
  // ── Solidarités International ──────────────────────────────────────
  {
    companyId: COS.solidarites,
    title: "Responsable de Base — Programme Urgence",
    type: "CDD", category: "Humanitaire & ONG", location: "Ndélé",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-11-05",
    description: `Solidarités International recrute un(e) Responsable de Base pour piloter les opérations humanitaires (WASH, Sécurité Alimentaire) à Ndélé (Bamingui-Bangoran).

**Responsabilités :**
- Assurer la gestion globale de la base (logistique, RH, finance, sécurité)
- Superviser et animer les équipes terrain (30 à 50 personnes)
- Garantir la bonne mise en œuvre des programmes et l'atteinte des indicateurs
- Représenter Solidarités International auprès des autorités et partenaires locaux
- Assurer le reporting régulier vers la coordination nationale

**Zone :** Ndélé et zones d'opération en Bamingui-Bangoran
**Durée :** 12 mois`,
    requirements: `- Master en gestion de projet humanitaire, coopération internationale ou équivalent
- Minimum 5 ans d'expérience en ONG dont 2 ans à un poste de coordination terrain
- Expérience en gestion de base et de budgets (>1M€)
- Capacité de leadership en contexte sécuritaire volatile
- Maîtrise du français ; l'anglais opérationnel est requis`,
    benefits: "Salaire selon grille SI, hébergement, billet avion, R&R, assurance expatrié"
  },
  // ── Street Child ──────────────────────────────────────────────────
  {
    companyId: COS.streetChild,
    title: "Chargé(e) de Suivi-Évaluation (MEAL Officer)",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-10",
    description: `Street Child recrute un(e) Chargé(e) MEAL pour renforcer le système de suivi, évaluation, redevabilité et apprentissage de ses programmes éducatifs en RCA.

**Responsabilités :**
- Développer et mettre en œuvre le plan MEAL du programme
- Former les équipes terrain aux outils de collecte de données (Kobo Toolbox, ODK)
- Analyser les données de performance et produire des tableaux de bord mensuels
- Organiser et animer les réunions de revue de performance
- Coordonner les évaluations de projet (baseline, midline, endline)
- Gérer les mécanismes de feedback et de réclamation des bénéficiaires`,
    requirements: `- Licence ou Master en statistiques, sciences sociales, M&E ou discipline connexe
- Minimum 2 ans d'expérience dans un poste MEAL en ONG
- Maîtrise de Kobo Toolbox, Excel avancé, et idéalement Power BI ou SPSS
- Expérience dans le secteur éducation / protection de l'enfance
- Excellentes capacités de rédaction de rapports en français`,
    benefits: "Salaire Street Child, assurance santé, formation MEAL"
  },
  // ── INTERSOS ──────────────────────────────────────────────────────
  {
    companyId: COS.intersos1,
    title: "Psychologue / Conseiller(e) Psychosocial(e)",
    type: "CDD", category: "Médecine & Santé", location: "Bangassou",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-10-24",
    description: `INTERSOS RCA recrute un(e) Psychologue pour son programme de soutien psychosocial aux survivant(e)s de violences basées sur le genre (VBG) à Bangassou.

**Responsabilités :**
- Assurer le soutien psychosocial individuel et collectif aux survivant(e)s de VBG
- Animer des groupes de soutien et des espaces d'échange pour femmes et filles
- Orienter les cas complexes vers les structures de santé mentale
- Former les relais communautaires aux premiers secours psychologiques
- Documenter les activités et produire les rapports mensuels

**Lieu :** Bangassou (Mbomou)
**Durée :** 12 mois`,
    requirements: `- Licence ou Master en psychologie clinique ou psychologie sociale
- Expérience (même bénévole) dans le soutien psychosocial
- Sensibilité aux problématiques de genre et de protection
- Capacité à travailler avec des populations traumatisées
- Maîtrise du français ; le sango et le zandé sont des atouts`,
    benefits: "Salaire INTERSOS, hébergement en guesthouse, assurance"
  },
  // ── PUI ───────────────────────────────────────────────────────────
  {
    companyId: COS.pui,
    title: "Infirmier(ère) en Santé Reproductive",
    type: "CDD", category: "Médecine & Santé", location: "Batangafo",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-10-30",
    description: `Première Urgence Internationale (PUI) recrute un(e) Infirmier(ère) spécialisé(e) en santé reproductive pour son hôpital de district à Batangafo (Ouham).

**Responsabilités :**
- Assurer les consultations prénatales (CPN) et postnatales (CPoN)
- Prendre en charge les accouchements normaux et les urgences obstétricales
- Mener les campagnes de planification familiale et de prévention des IST
- Former les accoucheuses traditionnelles en pratiques obstétricales d'urgence
- Renseigner les registres et outils de collecte de données SNIS

**Durée :** 12 mois renouvelables`,
    requirements: `- Diplôme d'État en soins infirmiers ou maïeutique (sage-femme)
- Expérience en santé reproductive, maternité ou gynécologie-obstétrique
- Inscription au Conseil de l'Ordre des Infirmiers de RCA
- Disponibilité pour le travail en zone rurale enclavée
- Maîtrise du français ; connaissance du sango ou du gbaya souhaitée`,
    benefits: "Salaire PUI, hébergement, assurance, formation continue"
  },
  // ── Caritas ───────────────────────────────────────────────────────
  {
    companyId: COS.caritas,
    title: "Coordinateur(trice) Programme Cohésion Sociale",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Senior (5+ ans)", deadline: "2026-11-07",
    description: `Caritas RCA recrute un(e) Coordinateur(trice) de Programme pour piloter ses activités de cohésion sociale et de réconciliation communautaire dans les zones post-conflit.

**Responsabilités :**
- Coordonner la mise en œuvre du programme de cohésion sociale dans 5 préfectures
- Superviser les équipes de terrain et les partenaires d'exécution
- Organiser des activités de dialogue intercommunautaire et de médiation
- Assurer le lien avec les institutions locales (mairies, chefferies, plateformes de paix)
- Rédiger les rapports de projet et participer aux réunions bailleurs

**Budget programme :** 2,5 M€
**Financement :** Caritas Europa / Union Européenne`,
    requirements: `- Master en sciences sociales, droit, relations internationales, peacebuilding
- Minimum 5 ans d'expérience dans la cohésion sociale, la médiation ou la paix
- Connaissance du contexte de conflit en RCA et des dynamiques communautaires
- Leadership, sens de la diplomatie et capacité de négociation
- Maîtrise du français ; l'anglais et le sango sont des atouts`,
    benefits: "Salaire Caritas, assurance santé, congés, per diem missions"
  },
  // ── OIM ───────────────────────────────────────────────────────────
  {
    companyId: COS.oim1,
    title: "Assistant(e) de Programme — Réintégration Communautaire",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-10-22",
    description: `L'OIM RCA recrute un(e) Assistant(e) de Programme pour appuyer les activités de réintégration socioéconomique des personnes déplacées internes (PDI) et retournées.

**Responsabilités :**
- Identifier et enregistrer les bénéficiaires éligibles aux activités de réintégration
- Organiser les formations professionnelles et accompagner les projets d'insertion
- Faciliter les transferts monétaires et suivre l'utilisation des fonds
- Assurer le suivi post-réintégration et collecter les données de suivi
- Appuyer la production des rapports d'activités

**Durée :** 6 mois (avec possibilité de renouvellement)`,
    requirements: `- Licence en sciences sociales, développement, droit ou domaine connexe
- Première expérience (stage inclus) dans la gestion de projets ou le travail social
- Connaissance des problématiques de déplacements forcés et de retour
- Bonne maîtrise de Word, Excel et des outils de collecte de données
- Maîtrise du français et du sango`,
    benefits: "Salaire OIM, assurance, frais de transport"
  },
  // ── WHH ───────────────────────────────────────────────────────────
  {
    companyId: COS.whh,
    title: "Agronome — Sécurité Alimentaire & Résilience",
    type: "CDD", category: "Agriculture & Élevage", location: "Kabo",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-14",
    description: `Welthungerhilfe (WHH) recrute un(e) Agronome pour son programme de sécurité alimentaire et de résilience dans la préfecture de l'Ouham.

**Responsabilités :**
- Accompagner les groupements d'agriculteurs dans l'adoption de pratiques agro-écologiques
- Organiser des champs-écoles paysans (FFS) et des démonstrations techniques
- Distribuer des semences améliorées et des intrants agricoles
- Superviser les activités de maraîchage et de diversification des cultures
- Collecter les données agricoles et produire les rapports mensuels

**Zone :** Kabo, Batangafo et villages alentours (Ouham)`,
    requirements: `- Ingénieur agronome, Licence ou Master en agronomie, développement rural
- Minimum 2 ans d'expérience en vulgarisation agricole ou gestion de programme agri
- Connaissance des cultures vivrières locales (manioc, maïs, arachide, sésame)
- Capacité à effectuer des déplacements réguliers en zone rurale
- Maîtrise du français et du sango ; le gbaya est un plus`,
    benefits: "Salaire WHH, logement en guesthouse, moto, assurance"
  },
  // ── IMPACT Initiatives ────────────────────────────────────────────
  {
    companyId: COS.impact,
    title: "Chargé(e) de Recherche — Analyse de Conflits",
    type: "CDD", category: "Humanitaire & ONG", location: "Bangui",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-11-01",
    description: `IMPACT Initiatives recrute un(e) Chargé(e) de Recherche pour son unité d'analyse des conflits et de l'aide humanitaire en RCA.

**Responsabilités :**
- Concevoir et mettre en œuvre des évaluations de besoins humanitaires (HNO, MSNA, RAM)
- Analyser des données quantitatives et qualitatives liées au conflit, aux déplacements et aux besoins
- Produire des rapports analytiques, cartes et infographies de haute qualité
- Présenter les résultats aux clusters, bailleurs et autorités
- Maintenir les bases de données et les outils de gestion de l'information

**Durée :** 12 mois renouvelables`,
    requirements: `- Master en relations internationales, géopolitique, sciences sociales ou statistiques
- Minimum 2 ans d'expérience en recherche ou gestion de l'information humanitaire
- Maîtrise des méthodes de collecte de données primaires (enquêtes, entretiens)
- Bonne maîtrise d'Excel avancé, SPSS ou R, et d'outils SIG (QGIS)
- Excellentes capacités analytiques et rédactionnelles en français`,
    benefits: "Salaire IMPACT, assurance, formation analytique"
  },
  // ── IMC ───────────────────────────────────────────────────────────
  {
    companyId: COS.imc,
    title: "Sage-Femme Superviseure",
    type: "CDD", category: "Médecine & Santé", location: "Bambari",
    experienceLevel: "Intermédiaire (2-5 ans)", deadline: "2026-10-28",
    description: `International Medical Corps (IMC) recrute une Sage-Femme Superviseure pour son programme de santé maternelle et néonatale à Bambari (Ouaka).

**Responsabilités :**
- Superviser et encadrer les sages-femmes et infirmières de la maternité
- Assurer la prise en charge des urgences obstétricales (hémorragies, éclampsie)
- Mettre en place les protocoles de soins obstétricaux et néonatals d'urgence (SONU)
- Organiser les formations continues du personnel de la maternité
- Coordonner avec le pédiatre et le médecin référent pour les cas complexes

**Durée :** 12 mois`,
    requirements: `- Diplôme de sage-femme d'État
- Minimum 3 ans d'expérience en salle d'accouchement, idéalement en contexte humanitaire
- Maîtrise des protocoles SONU et des techniques d'accouchement assisté
- Sens du leadership et capacité à gérer des équipes sous pression
- Disponibilité pour travailler à Bambari (zone semi-enclavée)`,
    benefits: "Salaire IMC, hébergement, assurance maladie, formation"
  },
  // ── KTZ Group ─────────────────────────────────────────────────────
  {
    companyId: COS.ktz,
    title: "Développeur(se) Web Full-Stack",
    type: "CDI", category: "Informatique & Télécoms", location: "Bangui",
    experienceLevel: "Junior (0-2 ans)", deadline: "2026-11-25",
    description: `KTZ Group SAS recrute un(e) Développeur(se) Web Full-Stack pour renforcer son équipe technologique à Bangui et contribuer au développement de ses plateformes digitales centrafricaines.

**Projets :** ktzemploi.com, solutions e-commerce, outils de gestion interne

**Responsabilités :**
- Développer et maintenir des applications web (frontend et backend)
- Participer à la conception des nouvelles fonctionnalités
- Assurer la qualité du code (tests, revue de code, documentation)
- Collaborer avec les équipes produit et design
- Contribuer à l'optimisation des performances et de la sécurité des applications`,
    requirements: `- Formation en informatique, génie logiciel ou autodidacte avec portfolio solide
- Maîtrise de React / Next.js (frontend)
- Connaissance de Node.js, PostgreSQL ou MongoDB (backend)
- Notions de Git, déploiement cloud (Vercel, AWS ou équivalent)
- Curiosité, autonomie et envie d'apprendre`,
    benefits: "Salaire compétitif, équipement fourni, formation continue, environnement tech stimulant, possibilité de télétravail partiel"
  },
];

async function main() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connecté à Supabase\n");

  // ── 1. Supprimer les offres expirées ────────────────────────────
  console.log("=== 1. Suppression des offres expirées ===");
  const deleted = await client.query(
    `DELETE FROM "Job" WHERE deadline < NOW() RETURNING id, title`
  );
  console.log(`✅ ${deleted.rowCount} offres supprimées`);
  for (const r of deleted.rows) console.log(`   - ${r.title}`);

  // ── 2. Réinitialiser les mots de passe admin ────────────────────
  console.log("\n=== 2. Réinitialisation des mots de passe admin ===");
  const NEW_PASSWORD = "KTZ@Admin2026!";
  const hash = await bcrypt.hash(NEW_PASSWORD, 12);
  const updated = await client.query(
    `UPDATE "User" SET password = $1 WHERE role = 'ADMIN' RETURNING email, name`,
    [hash]
  );
  console.log(`✅ ${updated.rowCount} compte(s) mis à jour`);
  for (const u of updated.rows) console.log(`   - ${u.email} (${u.name})`);
  console.log(`   Nouveau mot de passe : ${NEW_PASSWORD}`);

  // ── 3. Ajouter les nouvelles offres ─────────────────────────────
  console.log("\n=== 3. Ajout des nouvelles offres d'emploi ===");
  let added = 0;
  const now = new Date();

  for (const job of JOBS) {
    const id = `cuid_oct26_${Math.random().toString(36).slice(2, 10)}`;
    const jobSlug = slug(job.title, Math.random().toString(36).slice(2, 7));
    const deadline = new Date(job.deadline);

    try {
      await client.query(
        `INSERT INTO "Job" (id, "companyId", title, slug, description, requirements, benefits, type, category, location, remote, "experienceLevel", deadline, published, featured, views, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
        [
          id,
          job.companyId,
          job.title,
          jobSlug,
          job.description,
          job.requirements || null,
          job.benefits || null,
          job.type,
          job.category,
          job.location,
          false,
          job.experienceLevel || null,
          deadline,
          true,
          false,
          0,
          now,
          now,
        ]
      );
      console.log(`  ✅ ${job.title} (${job.category} — ${job.location})`);
      added++;
    } catch (e) {
      console.log(`  ❌ ERREUR ${job.title}: ${e.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log(`✅ ${deleted.rowCount} offres expirées supprimées`);
  console.log(`✅ ${added} nouvelles offres ajoutées`);
  console.log(`✅ Mot de passe admin réinitialisé`);
  console.log(`\n🔐 IDENTIFIANTS ADMIN :`);
  for (const u of updated.rows) console.log(`   Email : ${u.email}  |  Mot de passe : ${NEW_PASSWORD}`);
  console.log(`═══════════════════════════════════════════\n`);

  await client.end();
}

main().catch(e => { console.error("Erreur:", e.message); process.exit(1); });
