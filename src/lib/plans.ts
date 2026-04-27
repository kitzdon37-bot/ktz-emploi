export const PLANS = {
  FREE: {
    name: "Gratuit",
    price: 0,
    maxJobs: 1,
    jobDuration: 15, // jours
    cvtheque: false,
    featured: false,
    templates: false,
    analytics: false,
    badge: null,
    color: "gray",
    description: "Pour découvrir la plateforme",
    features: [
      "1 offre active",
      "Visible 15 jours",
      "Tableau de bord basique",
    ],
    limits: [
      "Pas d'accès CVthèque",
      "Pas d'offres à la une",
      "Pas d'analytics",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 50000,
    maxJobs: 5,
    jobDuration: 30,
    cvtheque: true,
    featured: false,
    templates: true,
    analytics: true,
    badge: "Starter",
    color: "blue",
    description: "Pour les PME et ONG",
    features: [
      "5 offres actives",
      "Visible 30 jours",
      "Accès CVthèque",
      "Modèles d'offres",
      "Analytics",
    ],
    limits: [
      "Pas d'offres à la une",
    ],
  },
  PRO: {
    name: "Pro",
    price: 80000,
    maxJobs: 999,
    jobDuration: 60,
    cvtheque: true,
    featured: true,
    templates: true,
    analytics: true,
    badge: "Super Recruteur",
    color: "orange",
    description: "Pour les grandes entreprises",
    features: [
      "Offres illimitées",
      "Visible 60 jours",
      "Accès CVthèque complet",
      "Offres à la une (×2/mois)",
      "Analytics avancés",
      "Badge Super Recruteur",
      "Support prioritaire",
    ],
    limits: [],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
  return PLANS[(plan as PlanKey) ?? "FREE"] ?? PLANS.FREE;
}
