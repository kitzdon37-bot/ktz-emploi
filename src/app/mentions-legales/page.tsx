import TextPage from "@/components/seo/TextPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/mentions-legales",
  title: "Mentions légales",
  description: "Mentions légales du site KTZ Emploi (ktzemploi.com) : éditeur, directeur de la publication et hébergement.",
});

export default function MentionsLegalesPage() {
  return (
    <TextPage title="Mentions légales" updated="octobre 2026">
      <h2>Éditeur du site</h2>
      <p>
        Le site ktzemploi.com (« KTZ Emploi ») est édité par Donald KITEZE, fondateur de KTZ Emploi,
        basé à Bangui, République Centrafricaine.<br />
        Contact : <a href="mailto:contact@ktzemploi.com">contact@ktzemploi.com</a>
      </p>
      <h2>Directeur de la publication</h2>
      <p>Donald KITEZE.</p>
      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc. (États-Unis) — <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>.
        Les données sont stockées par Supabase — <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>.
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        La marque KTZ Emploi, le logo, la structure et les contenus éditoriaux du site sont la propriété de leur éditeur.
        Les offres d&apos;emploi restent la propriété des recruteurs qui les publient. Toute reproduction sans autorisation est interdite.
      </p>
      <h2>Responsabilité</h2>
      <p>
        KTZ Emploi met en relation candidats et recruteurs. Les offres sont publiées sous la responsabilité des recruteurs.
        Si une offre vous semble frauduleuse, signalez-la depuis la page de l&apos;offre ou écrivez-nous.
      </p>
    </TextPage>
  );
}
