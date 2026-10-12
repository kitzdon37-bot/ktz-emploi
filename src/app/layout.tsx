import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import NewsletterPopup from "@/components/NewsletterPopup";
import VisitTracker from "@/components/VisitTracker";
import { Analytics } from "@vercel/analytics/next";
import InactivityTimer from "@/components/InactivityTimer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FeedbackPopup from "@/components/FeedbackPopup";
import OctobreRoseBanner from "@/components/OctobreRoseBanner";
import { SITE_URL, SITE_NAME, siteSchema, jsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KTZ Emploi — Offres d'emploi en Centrafrique (Bangui, RCA)",
    template: "%s | KTZ Emploi",
  },
  description:
    "KTZ Emploi, la plateforme d'emploi de la République Centrafricaine fondée par Donald KITEZE. Offres d'emploi à Bangui et partout en RCA : CDI, CDD, stages, ONG. Postulez en ligne gratuitement.",
  applicationName: SITE_NAME,
  authors: [{ name: "Donald KITEZE", url: `${SITE_URL}/a-propos` }],
  creator: "Donald KITEZE",
  publisher: SITE_NAME,
  keywords: [
    "emploi centrafrique", "offres d'emploi Bangui", "recrutement RCA", "travail centrafrique",
    "jobs Bangui", "emploi ONG Centrafrique", "stage Bangui", "KTZ Emploi", "ktzemploi", "Donald KITEZE",
  ],
  // Pas de canonical global : chaque page déclare sa propre adresse (sinon Google
  // considère toutes les pages comme des doublons de l'accueil)
  openGraph: {
    title: "KTZ Emploi — Offres d'emploi en Centrafrique",
    description: "Trouvez votre prochain emploi en République Centrafricaine. Offres d'emploi à Bangui et partout en RCA.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  }),
  icons: {
    icon: [
      { url: "/favicon-16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/favicon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg",        type: "image/svg+xml" },
    ],
    shortcut: "/favicon-32.png",
    apple:    { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Données structurées : organisation, site, fondateur */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(siteSchema())} />
        <Providers>
          <OctobreRoseBanner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <WhatsAppButton />
          <NewsletterPopup />
          <FeedbackPopup />
          <VisitTracker />
          <InactivityTimer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

