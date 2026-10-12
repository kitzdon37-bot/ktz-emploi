import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/inscription",
  title: "Inscription gratuite — candidats et recruteurs",
  description: "Créez gratuitement votre compte KTZ Emploi : postulez aux offres d'emploi en Centrafrique ou publiez vos offres de recrutement en RCA.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
