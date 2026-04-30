import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const companies = [
  // TÉLÉCOMMUNICATIONS
  {
    email: "rh@orange-centrafrique.cf",
    name: "Orange Centrafrique",
    slug: "orange-centrafrique",
    sector: "Informatique & Télécoms",
    size: "Grande",
    location: "Bangui",
    website: "https://www.orange.cf",
    phone: "+236 75 72 72 72",
    foundedYear: 1996,
    description:
      "Orange Centrafrique est le premier opérateur de téléphonie mobile du pays, offrant des services 2G, 3G et 4G ainsi que le service de paiement mobile Orange Money. Avec une couverture nationale et plus de 2 millions d'abonnés, Orange est le principal acteur des télécommunications en RCA.",
    verified: true,
    superRecruiter: true,
  },
  {
    email: "recrutement@telecel-centrafrique.cf",
    name: "Telecel Centrafrique",
    slug: "telecel-centrafrique",
    sector: "Informatique & Télécoms",
    size: "Grande",
    location: "Bangui",
    foundedYear: 1999,
    description:
      "Telecel Centrafrique est l'un des principaux opérateurs de téléphonie mobile de la République Centrafricaine, couvrant environ 48 % du marché. L'entreprise propose des forfaits voix, SMS et data, ainsi que des services de mobile money pour faciliter les transactions financières.",
    verified: true,
  },
  {
    email: "rh@moov-africa.cf",
    name: "Moov Africa Centrafrique",
    slug: "moov-africa-centrafrique",
    sector: "Informatique & Télécoms",
    size: "Grande",
    location: "Bangui",
    website: "https://www.moov-africa.com",
    description:
      "Moov Africa (anciennement Atlantique Télécom) est un opérateur panafricain de téléphonie mobile présent en République Centrafricaine. Il propose des services mobiles abordables et des solutions de paiement mobile pour les populations locales.",
    verified: true,
  },
  {
    email: "rh@socatel.cf",
    name: "Socatel",
    slug: "socatel-centrafrique",
    sector: "Informatique & Télécoms",
    size: "Grande",
    location: "Bangui",
    phone: "+236 21 61 40 00",
    foundedYear: 1990,
    description:
      "La Société Centrafricaine de Télécommunications (SOCATEL) est l'opérateur historique des télécommunications fixes en RCA. Elle assure la fourniture d'accès Internet, de lignes fixes et de liaisons louées pour les entreprises et institutions.",
    verified: true,
  },

  // BANQUE & FINANCE
  {
    email: "recrutement@bpmc-rca.cf",
    name: "Banque Populaire Maroco-Centrafricaine",
    slug: "bpmc-centrafrique",
    sector: "Banque & Finance",
    size: "Grande",
    location: "Bangui",
    phone: "+236 21 61 08 00",
    foundedYear: 1991,
    description:
      "La Banque Populaire Maroco-Centrafricaine (BPMC) est un établissement bancaire issu d'un partenariat entre la RCA et le Maroc. Elle finance des projets publics et privés, et propose des services bancaires aux particuliers, entreprises et institutions de l'État centrafricain.",
    verified: true,
  },
  {
    email: "rh@bsic-centrafrique.cf",
    name: "BSIC Centrafrique",
    slug: "bsic-centrafrique",
    sector: "Banque & Finance",
    size: "Grande",
    location: "Bangui",
    website: "https://www.bsic-group.com",
    description:
      "La Banque Saharienne pour l'Investissement et le Commerce (BSIC) est une banque panafricaine présente en République Centrafricaine. Elle offre une gamme complète de produits et services bancaires aux particuliers, PME et grandes entreprises.",
    verified: true,
  },

  // ÉNERGIE & EAU
  {
    email: "rh@enerca.cf",
    name: "ENERCA",
    slug: "enerca-centrafrique",
    sector: "Environnement & Mines",
    size: "Grande",
    location: "Bangui",
    website: "http://enerca-rca.com",
    phone: "+236 21 61 30 55",
    foundedYear: 1967,
    description:
      "L'Énergie Centrafricaine (ENERCA) est la société nationale d'électricité de la République Centrafricaine. Elle assure la production, le transport et la distribution de l'électricité à travers le pays, principalement depuis les centrales hydroélectriques de Boali et les groupes thermiques de Bangui.",
    verified: true,
  },
  {
    email: "rh@sodeca.cf",
    name: "SODECA",
    slug: "sodeca-centrafrique",
    sector: "Environnement & Mines",
    size: "Grande",
    location: "Bangui",
    phone: "+236 21 61 21 41",
    foundedYear: 1975,
    description:
      "La Société de Distribution d'Eau en Centrafrique (SODECA) est la société nationale responsable de la production et de la distribution d'eau potable en RCA. Elle dessert environ 14 000 abonnés à Bangui et dans plusieurs villes de province, couvrant 23 % de la population centrafricaine.",
    verified: true,
  },

  // ASSURANCES
  {
    email: "rh@ascoma-centrafrique.cf",
    name: "ASCOMA Centrafrique",
    slug: "ascoma-centrafrique",
    sector: "Banque & Finance",
    size: "PME",
    location: "Bangui",
    website: "https://ascoma.com/ascoma-centrafrique",
    foundedYear: 1969,
    description:
      "ASCOMA Centrafrique est un courtier d'assurance et de réassurance implanté à Bangui depuis 1969. Membre du réseau ASCOMA International, il propose des solutions d'assurance adaptées aux besoins des entreprises, des institutions et des particuliers en RCA.",
    verified: true,
  },
  {
    email: "recrutement@sunu-assurances.cf",
    name: "SUNU Assurances Centrafrique",
    slug: "sunu-assurances-centrafrique",
    sector: "Banque & Finance",
    size: "PME",
    location: "Bangui",
    website: "https://www.sunu-group.com",
    description:
      "SUNU Assurances est une compagnie d'assurance panafricaine présente en République Centrafricaine depuis plus de 50 ans. Elle propose des produits IARD (Incendie, Accidents, Risques Divers) aux particuliers et entreprises centrafricains.",
    verified: true,
  },
  {
    email: "rh@oca-rca.cf",
    name: "OCA – Omnium Centrafricain d'Assurances",
    slug: "oca-centrafrique",
    sector: "Banque & Finance",
    size: "PME",
    location: "Bangui",
    website: "https://www.oca-rca.com",
    description:
      "L'Omnium Centrafricain d'Assurances (OCA) est une compagnie d'assurance de droit centrafricain qui propose des produits d'assurance vie et non-vie. Elle accompagne les particuliers et entreprises dans la gestion de leurs risques à travers un réseau d'agences à Bangui.",
    verified: true,
  },

  // SANTÉ
  {
    email: "rh@clinique-amitie-bangui.cf",
    name: "Clinique de l'Amitié",
    slug: "clinique-amitie-bangui",
    sector: "Médecine & Santé",
    size: "PME",
    location: "Bangui",
    phone: "+236 75 50 10 00",
    description:
      "La Clinique de l'Amitié est l'un des établissements de santé privés les plus réputés de Bangui. Elle offre des services spécialisés en cardiologie, orthopédie, chirurgie générale, gynécologie-obstétrique et médecine interne. Dotée de matériel médical moderne, elle accueille des patients de toute la RCA et des pays voisins.",
    verified: true,
  },
  {
    email: "rh@shalina-healthcare.cf",
    name: "Shalina Healthcare RCA",
    slug: "shalina-healthcare-rca",
    sector: "Médecine & Santé",
    size: "PME",
    location: "Bangui",
    website: "https://www.shalina.com",
    foundedYear: 2008,
    description:
      "Shalina Healthcare est une entreprise pharmaceutique panafricaine présente en RCA depuis 2008. Elle distribue plus de 270 produits pharmaceutiques essentiels — médicaments génériques, antipaludéens, antibiotiques — dans les pharmacies, hôpitaux et cliniques du pays à des prix accessibles.",
    verified: true,
  },
  {
    email: "rh@pasteur-bangui.cf",
    name: "Institut Pasteur de Bangui",
    slug: "institut-pasteur-bangui",
    sector: "Médecine & Santé",
    size: "Grande",
    location: "Bangui",
    phone: "+236 21 61 41 22",
    foundedYear: 1961,
    description:
      "L'Institut Pasteur de Bangui est un centre de référence en santé publique et recherche biomédicale en République Centrafricaine. Il assure la surveillance épidémiologique, la recherche sur les maladies infectieuses (paludisme, VIH, hépatites), la formation du personnel de santé et le diagnostic de laboratoire.",
    verified: true,
  },

  // SÉCURITÉ
  {
    email: "rh@bcags.cf",
    name: "BCAGS – Gardiennage et Surveillance",
    slug: "bcags-centrafrique",
    sector: "Sécurité",
    size: "PME",
    location: "Bangui",
    website: "https://bcags.fr",
    foundedYear: 2001,
    description:
      "Le Bureau Centrafricain de Gardiennage et de Surveillance (BCAGS) est la principale entreprise de sécurité privée de la RCA avec plus de 1 100 agents. Forte de plus de 20 ans d'expérience, elle assure la protection des ambassades, organisations internationales, entreprises et résidences privées à Bangui et en province.",
    verified: true,
  },

  // BTP & CONSTRUCTION
  {
    email: "rh@semem-centrafrique.cf",
    name: "SEMEM Centrafrique",
    slug: "semem-centrafrique",
    sector: "BTP & Construction",
    size: "PME",
    location: "Bangui",
    foundedYear: 2016,
    description:
      "SEMEM Centrafrique est un acteur majeur dans l'importation et la distribution de matériaux de construction en République Centrafricaine. L'entreprise propose du ciment, du fer à béton, des carreaux, du bois et d'autres matériaux aux professionnels du BTP et aux particuliers souhaitant construire ou rénover.",
    verified: false,
  },

  // LOGISTIQUE & TRANSPORT
  {
    email: "rh@mercure-logistics.cf",
    name: "Mercure Logistics Centrafrique",
    slug: "mercure-logistics-centrafrique",
    sector: "Logistique & Transport",
    size: "PME",
    location: "Bangui",
    description:
      "Mercure Logistics est une entreprise de logistique spécialisée dans la manutention portuaire, le stockage en entrepôt et la distribution de marchandises en République Centrafricaine. Elle intervient sur le port fluvial de Bangui et assure le transport de fret pour des clients institutionnels et privés.",
    verified: false,
  },
  {
    email: "rh@agl-centrafrique.cf",
    name: "AGL Centrafrique",
    slug: "agl-centrafrique",
    sector: "Logistique & Transport",
    size: "Grande",
    location: "Bangui",
    website: "https://www.aglgroup.com",
    description:
      "AGL (Africa Global Logistics), anciennement Bolloré Transport & Logistics, est le leader africain de la logistique intégrée. En RCA, AGL gère les opérations portuaires, le transit douanier, l'entreposage et le transport terrestre, servant les grandes entreprises, ONG et agences onusiennes présentes dans le pays.",
    verified: true,
    superRecruiter: true,
  },

  // HÔTELLERIE
  {
    email: "rh@ledger-plaza-bangui.cf",
    name: "Ledger Plaza Bangui",
    slug: "ledger-plaza-bangui",
    sector: "Restauration & Hôtellerie",
    size: "PME",
    location: "Bangui",
    website: "https://www.ledgerhotels.com",
    description:
      "Le Ledger Plaza Bangui est l'hôtel de luxe de référence en République Centrafricaine. Situé au cœur de Bangui, il propose des chambres et suites haut de gamme, un restaurant gastronomique, une piscine, un centre de fitness et des salles de conférence pour les événements d'affaires. Il accueille diplomates, expatriés et hommes d'affaires.",
    verified: true,
  },
  {
    email: "rh@oubangui-hotel.cf",
    name: "Hôtel Oubangui",
    slug: "hotel-oubangui-bangui",
    sector: "Restauration & Hôtellerie",
    size: "PME",
    location: "Bangui",
    description:
      "L'Hôtel Oubangui est un établissement de prestige situé sur les rives du fleuve Oubangui à Bangui. Il offre des chambres confortables avec vue sur le fleuve, un restaurant, un bar-terrasse et des services de qualité. L'hôtel est un lieu de rencontre privilégié pour les hommes d'affaires et visiteurs de marque.",
    verified: true,
  },

  // MÉDIAS
  {
    email: "rh@radiondekeluka.org",
    name: "Radio Ndeke Luka",
    slug: "radio-ndeke-luka",
    sector: "Journalisme & Médias",
    size: "PME",
    location: "Bangui",
    website: "https://www.radiondekeluka.org",
    foundedYear: 2000,
    description:
      "Radio Ndeke Luka (l'Oiseau de Paix en Sango) est une radio indépendante centrafricaine reconnue pour la qualité et l'impartialité de son information. Diffusant en Sango, français et plusieurs langues locales, elle est l'une des principales sources d'information pour les populations centrafricaines sur l'actualité nationale et internationale.",
    verified: true,
  },

  // ÉDUCATION
  {
    email: "rh@esgnt.net",
    name: "ESGNT – École Supérieure de Gestion",
    slug: "esgnt-bangui",
    sector: "Éducation & Formation",
    size: "PME",
    location: "Bangui",
    website: "https://www.esgnt.net",
    description:
      "L'École Supérieure de Gestion et des Nouvelles Technologies (ESGNT) est une institution d'enseignement supérieur privée accréditée en République Centrafricaine. Elle propose des formations de niveau Licence et Master dans les filières Gestion, Finance, Commerce international, Informatique et Management. L'ESGNT forme les cadres de demain pour le secteur privé centrafricain.",
    verified: true,
  },
  {
    email: "rh@newtech-bangui.cf",
    name: "NewTech Institut Bangui",
    slug: "newtech-institut-bangui",
    sector: "Éducation & Formation",
    size: "PME",
    location: "Bangui",
    description:
      "NewTech Institut est une université privée pionnière dans les nouvelles technologies en République Centrafricaine. Fondée dans les années 1990, elle a inauguré un nouveau campus en 2024 et propose des formations en informatique, réseaux, cybersécurité, génie logiciel et électronique, répondant aux besoins croissants du marché numérique centrafricain.",
    verified: false,
  },

  // AGRIBUSINESS
  {
    email: "rh@palmedor-rca.cf",
    name: "Palme d'Or – Al Sahely RCA",
    slug: "palmedor-al-sahely-rca",
    sector: "Agriculture & Élevage",
    size: "Grande",
    location: "Bangui",
    foundedYear: 1985,
    description:
      "Palme d'Or, groupe Al Sahely, est l'une des grandes entreprises agro-industrielles de la République Centrafricaine. Elle est impliquée dans la transformation et la distribution de produits alimentaires (huile de palme, savon, farine), contribuant significativement à la création d'emplois et à la sécurité alimentaire du pays.",
    verified: true,
  },

  // INFORMATIQUE
  {
    email: "rh@rcasoft.cf",
    name: "RCA Soft",
    slug: "rca-soft-bangui",
    sector: "Informatique & Télécoms",
    size: "TPE",
    location: "Bangui",
    description:
      "RCA Soft est une entreprise centrafricaine spécialisée dans le développement de logiciels sur mesure, la maintenance informatique et le conseil en systèmes d'information. Elle accompagne les PME, administrations et ONG de Bangui dans leur transformation numérique.",
    verified: false,
  },
  {
    email: "rh@societe-infotech.cf",
    name: "Société InfoTech RCA",
    slug: "societe-infotech-rca",
    sector: "Informatique & Télécoms",
    size: "TPE",
    location: "Bangui",
    description:
      "Société InfoTech RCA est une entreprise informatique centrafricaine proposant des services d'automatisation, de formation professionnelle en informatique et de conseil en transformation digitale. Elle forme chaque année des centaines de professionnels centrafricains aux outils numériques.",
    verified: false,
  },

  // HUMANITAIRE
  {
    email: "rh@acted-rca.org",
    name: "ACTED Centrafrique",
    slug: "acted-centrafrique",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.acted.org",
    foundedYear: 1993,
    description:
      "ACTED (Agence d'aide à la Coopération Technique et au Développement) est une ONG humanitaire française présente en République Centrafricaine depuis de nombreuses années. Elle intervient dans les secteurs de la sécurité alimentaire, l'abri, l'eau et l'assainissement, la protection civile et le redressement économique des populations affectées par les crises.",
    verified: true,
    superRecruiter: true,
  },
  {
    email: "rh@premierurgence-rca.org",
    name: "Première Urgence Internationale RCA",
    slug: "premiere-urgence-internationale-rca",
    sector: "Humanitaire & ONG",
    size: "Grande",
    location: "Bangui",
    website: "https://www.premiere-urgence.org",
    description:
      "Première Urgence Internationale (PUI) est une ONG médicale et humanitaire présente en RCA. Elle intervient dans les domaines de la santé, la nutrition, la sécurité alimentaire et la santé mentale en faveur des populations déplacées et vulnérables. PUI travaille dans plusieurs préfectures centrafricaines en coordination avec les autorités sanitaires.",
    verified: true,
  },
];

async function main() {
  console.log("🌱 Ajout des entreprises centrafricaines réelles...\n");

  const employerPw = await bcrypt.hash("employer123", 12);
  let added = 0;
  let skipped = 0;

  for (const c of companies) {
    const existing = await prisma.company.findUnique({ where: { slug: c.slug } });
    if (existing) {
      console.log(`⏭  Ignoré (déjà présent) : ${c.name}`);
      skipped++;
      continue;
    }

    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: `RH ${c.name}`,
        password: employerPw,
        role: "EMPLOYER",
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
        description: c.description,
        website: c.website ?? null,
        email: c.email,
        phone: c.phone ?? null,
        foundedYear: c.foundedYear ?? null,
        verified: c.verified ?? false,
        superRecruiter: c.superRecruiter ?? false,
      },
    });

    console.log(`✅ Ajouté : ${c.name} (${c.sector})`);
    added++;
  }

  console.log(`\n🎉 Terminé ! ${added} entreprises ajoutées, ${skipped} ignorées.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
