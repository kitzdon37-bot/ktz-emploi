import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "KTZ Emploi — Offres d'emploi en République Centrafricaine",
  description:
    "Trouvez votre prochain emploi en République Centrafricaine. Des milliers d'offres d'emploi à Bangui et partout en RCA.",
  keywords: "emploi centrafrique, jobs bangui, recrutement RCA, travail centrafrique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
