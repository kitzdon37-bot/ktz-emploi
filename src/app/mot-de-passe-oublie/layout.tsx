import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/mot-de-passe-oublie",
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte KTZ Emploi.",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
