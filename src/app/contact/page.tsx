import Link from "next/link";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import TextPage from "@/components/seo/TextPage";
import { pageMetadata, jsonLd, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contacter KTZ Emploi",
  description: "Une question sur une offre d'emploi, votre compte ou la publication d'offres en Centrafrique ? Contactez l'équipe KTZ Emploi par email ou WhatsApp.",
});

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${SITE_URL}/contact`,
  about: { "@id": `${SITE_URL}/#organisation` },
};

export default function ContactPage() {
  return (
    <TextPage title="Nous contacter">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(contactSchema)} />
      <p>
        Une question sur une offre d&apos;emploi, votre compte, la publication d&apos;offres ou un partenariat ?
        L&apos;équipe KTZ Emploi vous répond.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 not-prose">
        <a href="mailto:contact@ktzemploi.com" className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-300 !no-underline">
          <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
          <span>
            <span className="block font-semibold text-gray-900">Email</span>
            <span className="text-gray-600 text-sm">contact@ktzemploi.com</span>
          </span>
        </a>
        <a href="https://wa.me/33754065694" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-300 !no-underline">
          <MessageCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
          <span>
            <span className="block font-semibold text-gray-900">WhatsApp</span>
            <span className="text-gray-600 text-sm">+33 7 54 06 56 94</span>
          </span>
        </a>
      </div>
      <p className="flex items-center gap-2 text-gray-600">
        <MapPin className="h-4 w-4 text-orange-500" /> Bangui, République Centrafricaine
      </p>
      <h2>Questions fréquentes</h2>
      <ul>
        <li>Mot de passe oublié : utilisez le lien « Mot de passe oublié ? » sur la <Link href="/connexion">page de connexion</Link>.</li>
        <li>Publier une offre : consultez nos <Link href="/tarifs">tarifs</Link> puis créez un <Link href="/inscription">compte recruteur</Link>.</li>
        <li>Chercher un emploi : toutes les offres sont sur la page <Link href="/emplois">Offres d&apos;emploi</Link>.</li>
      </ul>
    </TextPage>
  );
}
