export interface JobTemplatePreset {
  name: string;
  title: string;
  type: string;
  category: string;
  location: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin?: number;
  salaryMax?: number;
}

export const JOB_TEMPLATE_PRESETS: JobTemplatePreset[] = [
  {
    name: "Comptable",
    title: "Comptable",
    type: "CDI",
    category: "Comptabilité & Audit",
    location: "Bangui",
    description:
      "Nous recherchons un(e) comptable rigoureux(se) pour assurer la gestion financière de notre structure. Il/elle sera en charge de la tenue des livres comptables, de l'élaboration des états financiers et du suivi de la trésorerie.",
    requirements:
      "- Diplôme en comptabilité, finance ou gestion (BTS/Licence)\n- Maîtrise des logiciels de comptabilité (Sage, Excel)\n- Expérience de 2 ans minimum dans un poste similaire\n- Rigueur, organisation et sens de la confidentialité",
    benefits:
      "- Salaire compétitif\n- Prise en charge du transport\n- Environnement de travail stable",
    salaryMin: 150000,
    salaryMax: 300000,
  },
  {
    name: "Secrétaire de direction",
    title: "Secrétaire de direction",
    type: "CDI",
    category: "RH & Administration",
    location: "Bangui",
    description:
      "Nous recrutons une secrétaire de direction pour assister notre équipe dirigeante. Vous serez responsable de la gestion du courrier, de l'agenda, de l'accueil des visiteurs et de la rédaction de documents administratifs.",
    requirements:
      "- BTS en secrétariat ou administration\n- Maîtrise du traitement de texte (Word, Excel)\n- Excellente expression écrite et orale en français\n- Sens de l'organisation et discrétion",
    benefits:
      "- Cadre de travail agréable\n- Formation continue\n- Indemnité de transport",
    salaryMin: 100000,
    salaryMax: 200000,
  },
  {
    name: "Caissier(ère)",
    title: "Caissier(ère)",
    type: "CDI",
    category: "Commerce & Vente",
    location: "Bangui",
    description:
      "Nous recherchons un(e) caissier(ère) sérieux(se) pour rejoindre notre équipe. Vous serez en charge de l'encaissement des ventes, de la gestion de la caisse et de l'accueil de la clientèle.",
    requirements:
      "- Niveau BEPC minimum\n- Honnêteté et sens des responsabilités\n- Aptitude au calcul et à la manipulation des espèces\n- Expérience en caisse appréciée",
    benefits:
      "- Salaire fixe + prime de rendement\n- Repas de midi pris en charge\n- Horaires fixes",
    salaryMin: 80000,
    salaryMax: 150000,
  },
  {
    name: "Chauffeur",
    title: "Chauffeur",
    type: "CDI",
    category: "Logistique & Transport",
    location: "Bangui",
    description:
      "Nous recrutons un chauffeur pour assurer le transport du personnel et des marchandises. Le candidat devra conduire les véhicules de la structure en toute sécurité et veiller à leur entretien.",
    requirements:
      "- Permis de conduire catégorie B (catégorie C un atout)\n- Connaissance du code de la route\n- Au moins 3 ans d'expérience en conduite\n- Sérieux, ponctualité et sens des responsabilités",
    benefits:
      "- Véhicule de service\n- Carburant pris en charge\n- Assurance maladie",
    salaryMin: 100000,
    salaryMax: 180000,
  },
  {
    name: "Agent de sécurité",
    title: "Agent de sécurité",
    type: "CDI",
    category: "Sécurité",
    location: "Bangui",
    description:
      "Nous cherchons un agent de sécurité pour assurer la protection de nos locaux et du personnel. Vous serez responsable du contrôle des accès, de la surveillance et de la gestion des situations d'urgence.",
    requirements:
      "- Expérience en sécurité ou dans les forces de l'ordre appréciée\n- Bonne condition physique\n- Sens du devoir et réactivité\n- Disponible pour les gardes de nuit et les week-ends",
    benefits:
      "- Tenue de travail fournie\n- Prime de nuit\n- Repas pris en charge",
    salaryMin: 80000,
    salaryMax: 150000,
  },
  {
    name: "Infirmier(ère)",
    title: "Infirmier(ère)",
    type: "CDI",
    category: "Médecine & Santé",
    location: "Bangui",
    description:
      "Nous recrutons un(e) infirmier(ère) diplômé(e) pour assurer les soins aux patients de notre établissement. Vous travaillerez en collaboration avec l'équipe médicale pour garantir la qualité des soins.",
    requirements:
      "- Diplôme d'État d'infirmier\n- Inscription à l'ordre des infirmiers de RCA\n- Expérience hospitalière ou en clinique appréciée\n- Empathie, rigueur et capacité à travailler sous pression",
    benefits:
      "- Prise en charge médicale\n- Logement possible\n- Formation continue",
    salaryMin: 150000,
    salaryMax: 350000,
  },
  {
    name: "Enseignant(e)",
    title: "Enseignant(e)",
    type: "CDI",
    category: "Éducation & Formation",
    location: "Bangui",
    description:
      "Notre établissement scolaire recrute un(e) enseignant(e) pour dispenser des cours dans sa discipline. Il/elle sera chargé(e) de préparer et animer les séances d'enseignement, d'évaluer les élèves et de contribuer à la vie scolaire.",
    requirements:
      "- Licence ou Master dans la discipline enseignée\n- CAPES ou équivalent apprécié\n- Expérience pédagogique souhaitée\n- Patience, pédagogie et sens de la communication",
    benefits:
      "- Salaire selon grille de l'Éducation nationale\n- Congés scolaires\n- Avancement de carrière",
    salaryMin: 100000,
    salaryMax: 250000,
  },
  {
    name: "Technicien informatique",
    title: "Technicien informatique",
    type: "CDI",
    category: "Informatique & Télécoms",
    location: "Bangui",
    description:
      "Nous recherchons un technicien informatique pour assurer le support technique, la maintenance du parc informatique et l'assistance aux utilisateurs de notre structure.",
    requirements:
      "- BTS ou Licence en informatique\n- Maîtrise des systèmes Windows et Linux\n- Connaissance des réseaux (TCP/IP, Wi-Fi)\n- Autonomie et sens du service",
    benefits:
      "- Matériel informatique fourni\n- Formation aux nouvelles technologies\n- Perspectives d'évolution",
    salaryMin: 150000,
    salaryMax: 300000,
  },
  {
    name: "Commercial(e) terrain",
    title: "Commercial(e) terrain",
    type: "CDI",
    category: "Commerce & Vente",
    location: "Bangui",
    description:
      "Nous recrutons un(e) commercial(e) dynamique pour développer notre portefeuille clients. Vous serez en charge de la prospection, de la négociation et du suivi des ventes sur le terrain.",
    requirements:
      "- Bac +2 en commerce, marketing ou équivalent\n- Expérience commerciale de 1 an minimum\n- Permis de conduire souhaité\n- Sens du relationnel, persévérance et goût du challenge",
    benefits:
      "- Salaire fixe + commissions sur ventes\n- Moto ou véhicule de service\n- Formation produits assurée",
    salaryMin: 100000,
    salaryMax: 250000,
  },
  {
    name: "Maçon / Ouvrier BTP",
    title: "Maçon qualifié",
    type: "CDD",
    category: "BTP & Construction",
    location: "Bangui",
    description:
      "Dans le cadre d'un chantier de construction, nous recherchons un maçon qualifié. Vous serez en charge de la réalisation des travaux de maçonnerie selon les plans fournis par l'ingénieur.",
    requirements:
      "- CAP maçonnerie ou expérience équivalente\n- Maîtrise des techniques de construction (béton armé, pose de parpaings)\n- Aptitude physique\n- Capacité à travailler en équipe",
    benefits:
      "- Salaire journalier ou mensuel\n- Équipements de protection fournis\n- Possibilité de renouvellement",
    salaryMin: 100000,
    salaryMax: 200000,
  },
  {
    name: "Chargé(e) RH",
    title: "Chargé(e) des Ressources Humaines",
    type: "CDI",
    category: "RH & Administration",
    location: "Bangui",
    description:
      "Nous recrutons un(e) chargé(e) RH pour gérer les ressources humaines de notre entreprise. Vous serez responsable du recrutement, de la gestion administrative du personnel et du suivi des formations.",
    requirements:
      "- Licence ou Master en GRH, droit du travail ou équivalent\n- Connaissance du droit du travail centrafricain\n- Maîtrise des outils bureautiques\n- Discrétion, organisation et sens des relations humaines",
    benefits:
      "- Poste à responsabilités\n- Mutuelle d'entreprise\n- Évolution possible vers un poste de DRH",
    salaryMin: 200000,
    salaryMax: 400000,
  },
  {
    name: "Logisticien(ne) ONG",
    title: "Logisticien(ne)",
    type: "CDD",
    category: "Humanitaire & ONG",
    location: "Bangui",
    description:
      "Dans le cadre de notre programme humanitaire, nous recherchons un(e) logisticien(ne) expérimenté(e) pour gérer les approvisionnements, le parc de véhicules et les entrepôts de notre organisation.",
    requirements:
      "- Licence en logistique, gestion ou équivalent\n- Expérience en logistique humanitaire appréciée\n- Connaissance des procédures d'achat des bailleurs de fonds\n- Maîtrise du français et de l'anglais",
    benefits:
      "- Per diem\n- Couverture médicale\n- Accès aux formations de l'organisation",
    salaryMin: 300000,
    salaryMax: 600000,
  },
];
