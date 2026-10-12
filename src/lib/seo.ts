// Référencement : informations du site et données structurées (schema.org) lues par Google
import type { Metadata } from "next";

export const SITE_URL = "https://ktzemploi.com";
export const SITE_NAME = "KTZ Emploi";

export const FOUNDER = {
  name: "Donald KITEZE",
  // Variantes sous lesquelles on peut chercher le fondateur
  alternateNames: ["KITEZE Donald", "Donald Kiteze", "Kiteze Donald"],
  jobTitle: "Fondateur de KTZ Emploi",
  description:
    "Ingénieur en Microélectronique, Télécommunications et Réseaux, entrepreneur centrafricain, fondateur de KTZ Emploi, la plateforme d'emploi de la République Centrafricaine.",
  image: `${SITE_URL}/photo_profil.png`,
  url: `${SITE_URL}/a-propos`,
  // Ajouter ici les profils publics du fondateur (LinkedIn, Facebook…) : Google relie ainsi les résultats
  sameAs: [] as string[],
};

/** Métadonnées d'une page publique, avec son adresse canonique (unique pour chaque page). */
export function pageMetadata(opts: {
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
  /** Titre affiché tel quel, sans le suffixe « | KTZ Emploi » (page d'accueil) */
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${SITE_URL}${opts.path === "/" ? "" : opts.path}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
    ...(opts.noIndex && { robots: { index: false, follow: true } }),
  };
}

export function founderSchema() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/a-propos#fondateur`,
    name: FOUNDER.name,
    alternateName: FOUNDER.alternateNames,
    givenName: "Donald",
    familyName: "KITEZE",
    jobTitle: FOUNDER.jobTitle,
    description: FOUNDER.description,
    image: FOUNDER.image,
    url: FOUNDER.url,
    nationality: { "@type": "Country", name: "République Centrafricaine" },
    worksFor: { "@id": `${SITE_URL}/#organisation` },
    ...(FOUNDER.sameAs.length > 0 && { sameAs: FOUNDER.sameAs }),
  };
}

/** Organisation + site web (+ fondateur) : présent sur toutes les pages. */
export function siteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organisation`,
        name: SITE_NAME,
        alternateName: ["KTZEmploi", "KTZ", "ktzemploi.com"],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon-512.png`,
        description:
          "KTZ Emploi est la plateforme d'emploi de la République Centrafricaine : offres d'emploi à Bangui et partout en RCA, CVthèque et recrutement en ligne.",
        foundingLocation: { "@type": "Place", name: "Bangui, République Centrafricaine" },
        areaServed: { "@type": "Country", name: "République Centrafricaine" },
        founder: { "@id": `${SITE_URL}/a-propos#fondateur` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#site`,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: "fr",
        publisher: { "@id": `${SITE_URL}/#organisation` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/emplois?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      founderSchema(),
    ],
  };
}

// Types de contrat du site → valeurs reconnues par Google for Jobs
export function googleEmploymentType(type: string): string {
  const map: Record<string, string> = {
    CDI: "FULL_TIME",
    CDD: "TEMPORARY",
    Stage: "INTERN",
    Alternance: "INTERN",
    Freelance: "CONTRACTOR",
    "Temps partiel": "PART_TIME",
    "Bénévolat": "VOLUNTEER",
  };
  return map[type] ?? "OTHER";
}

/** Sérialise un objet JSON-LD sans risque d'injection HTML. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
