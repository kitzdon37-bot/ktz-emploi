import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { articles } from "@/lib/articles";
import { LANDINGS, activeJobsWhere, type LandingKind } from "@/lib/seo-landing";

const BASE_URL = "https://ktzemploi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/emplois`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/entreprises`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/salaires`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/evenements`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/tarifs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/conseils`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/inscription`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    ...articles.map((a) => ({
      url: `${BASE_URL}/conseils/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];

  // Pages dynamiques — offres d'emploi publiées
  const jobs = await prisma.job.findMany({
    where: { published: true, OR: [{ deadline: null }, { deadline: { gte: new Date() } }] },
    select: { slug: true, updatedAt: true },
  });
  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/emplois/${job.slug}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Pages dynamiques — entreprises
  const companies = await prisma.company.findMany({
    select: { slug: true, updatedAt: true },
  });
  const companyPages: MetadataRoute.Sitemap = companies.map((company) => ({
    url: `${BASE_URL}/entreprises/${company.slug}`,
    lastModified: company.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Pages dynamiques — articles de blog publiés
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Pages ville / secteur / contrat : seulement celles qui ont des offres en cours
  const landingPages: MetadataRoute.Sitemap = [];
  for (const kind of Object.keys(LANDINGS) as LandingKind[]) {
    const counts = await Promise.all(
      LANDINGS[kind].map((l) => prisma.job.count({ where: activeJobsWhere(l.filter) }))
    );
    LANDINGS[kind].forEach((l, i) => {
      if (counts[i] > 0) {
        landingPages.push({
          url: `${BASE_URL}/emplois/${kind}/${l.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: kind === "ville" && l.slug === "bangui" ? 0.9 : 0.7,
        });
      }
    });
  }

  const legalPages: MetadataRoute.Sitemap = ["contact", "mentions-legales", "confidentialite", "cgu"].map((p) => ({
    url: `${BASE_URL}/${p}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...landingPages, ...jobPages, ...companyPages, ...blogPages, ...legalPages];
}
