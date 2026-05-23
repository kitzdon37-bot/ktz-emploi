import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import NewsletterPopup from "@/components/NewsletterPopup";
import VisitTracker from "@/components/VisitTracker";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "KTZ Emploi — Offres d'emploi en République Centrafricaine",
  description:
    "Trouvez votre prochain emploi en République Centrafricaine. Des milliers d'offres d'emploi à Bangui et partout en RCA.",
  keywords: "emploi centrafrique, jobs bangui, recrutement RCA, travail centrafrique",
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
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          {process.env.NODE_ENV !== "production" && <ChatWidget />}
          <NewsletterPopup />
          <VisitTracker />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

