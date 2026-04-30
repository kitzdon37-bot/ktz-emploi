export interface AnnuaireEntreprise {
  nom: string;
  secteur: string;
  description?: string;
  telephone?: string;
  email?: string;
  site?: string;
  localisation?: string;
}

export const ANNUAIRE_RCA: AnnuaireEntreprise[] = [
  // ── Banques & Finance ────────────────────────────────────────────────
  {
    nom: "Ecobank Centrafrique",
    secteur: "Banque & Finance",
    description: "Banque commerciale — réseau panafricain",
    telephone: "+236 74 20 78 36",
    email: "ecobankenquiries@ecobank.com",
    site: "https://www.ecobank.com",
    localisation: "Place de la République, Bangui",
  },
  {
    nom: "BGFIBank Centrafrique",
    secteur: "Banque & Finance",
    description: "Banque commerciale — groupe BGFI",
    telephone: "+236 21 61 29 90",
    email: "bgfibankca@bgfi.com",
    site: "https://bgfibank-ca.com",
    localisation: "Bd du Général de Gaulle, Bangui",
  },
  {
    nom: "Banque BPMC",
    secteur: "Banque & Finance",
    description: "Banque Populaire Maroco-Centrafricaine",
    telephone: "+236 72 83 92 25",
    email: "contact@bpmcbank.com",
    site: "https://www.groupebcp.com",
    localisation: "Rue de l'Ambassadeur Guerillot, Bangui",
  },
  {
    nom: "Banque BSIC",
    secteur: "Banque & Finance",
    description: "Banque Sahélo Saharienne pour l'Investissement et le Commerce",
    telephone: "+236 21 61 27 48",
    email: "bsic.centralafrica@bsicbank.com",
    site: "https://bsicbank.com",
    localisation: "Avenue du Tchad, Bangui",
  },
  {
    nom: "Banque CMCA",
    secteur: "Banque & Finance",
    description: "Caisses Mutuelles de Centrafrique",
    telephone: "+236 72 02 11 05",
    email: "marketing@caissesmutuelles-rca.com",
    site: "http://cmca-rca.com",
    localisation: "Rue De La Victoire, Bangui",
  },
  {
    nom: "Crédit Populaire de Centrafrique",
    secteur: "Banque & Finance",
    description: "Banque commerciale",
    telephone: "+236 21 61 83 84",
    localisation: "Rond Point Zéro, Bangui",
  },
  {
    nom: "SOFIA CREDIT SA",
    secteur: "Banque & Finance",
    description: "Société Financière Africaine de Crédit",
    telephone: "+236 72 61 49 19",
    email: "infos@sofia-credit.com",
    site: "https://sofia-credit.com",
    localisation: "Rue Joseph Degrain, Bangui",
  },
  {
    nom: "Express Union Centrafrique",
    secteur: "Banque & Finance",
    description: "Services de transfert d'argent et change",
    telephone: "+236 72 05 38 18",
    email: "eurca@expressunion.net",
    site: "https://centrafrique.eui.cynomedia-africa.com",
    localisation: "Avenue de l'Indépendance, Bangui",
  },
  {
    nom: "Cabinet MIMA Consulting",
    secteur: "Banque & Finance",
    description: "Expertise comptable",
    telephone: "+236 75 50 21 71",
    email: "departementrhmima@gmail.com",
    localisation: "Lakouanga, Bangui",
  },
  {
    nom: "Bureau Comptable et Fiscal",
    secteur: "Banque & Finance",
    description: "Experts comptables et commissaires aux comptes",
    telephone: "+236 72 73 09 38",
    email: "bcf@bcf-afrique.com",
    site: "https://www.bcf-afrique.com",
    localisation: "Rue Naval, Bangui",
  },
  {
    nom: "Cabinet Lawson & Associés",
    secteur: "Banque & Finance",
    description: "Experts comptables et commissaires aux comptes",
    telephone: "+236 70 50 22 38",
    email: "arccabinetlawson@yahoo.fr",
    localisation: "Avenue de l'Indépendance, Bangui",
  },

  // ── Assurances ───────────────────────────────────────────────────────
  {
    nom: "ASCOMA Centrafrique",
    secteur: "Assurances",
    description: "Société d'assurance et de courtage",
    telephone: "+236 21 61 19 33",
    email: "centrafrique@ascoma.com",
    site: "https://ascoma.com",
    localisation: "Avenue Barthélémy Boganda, Bangui",
  },
  {
    nom: "SUNU ASSURANCES IARD",
    secteur: "Assurances",
    description: "Assurance Incendie, Accidents, Risques Divers",
    telephone: "+236 21 61 31 02",
    email: "centrafrique.iard@sunu-group.com",
    site: "https://sunu-group.com",
    localisation: "Bd du Général de Gaulle, Bangui",
  },
  {
    nom: "CSP Assurances Conseil",
    secteur: "Assurances",
    description: "Cabinet de conseil en assurances",
    telephone: "+236 75 50 14 76",
    localisation: "Quartier Ngaragba, Bangui",
  },

  // ── Télécoms ─────────────────────────────────────────────────────────
  {
    nom: "Orange Centrafrique",
    secteur: "Télécommunications",
    description: "Opérateur téléphonique — leader en RCA",
    telephone: "+236 72 27 08 00",
    email: "serviceclient@orangerca.com",
    site: "https://www.orangerca.com",
    localisation: "Avenue Barthélémy Boganda, Bangui",
  },
  {
    nom: "Telecel Centrafrique",
    secteur: "Télécommunications",
    description: "Opérateur téléphonique mobile",
    telephone: "+236 75 19 19 19",
    site: "https://www.telecel-rca.com",
    localisation: "Rue Monseigneur Grandin, Bangui",
  },
  {
    nom: "Moov Africa Centrafrique",
    secteur: "Télécommunications",
    description: "Opérateur téléphonique mobile",
    telephone: "+236 70 70 20 20",
    localisation: "Rue de l'Ambassadeur Guerillot, Bangui",
  },

  // ── Informatique ─────────────────────────────────────────────────────
  {
    nom: "BeafricaCore",
    secteur: "Informatique & Télécoms",
    description: "Conseil IT & Data",
    telephone: "+236 75 35 04 85",
    email: "contact@beafricacore.com",
    localisation: "Bangui",
  },
  {
    nom: "Maurison Corporation",
    secteur: "Informatique & Télécoms",
    description: "Solutions IT, réseaux et services managés",
    telephone: "+236 72 19 53 13",
    email: "info@maurisoncorp.com",
    localisation: "Bangui",
  },
  {
    nom: "SAS-Technologie",
    secteur: "Informatique & Télécoms",
    description: "Intégration IT, réseaux et télécoms",
    telephone: "+236 72 04 10 50",
    localisation: "Bangui",
  },
  {
    nom: "Imaï Innov",
    secteur: "Informatique & Télécoms",
    description: "Services informatiques",
    telephone: "+236 74 64 81 46",
    email: "infos@imaiinnov.com",
    localisation: "Bangui",
  },

  // ── BTP & Construction ───────────────────────────────────────────────
  {
    nom: "Sogea Satom (Vinci Construction)",
    secteur: "BTP & Construction",
    description: "Travaux publics et génie civil — groupe Vinci",
    localisation: "Bangui",
  },
  {
    nom: "Atelier A3 Architectes Africains Associés",
    secteur: "BTP & Construction",
    description: "Cabinet d'architecture",
    telephone: "+236 70 16 44 00",
    email: "contact@ateliera3sarl.com",
    localisation: "Avenue de l'Indépendance, Bangui",
  },
  {
    nom: "Lege Engineering Centrafrique",
    secteur: "BTP & Construction",
    description: "Bureau d'études et d'ingénierie",
    email: "contact@lege-engineering.com",
    localisation: "Bangui",
  },
  {
    nom: "Aptech Africa SARL",
    secteur: "BTP & Construction",
    description: "Équipements solaires et énergies renouvelables",
    email: "kidane@aptechafrica.com",
    localisation: "Bangui",
  },

  // ── Transport & Logistique ───────────────────────────────────────────
  {
    nom: "DHL International Centrafrique",
    secteur: "Transport & Logistique",
    description: "Messagerie et logistique internationale",
    localisation: "Bangui",
  },
  {
    nom: "FedEx / TNT Centrafrique",
    secteur: "Transport & Logistique",
    description: "Messagerie et transport express international",
    localisation: "Bangui",
  },
  {
    nom: "UPS Centrafrique",
    secteur: "Transport & Logistique",
    description: "Messagerie et logistique internationale",
    localisation: "Bangui",
  },
  {
    nom: "AGS Déménagements",
    secteur: "Transport & Logistique",
    description: "Déménagements et garde-meubles",
    localisation: "Bangui",
  },
  {
    nom: "Central African Transport (CAT)",
    secteur: "Transport & Logistique",
    description: "Transport et logistique en conditions difficiles",
    localisation: "Bangui",
  },
  {
    nom: "Groupe Morrisson SARL",
    secteur: "Transport & Logistique",
    description: "Transitaire et logistique",
    localisation: "Bangui",
  },

  // ── Santé ────────────────────────────────────────────────────────────
  {
    nom: "Hôpital Général (CNHUB)",
    secteur: "Santé",
    description: "Centre Hospitalier Universitaire de Bangui",
    telephone: "+236 72 42 23 80",
    localisation: "Avenue de l'Indépendance, Bangui",
  },
  {
    nom: "Hôpital de l'Amitié",
    secteur: "Santé",
    description: "Hôpital public",
    telephone: "+236 21 61 57 00",
    localisation: "Avenue de l'Indépendance, Bangui",
  },
  {
    nom: "Hôpital Communautaire",
    secteur: "Santé",
    description: "Hôpital communautaire de Bangui",
    telephone: "+236 21 61 20 17",
    localisation: "Avenue des Martyrs, Bangui",
  },
  {
    nom: "Clinique Sainte Blandine",
    secteur: "Santé",
    description: "Clinique privée",
    telephone: "+236 70 05 40 99",
    email: "cliniquesainteblandine@yahoo.fr",
    localisation: "4ème arrondissement, Bangui",
  },
  {
    nom: "Polyclinique Internationale de Bangui",
    secteur: "Santé",
    description: "Polyclinique privée",
    telephone: "+236 75 11 46 32",
    localisation: "Avenue de France, Bangui",
  },
  {
    nom: "Institut Pasteur de Bangui",
    secteur: "Santé",
    description: "Institut de recherche en santé publique",
    telephone: "+236 21 61 08 66",
    email: "secretariat@pasteur-bangui.org",
    site: "https://www.pasteur.fr",
    localisation: "Avenue de l'Indépendance, Bangui",
  },

  // ── Éducation & Formation ────────────────────────────────────────────
  {
    nom: "Groupe Elite Formation",
    secteur: "Éducation & Formation",
    description: "Centre de formation professionnelle",
    telephone: "+236 21 61 06 07",
    localisation: "Sica 2, Bangui",
  },
  {
    nom: "New Tech Institut de Formation",
    secteur: "Éducation & Formation",
    description: "Institut de formation professionnelle en informatique",
    telephone: "+236 75 00 82 26",
    localisation: "Sica 2, Bangui",
  },

  // ── Commerce & Industrie ─────────────────────────────────────────────
  {
    nom: "TRADEX Centrafrique",
    secteur: "Industrie",
    description: "Distribution de produits pétroliers et énergétiques",
    telephone: "+236 21 61 46 68",
    localisation: "Bangui",
  },

  // ── Hôtellerie & Tourisme ────────────────────────────────────────────
  {
    nom: "Ledger Plaza Bangui",
    secteur: "Hôtellerie & Tourisme",
    description: "Hôtel de standing international",
    localisation: "Bangui",
  },
  {
    nom: "Hôtel Oubangui",
    secteur: "Hôtellerie & Tourisme",
    description: "Hôtel historique de Bangui",
    localisation: "Bangui",
  },
  {
    nom: "Air France Bangui",
    secteur: "Hôtellerie & Tourisme",
    description: "Compagnie aérienne — liaisons France–RCA",
    localisation: "Bangui",
  },
  {
    nom: "Royal Air Maroc Bangui",
    secteur: "Hôtellerie & Tourisme",
    description: "Compagnie aérienne — liaisons Maroc–RCA",
    localisation: "Bangui",
  },
  {
    nom: "Doli Lodge",
    secteur: "Hôtellerie & Tourisme",
    description: "Hébergement écotouristique près du parc Dzanga-Sangha",
    localisation: "Dzanga-Sangha, RCA",
  },
];

export const SECTEURS_ANNUAIRE = [
  ...new Set(ANNUAIRE_RCA.map((e) => e.secteur)),
].sort();
