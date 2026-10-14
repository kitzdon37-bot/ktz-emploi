import JobLandingPage, { landingMetadata } from "@/components/seo/JobLandingPage";
import { LANDINGS } from "@/lib/seo-landing";

// Liste des offres rafraîchie toutes les heures
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return LANDINGS.secteur.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return landingMetadata("secteur", slug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <JobLandingPage kind="secteur" slug={slug} />;
}
