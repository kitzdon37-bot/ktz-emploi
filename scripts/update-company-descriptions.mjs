import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DESCRIPTIONS = {
  "ENERCA": {
    description: `L'Énergie Centrafricaine (ENERCA) est la société nationale chargée de la production, du transport et de la distribution de l'énergie électrique en République Centrafricaine. Fondée pour répondre aux besoins énergétiques croissants du pays, ENERCA joue un rôle stratégique dans le développement économique et social de la RCA.

Avec un réseau couvrant Bangui et plusieurs villes de l'intérieur du pays, ENERCA gère des centrales hydroélectriques et thermiques pour assurer l'alimentation en électricité de milliers de foyers, d'entreprises et d'institutions publiques.

L'entreprise s'inscrit dans une dynamique de modernisation de ses infrastructures et d'extension de son réseau de distribution, avec l'ambition d'améliorer le taux d'accès à l'électricité dans toutes les préfectures du pays. ENERCA recrute régulièrement des ingénieurs, techniciens et agents administratifs pour renforcer ses équipes et relever les défis de la transition énergétique en Afrique centrale.`,
    size: "200-500 employés",
    sector: "Énergie & Environnement",
  },

  "SODECA": {
    description: `La Société de Distribution d'Eau en Centrafrique (SODECA) est l'opérateur public en charge de la production, du traitement et de la distribution de l'eau potable sur l'ensemble du territoire centrafricain. Depuis sa création, SODECA œuvre pour garantir l'accès à une eau de qualité à la population de Bangui et des villes de province.

Disposant d'infrastructures de captage, de traitement et de distribution, SODECA gère un réseau hydraulique complexe et intervient également dans la maintenance et l'extension des conduites d'eau. L'entreprise est engagée dans des projets de réhabilitation de ses installations pour faire face à la croissance démographique et améliorer la continuité du service.

SODECA est un employeur majeur en RCA, offrant des opportunités dans les domaines de l'ingénierie hydraulique, de la chimie des eaux, de la maintenance industrielle et de la gestion administrative. Travailler à SODECA, c'est contribuer directement à la santé et au bien-être de la population centrafricaine.`,
    size: "100-200 employés",
    sector: "Eau & Assainissement",
  },

  "Orange Centrafrique": {
    description: `Orange Centrafrique est le leader des télécommunications en République Centrafricaine, filiale du groupe Orange, l'un des premiers opérateurs de télécommunications mondiaux présent dans 26 pays en Afrique et au Moyen-Orient.

Implanté en RCA depuis de nombreuses années, Orange Centrafrique offre des services de téléphonie mobile, d'internet mobile et de mobile money (Orange Money) à des centaines de milliers de clients sur tout le territoire national. Avec le réseau le plus étendu du pays, Orange Centrafrique continue d'investir dans la modernisation de ses infrastructures — déploiement de la 4G, extension de la couverture réseau dans les zones rurales — pour connecter toujours plus de Centrafricains.

Orange Money, le service de paiement mobile d'Orange Centrafrique, est devenu un outil incontournable pour les transactions financières quotidiennes des centrafricains. L'entreprise emploie plus de 300 collaborateurs directs et des milliers d'agents distributeurs à travers le pays, et offre des opportunités de carrière dans les domaines de la technologie, du commerce, du marketing et de la finance.`,
    size: "300-500 employés",
    sector: "Télécommunications",
  },

  "BSCA": {
    description: `La Banque de Solidarité Centrafricaine (BSCA) est une institution financière engagée dans le financement du développement économique de la République Centrafricaine. Dédiée au soutien des PME, des entrepreneurs et des ménages centrafricains, la BSCA propose une gamme complète de produits et services financiers adaptés aux réalités locales.

La BSCA accompagne les porteurs de projets dans les secteurs de l'agriculture, du commerce, de l'artisanat et des services, en leur offrant des crédits accessibles, des comptes d'épargne et des solutions de financement sur mesure. L'institution s'appuie sur un réseau d'agences à Bangui et dans les principales villes du pays pour être au plus proche de ses clients.

Soucieuse de l'inclusion financière, la BSCA développe des produits spécialement adaptés aux populations non bancarisées et aux acteurs de l'économie informelle. Elle joue ainsi un rôle clé dans la structuration du tissu économique centrafricain et dans la réduction de la pauvreté.`,
    size: "100-200 employés",
    sector: "Banque & Finance",
  },

  "Ministère de la Santé": {
    description: `Le Ministère de la Santé et de la Population de la République Centrafricaine est l'institution gouvernementale chargée de définir, mettre en œuvre et évaluer la politique nationale de santé publique. Il a pour mission d'assurer l'accès aux soins de santé de qualité pour l'ensemble de la population centrafricaine, sur tout le territoire national.

Le Ministère supervise un réseau de structures sanitaires comprenant des hôpitaux nationaux, des hôpitaux préfectoraux, des centres de santé et des postes de santé répartis dans toutes les préfectures du pays. Il coordonne également les programmes nationaux de santé (lutte contre le paludisme, la tuberculose, le VIH/SIDA, la malnutrition) et les interventions des partenaires internationaux (OMS, UNICEF, MSF, etc.).

Le Ministère recrute régulièrement des médecins, infirmiers, sages-femmes, pharmaciens, laborantins, agents de santé communautaires et personnels administratifs pour renforcer les capacités du système de santé centrafricain. Rejoindre le Ministère de la Santé, c'est s'engager pour la vie et le bien-être de millions de Centrafricains.`,
    size: "1000+ employés",
    sector: "Santé & Médical",
  },

  "Hôtel Ledger Plaza Bangui": {
    description: `L'Hôtel Ledger Plaza Bangui est le fleuron de l'hôtellerie de luxe en République Centrafricaine. Situé au cœur de Bangui, l'hôtel incarne l'excellence de l'accueil et du service à la clientèle dans un cadre élégant et moderne.

Avec ses chambres et suites luxueusement aménagées, ses équipements haut de gamme — piscine, restaurants gastronomiques, salles de conférence, centre de bien-être — le Ledger Plaza Bangui est la référence pour les voyageurs d'affaires, les diplomates et les touristes internationaux en RCA. L'hôtel accueille également des événements d'envergure : conférences internationales, réceptions officielles, séminaires d'entreprises.

Membre du réseau Ledger Hotels & Resorts, l'établissement applique les standards internationaux de l'hôtellerie 5 étoiles tout en intégrant le charme et l'authenticité de la culture centrafricaine. L'hôtel emploie une équipe de professionnels passionnés dans les métiers de la restauration, de l'hébergement, de l'événementiel et de la gestion hôtelière.`,
    size: "50-100 employés",
    sector: "Hôtellerie & Tourisme",
  },

  "Cabinet Comptable FIDUCIA": {
    description: `Le Cabinet Comptable FIDUCIA est un cabinet d'expertise comptable, d'audit et de conseil de référence en République Centrafricaine. Fondé par des professionnels expérimentés, FIDUCIA accompagne les entreprises, les ONG, les institutions publiques et les entrepreneurs individuels dans la gestion de leurs obligations comptables, fiscales et financières.

Le cabinet propose une gamme complète de services : tenue de comptabilité, établissement des bilans et comptes de résultat, déclarations fiscales, audit légal et contractuel, commissariat aux comptes, conseils en création d'entreprise et en gestion financière. FIDUCIA est reconnu pour la qualité et la rigueur de ses travaux, ainsi que pour son approche personnalisée de chaque dossier client.

Fort d'une équipe de comptables, d'auditeurs et de juristes qualifiés, le cabinet FIDUCIA est un partenaire stratégique pour les entreprises qui souhaitent se développer en toute conformité avec les normes OHADA et la législation fiscale centrafricaine.`,
    size: "10-50 employés",
    sector: "Comptabilité & Audit",
  },

  "Clinique Sainte-Famille": {
    description: `La Clinique Sainte-Famille est l'un des établissements de santé privés les plus réputés de Bangui. Fondée sur des valeurs humaines et chrétiennes, la clinique offre des soins médicaux de qualité dans un environnement bienveillant et respectueux de chaque patient.

La Clinique Sainte-Famille dispose de plusieurs services spécialisés : médecine générale, pédiatrie, gynécologie-obstétrique, chirurgie, urgences, imagerie médicale et laboratoire d'analyses biologiques. Avec un plateau technique moderne et une équipe médicale qualifiée, la clinique prend en charge des pathologies variées et assure le suivi des grossesses et des accouchements dans les meilleures conditions de sécurité.

Engagée dans l'amélioration continue de ses services, la Clinique Sainte-Famille investit régulièrement dans la formation de son personnel et dans le renouvellement de ses équipements médicaux. Elle recrute des médecins spécialistes, des infirmiers, des sages-femmes, des techniciens de laboratoire et du personnel administratif pour renforcer son équipe.`,
    size: "50-100 employés",
    sector: "Santé & Médical",
  },

  "ACAP (Agence Centrafricaine de Presse)": {
    description: `L'Agence Centrafricaine de Presse (ACAP) est l'agence de presse officielle de la République Centrafricaine. Organe public d'information, l'ACAP a pour mission de collecter, traiter et diffuser l'information nationale et internationale à destination des médias, des institutions et du grand public centrafricain.

Présente à Bangui et dans les principales préfectures du pays, l'ACAP assure une couverture de l'actualité politique, économique, sociale et culturelle de la RCA. Elle produit des dépêches, des reportages et des communiqués officiels qui alimentent les rédactions des médias publics et privés du pays. L'agence assure également la diffusion des communiqués du gouvernement et des institutions de la République.

À l'ère du numérique, l'ACAP se modernise et développe ses capacités de diffusion en ligne pour toucher un public plus large, y compris la diaspora centrafricaine. Elle offre des opportunités de carrière pour des journalistes, des rédacteurs, des photographes, des techniciens et des professionnels de la communication.`,
    size: "50-100 employés",
    sector: "Médias & Communication",
  },

  "BTP Centrafrique SARL": {
    description: `BTP Centrafrique SARL est une entreprise de construction et de travaux publics opérant en République Centrafricaine. Spécialisée dans les travaux de génie civil, de bâtiment et d'infrastructures, BTP Centrafrique intervient sur des chantiers d'envergure à Bangui et dans les provinces.

L'entreprise réalise des projets variés : construction de bâtiments résidentiels et commerciaux, réhabilitation de routes et de ponts, travaux d'assainissement, construction d'écoles et de centres de santé financés par l'État ou les partenaires au développement. BTP Centrafrique est reconnue pour la qualité de ses réalisations et le respect des délais contractuels.

Dotée d'un parc matériel important (engins de terrassement, camions, centrales à béton) et d'une équipe d'ingénieurs, de conducteurs de travaux, de chefs de chantier et d'ouvriers qualifiés, BTP Centrafrique contribue activement à la reconstruction et au développement des infrastructures du pays. L'entreprise offre des opportunités de carrière dans les métiers du bâtiment et des travaux publics.`,
    size: "50-200 employés",
    sector: "BTP & Construction",
  },

  "Pharmacie du Marché Central": {
    description: `La Pharmacie du Marché Central est l'une des officines pharmaceutiques les plus connues et les plus fréquentées de Bangui. Idéalement située au cœur de la capitale centrafricaine, elle met à la disposition de la population un large stock de médicaments essentiels, de produits parapharmaceutiques, de compléments alimentaires et de dispositifs médicaux.

Tenue par des pharmaciens diplômés et une équipe de préparateurs en pharmacie expérimentés, la Pharmacie du Marché Central assure la délivrance des médicaments sur ordonnance, le conseil pharmaceutique et l'orientation des patients vers les structures de soins adaptées. L'officine s'engage à proposer des médicaments de qualité et authentifiés, dans le respect des bonnes pratiques pharmaceutiques.

La pharmacie collabore avec les médecins, cliniques et hôpitaux de Bangui pour assurer la disponibilité des médicaments essentiels et des traitements spécifiques. Elle recrute régulièrement des pharmaciens, des préparateurs en pharmacie et du personnel administratif pour répondre aux besoins croissants de sa clientèle.`,
    size: "10-30 employés",
    sector: "Santé & Médical",
  },

  "Ecobank RCA": {
    description: `Ecobank RCA est la filiale centrafricaine d'Ecobank Transnational Incorporated (ETI), le premier groupe bancaire panafricain indépendant. Présent dans 35 pays africains, Ecobank est la banque qui connecte l'Afrique avec le reste du monde, offrant des services bancaires intégrés aux particuliers, aux entreprises et aux institutions.

En République Centrafricaine depuis 2010, Ecobank s'est imposé comme un acteur incontournable du secteur financier. La banque propose une gamme complète de produits et services : comptes courants et d'épargne, crédits immobiliers et à la consommation, financement des PME, transferts d'argent internationaux, trade finance et services de trésorerie pour les grandes entreprises.

Avec son réseau d'agences à Bangui et ses canaux digitaux (Ecobank Mobile, EcobankPay), Ecobank RCA facilite l'accès aux services financiers pour tous les Centrafricains. La banque joue également un rôle clé dans le financement de l'économie nationale, en soutenant les secteurs agricole, commercial et industriel. Elle offre des perspectives de carrière stimulantes dans un environnement international et multiculturel.`,
    size: "100-200 employés",
    sector: "Banque & Finance",
  },

  "OCDH Centrafrique": {
    description: `L'Organisation Centrafricaine des Droits de l'Homme (OCDH) est une organisation de la société civile centrafricaine fondée pour défendre, promouvoir et protéger les droits humains en République Centrafricaine. Depuis sa création, l'OCDH s'est imposée comme une voix indépendante et crédible dans le paysage des droits humains en RCA.

L'OCDH mène des activités de documentation des violations des droits humains, de plaidoyer auprès des autorités nationales et internationales, de sensibilisation des populations à leurs droits et d'accompagnement des victimes de violations. Elle intervient également dans des programmes de cohésion sociale, de protection des groupes vulnérables (femmes, enfants, personnes déplacées) et de promotion de la justice transitionnelle.

Financée par des bailleurs institutionnels internationaux (Union Européenne, Nations Unies, fondations internationales), l'OCDH met en œuvre des projets dans plusieurs préfectures du pays. Elle collabore étroitement avec les Nations Unies (MINUSCA, HCDH), les ONG internationales et les organisations sœurs de la région. L'OCDH offre des opportunités professionnelles pour des juristes, des défenseurs des droits humains, des chargés de projet et des communicants engagés dans la cause des droits humains en Afrique centrale.`,
    size: "20-50 employés",
    sector: "ONG & Humanitaire",
  },
};

async function main() {
  let updated = 0;

  for (const [name, data] of Object.entries(DESCRIPTIONS)) {
    const company = await prisma.company.findFirst({ where: { name } });
    if (!company) {
      console.log(`✗ Entreprise introuvable : ${name}`);
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        description: data.description,
        size: data.size,
        sector: data.sector,
      },
    });

    console.log(`✓ ${name}`);
    updated++;
  }

  console.log(`\n✅ ${updated} entreprise(s) mises à jour.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
