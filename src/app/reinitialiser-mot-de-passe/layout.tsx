import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/reinitialiser-mot-de-passe",
  title: "Nouveau mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte KTZ Emploi.",
  noIndex: true,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
