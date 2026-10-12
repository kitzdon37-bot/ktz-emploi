import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/connexion",
  title: "Connexion à votre espace",
  description: "Connectez-vous à votre espace KTZ Emploi par email ou par WhatsApp.",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
