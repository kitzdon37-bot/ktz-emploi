// Pages d'atterrissage SEO : offres par ville, par secteur et par type de contrat.
// Chaque page cible une recherche précise (« emploi Bangui », « emploi ONG Centrafrique », « stage Bangui »…)
// et possède son propre texte d'introduction.

export type LandingKind = "ville" | "secteur" | "contrat";

export interface Landing {
  kind: LandingKind;
  slug: string;
  label: string;
  /** Titre de la page (balise <title>) */
  title: string;
  /** Titre visible H1 */
  h1: string;
  description: string;
  intro: string[];
  /** Filtre Prisma sur les offres */
  filter: Record<string, unknown>;
  /** Lien vers la recherche détaillée */
  searchHref: string;
}

const enc = encodeURIComponent;

// ── Villes ───────────────────────────────────────────────────────────────────
type City = { slug: string; label: string; match: string[]; region?: string; intro?: string[] };

const CITIES: City[] = [
  {
    slug: "bangui",
    label: "Bangui",
    match: ["Bangui"],
    intro: [
      "Bangui, capitale de la République Centrafricaine, concentre la majorité des offres d'emploi du pays : administrations, banques, entreprises de télécommunications, commerces, mais aussi de nombreuses ONG et organisations internationales installées dans la capitale.",
      "Sur KTZ Emploi, vous trouvez chaque jour les nouvelles offres d'emploi à Bangui : CDI, CDD, stages, missions de consultant et postes dans l'humanitaire. Créez votre profil gratuitement, déposez votre CV et postulez en ligne en quelques clics, sans intermédiaire.",
    ],
  },
  { slug: "bimbo", label: "Bimbo", match: ["Bimbo"], region: "l'Ombella-M'Poko, aux portes de Bangui" },
  { slug: "bambari", label: "Bambari", match: ["Bambari"], region: "la Ouaka" },
  { slug: "berberati", label: "Berbérati", match: ["Berbérati", "Berberati"], region: "la Mambéré-Kadéï" },
  { slug: "carnot", label: "Carnot", match: ["Carnot"], region: "l'ouest du pays" },
  { slug: "kaga-bandoro", label: "Kaga-Bandoro", match: ["Kaga-Bandoro", "Kaga Bandoro"], region: "la Nana-Grébizi" },
  { slug: "bozoum", label: "Bozoum", match: ["Bozoum"], region: "l'Ouham-Pendé" },
  { slug: "bouar", label: "Bouar", match: ["Bouar"], region: "la Nana-Mambéré" },
  { slug: "nola", label: "Nola", match: ["Nola"], region: "la Sangha-Mbaéré" },
  { slug: "bossangoa", label: "Bossangoa", match: ["Bossangoa"], region: "l'Ouham" },
  { slug: "mbaiki", label: "Mbaïki", match: ["Mbaïki", "Mbaiki"], region: "la Lobaye" },
  { slug: "sibut", label: "Sibut", match: ["Sibut"], region: "la Kémo" },
  { slug: "bria", label: "Bria", match: ["Bria"], region: "la Haute-Kotto" },
  { slug: "ndele", label: "Ndélé", match: ["Ndélé", "Ndele"], region: "le Bamingui-Bangoran" },
  { slug: "alindao", label: "Alindao", match: ["Alindao"], region: "la Basse-Kotto" },
];

function cityLanding(c: City): Landing {
  return {
    kind: "ville",
    slug: c.slug,
    label: c.label,
    title: `Emploi ${c.label} : offres d'emploi à ${c.label} (Centrafrique)`,
    h1: `Offres d'emploi à ${c.label}`,
    description: `Toutes les offres d'emploi à ${c.label}, en République Centrafricaine : CDI, CDD, stages, ONG et organisations internationales. Postulez en ligne gratuitement sur KTZ Emploi.`,
    intro: c.intro ?? [
      `Vous cherchez un emploi à ${c.label}, dans ${c.region} ? KTZ Emploi rassemble les offres publiées par les entreprises, les ONG et les organisations internationales qui recrutent à ${c.label} et dans ses environs.`,
      `Les organisations humanitaires et de développement recrutent régulièrement en province, aussi bien du personnel national que des profils techniques : santé, logistique, agriculture, protection, eau et assainissement. Créez une alerte emploi pour être prévenu dès qu'une nouvelle offre est publiée à ${c.label}.`,
    ],
    filter: { OR: c.match.map((m) => ({ location: { contains: m, mode: "insensitive" } })) },
    searchHref: `/emplois?location=${enc(c.match[0])}`,
  };
}

// ── Secteurs ─────────────────────────────────────────────────────────────────
type Sector = { slug: string; category: string; label: string; keyword: string; intro: string[] };

const SECTORS: Sector[] = [
  {
    slug: "humanitaire-ong", category: "Humanitaire & ONG", label: "Humanitaire & ONG", keyword: "emploi ONG en Centrafrique",
    intro: [
      "La République Centrafricaine accueille de nombreuses ONG nationales et internationales, ainsi que les agences des Nations Unies. Elles recrutent tout au long de l'année : coordinateurs de projet, chargés de suivi-évaluation, logisticiens, agents de protection, médecins, infirmiers, comptables et chauffeurs.",
      "Retrouvez sur KTZ Emploi les offres d'emploi humanitaire à Bangui et en province, et postulez directement en ligne avec votre CV.",
    ],
  },
  {
    slug: "informatique-telecoms", category: "Informatique & Télécoms", label: "Informatique & Télécoms", keyword: "emploi informatique en Centrafrique",
    intro: [
      "Développeurs, administrateurs réseau, techniciens télécoms, spécialistes data : les opérateurs de téléphonie, les banques, les ONG et les entreprises centrafricaines recherchent des profils numériques.",
      "Consultez les offres d'emploi en informatique et télécommunications à Bangui et dans toute la RCA, et mettez en avant vos compétences dans votre profil KTZ Emploi.",
    ],
  },
  {
    slug: "sante", category: "Médecine & Santé", label: "Médecine & Santé", keyword: "emploi santé en Centrafrique",
    intro: [
      "Médecins, infirmiers, sages-femmes, pharmaciens, agents de santé communautaire : les hôpitaux, centres de santé, ONG médicales et programmes de santé publique recrutent en République Centrafricaine.",
      "Trouvez ici les offres d'emploi dans la santé à Bangui et en province.",
    ],
  },
  {
    slug: "banque-finance", category: "Banque & Finance", label: "Banque & Finance", keyword: "emploi banque en Centrafrique",
    intro: [
      "Banques commerciales, institutions de microfinance, assurances et services de mobile money recrutent chargés de clientèle, analystes crédit, caissiers et contrôleurs.",
      "Découvrez les offres d'emploi dans la banque et la finance en Centrafrique.",
    ],
  },
  {
    slug: "comptabilite-audit", category: "Comptabilité & Audit", label: "Comptabilité & Audit", keyword: "emploi comptable en Centrafrique",
    intro: [
      "Comptables, assistants financiers, auditeurs et contrôleurs de gestion sont recherchés par les entreprises, les cabinets et les ONG qui gèrent des financements de bailleurs.",
      "Consultez les offres d'emploi en comptabilité et audit à Bangui et en RCA.",
    ],
  },
  {
    slug: "education-formation", category: "Éducation & Formation", label: "Éducation & Formation", keyword: "emploi enseignement en Centrafrique",
    intro: [
      "Enseignants, formateurs, responsables pédagogiques et spécialistes de l'éducation en situation d'urgence : écoles privées, centres de formation et ONG recrutent en Centrafrique.",
      "Retrouvez les offres d'emploi dans l'éducation et la formation.",
    ],
  },
  {
    slug: "logistique-transport", category: "Logistique & Transport", label: "Logistique & Transport", keyword: "emploi logistique en Centrafrique",
    intro: [
      "Logisticiens, gestionnaires de stock, acheteurs, chauffeurs et responsables de flotte : la logistique est un métier clé en Centrafrique, notamment dans l'humanitaire.",
      "Consultez les offres d'emploi en logistique et transport à Bangui et en province.",
    ],
  },
  {
    slug: "btp-construction", category: "BTP & Construction", label: "BTP & Construction", keyword: "emploi BTP en Centrafrique",
    intro: [
      "Ingénieurs génie civil, conducteurs de travaux, techniciens et ouvriers qualifiés : les projets de construction, de routes et d'infrastructures recrutent en République Centrafricaine.",
      "Découvrez les offres d'emploi dans le BTP et la construction.",
    ],
  },
  {
    slug: "agriculture-elevage", category: "Agriculture & Élevage", label: "Agriculture & Élevage", keyword: "emploi agriculture en Centrafrique",
    intro: [
      "Agronomes, techniciens agricoles, vétérinaires et spécialistes de la sécurité alimentaire sont recherchés par les projets de développement rural et les ONG.",
      "Consultez les offres d'emploi en agriculture et élevage en RCA.",
    ],
  },
  {
    slug: "commerce-vente", category: "Commerce & Vente", label: "Commerce & Vente", keyword: "emploi commercial en Centrafrique",
    intro: [
      "Commerciaux, vendeurs, responsables de magasin et chargés de relation client : les entreprises de distribution et de services recrutent à Bangui.",
      "Retrouvez les offres d'emploi dans le commerce et la vente.",
    ],
  },
  {
    slug: "rh-administration", category: "RH & Administration", label: "RH & Administration", keyword: "emploi administratif en Centrafrique",
    intro: [
      "Assistants administratifs, secrétaires, chargés des ressources humaines et office managers : postes recherchés dans les entreprises, administrations et ONG.",
      "Consultez les offres d'emploi en RH et administration en Centrafrique.",
    ],
  },
  {
    slug: "communication-marketing", category: "Communication & Marketing", label: "Communication & Marketing", keyword: "emploi communication en Centrafrique",
    intro: [
      "Chargés de communication, community managers, graphistes et responsables marketing : les entreprises et organisations renforcent leur présence en ligne.",
      "Découvrez les offres d'emploi en communication et marketing.",
    ],
  },
  {
    slug: "juridique-droit", category: "Juridique & Droit", label: "Juridique & Droit", keyword: "emploi juridique en Centrafrique",
    intro: [
      "Juristes, conseillers juridiques, spécialistes des droits humains et de l'accès à la justice : cabinets, entreprises et ONG recrutent en RCA.",
      "Consultez les offres d'emploi dans le juridique et le droit.",
    ],
  },
  {
    slug: "environnement-mines", category: "Environnement & Mines", label: "Environnement & Mines", keyword: "emploi environnement en Centrafrique",
    intro: [
      "Géologues, ingénieurs des mines, spécialistes de l'environnement et de la gestion des ressources naturelles : un secteur important pour l'économie centrafricaine.",
      "Retrouvez les offres d'emploi dans l'environnement et les mines.",
    ],
  },
  {
    slug: "journalisme-medias", category: "Journalisme & Médias", label: "Journalisme & Médias", keyword: "emploi journalisme en Centrafrique",
    intro: [
      "Journalistes, animateurs radio, producteurs et techniciens des médias : radios, journaux et projets de communication recrutent en Centrafrique.",
      "Consultez les offres d'emploi dans le journalisme et les médias.",
    ],
  },
  {
    slug: "securite", category: "Sécurité", label: "Sécurité", keyword: "emploi sécurité en Centrafrique",
    intro: [
      "Agents de sécurité, superviseurs et conseillers sécurité sont recherchés par les entreprises, les sites industriels et les organisations internationales.",
      "Découvrez les offres d'emploi dans la sécurité en RCA.",
    ],
  },
  {
    slug: "restauration-hotellerie", category: "Restauration & Hôtellerie", label: "Restauration & Hôtellerie", keyword: "emploi hôtellerie en Centrafrique",
    intro: [
      "Cuisiniers, serveurs, réceptionnistes et gérants : les hôtels et restaurants de Bangui recrutent régulièrement.",
      "Consultez les offres d'emploi dans la restauration et l'hôtellerie.",
    ],
  },
  {
    slug: "services-a-la-personne", category: "Services à la personne", label: "Services à la personne", keyword: "emploi services à la personne en Centrafrique",
    intro: [
      "Aides à domicile, gardes d'enfants, agents d'entretien : retrouvez les offres d'emploi dans les services à la personne à Bangui.",
    ],
  },
  {
    slug: "tourisme", category: "Tourisme", label: "Tourisme", keyword: "emploi tourisme en Centrafrique",
    intro: [
      "Guides, agents de voyage et professionnels de l'accueil : retrouvez les offres d'emploi dans le tourisme en République Centrafricaine.",
    ],
  },
];

function sectorLanding(s: Sector): Landing {
  return {
    kind: "secteur",
    slug: s.slug,
    label: s.label,
    title: `Offres d'emploi ${s.label} en Centrafrique (Bangui, RCA)`,
    h1: `Offres d'emploi ${s.label} en Centrafrique`,
    description: `Trouvez un ${s.keyword} : offres ${s.label} à Bangui et en province, CDI, CDD et stages. Postulez en ligne gratuitement sur KTZ Emploi.`,
    intro: s.intro,
    filter: { category: s.category },
    searchHref: `/emplois?category=${enc(s.category)}`,
  };
}

// ── Types de contrat ─────────────────────────────────────────────────────────
type Contract = { slug: string; type: string; label: string; h1: string; title: string; intro: string[] };

const CONTRACTS: Contract[] = [
  {
    slug: "cdi", type: "CDI", label: "CDI",
    h1: "Offres d'emploi en CDI en Centrafrique",
    title: "Emploi CDI en Centrafrique : offres à Bangui et en RCA",
    intro: [
      "Le contrat à durée indéterminée (CDI) offre la stabilité recherchée par la plupart des candidats. Retrouvez ici toutes les offres d'emploi en CDI publiées en République Centrafricaine, à Bangui comme en province.",
    ],
  },
  {
    slug: "cdd", type: "CDD", label: "CDD",
    h1: "Offres d'emploi en CDD en Centrafrique",
    title: "Emploi CDD en Centrafrique : offres à Bangui et en RCA",
    intro: [
      "Les contrats à durée déterminée (CDD) sont très courants en Centrafrique, notamment dans les ONG et les projets de développement. Consultez les offres en CDD et postulez en ligne.",
    ],
  },
  {
    slug: "stage", type: "Stage", label: "Stage",
    h1: "Offres de stage en Centrafrique",
    title: "Stage Bangui : offres de stage en Centrafrique",
    intro: [
      "Étudiants et jeunes diplômés : un stage est souvent la meilleure porte d'entrée vers un premier emploi. Retrouvez les offres de stage à Bangui et en RCA, dans les entreprises, les ONG et les organisations internationales.",
    ],
  },
  {
    slug: "freelance", type: "Freelance", label: "Freelance & consultance",
    h1: "Missions freelance et consultance en Centrafrique",
    title: "Consultant et freelance en Centrafrique : missions à Bangui",
    intro: [
      "Consultants, formateurs et experts indépendants : retrouvez les missions de consultance et les contrats freelance proposés en République Centrafricaine.",
    ],
  },
  {
    slug: "temps-partiel", type: "Temps partiel", label: "Temps partiel",
    h1: "Offres d'emploi à temps partiel en Centrafrique",
    title: "Emploi à temps partiel en Centrafrique",
    intro: [
      "Vous cherchez un travail compatible avec vos études ou une autre activité ? Retrouvez les offres d'emploi à temps partiel à Bangui et en RCA.",
    ],
  },
];

function contractLanding(c: Contract): Landing {
  return {
    kind: "contrat",
    slug: c.slug,
    label: c.label,
    title: c.title,
    h1: c.h1,
    description: `${c.h1} : toutes les offres ${c.label} à Bangui et en République Centrafricaine. Postulez en ligne gratuitement sur KTZ Emploi.`,
    intro: c.intro,
    filter: { type: c.type },
    searchHref: `/emplois?type=${enc(c.type)}`,
  };
}

export const LANDINGS: Record<LandingKind, Landing[]> = {
  ville: CITIES.map(cityLanding),
  secteur: SECTORS.map(sectorLanding),
  contrat: CONTRACTS.map(contractLanding),
};

export function getLanding(kind: LandingKind, slug: string): Landing | undefined {
  return LANDINGS[kind].find((l) => l.slug === slug);
}

export const KIND_LABELS: Record<LandingKind, string> = {
  ville: "Par ville",
  secteur: "Par secteur",
  contrat: "Par type de contrat",
};

/** Slug de page secteur à partir du nom de catégorie du site (pour les liens internes). */
export function sectorSlugForCategory(category: string): string | undefined {
  return SECTORS.find((s) => s.category === category)?.slug;
}

/** Condition commune : offres publiées, non expirées, entreprise active. */
export function activeJobsWhere(extra: Record<string, unknown>) {
  return {
    published: true,
    company: { suspended: false },
    AND: [{ OR: [{ deadline: null }, { deadline: { gte: new Date() } }] }, extra],
  };
}
