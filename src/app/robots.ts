import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/tableau-de-bord/", "/api/"],
    },
    sitemap: "https://ktzemploi.com/sitemap.xml",
  };
}
