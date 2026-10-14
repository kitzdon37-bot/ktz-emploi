import Link from "next/link";
import TextPage from "@/components/seo/TextPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/cgu",
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de KTZ Emploi, la plateforme d'emploi en République Centrafricaine.",
});

export default function CguPage() {
  return (
    <TextPage title="Conditions générales d'utilisation" updated="octobre 2026">
      <h2>1. Objet</h2>
      <p>
        KTZ Emploi (ktzemploi.com) est une plateforme qui permet aux candidats de consulter des offres d&apos;emploi et d&apos;y postuler,
        et aux recruteurs de publier des offres et de recevoir des candidatures en République Centrafricaine.
        L&apos;utilisation du site implique l&apos;acceptation des présentes conditions.
      </p>
      <h2>2. Compte utilisateur</h2>
      <p>
        L&apos;inscription est gratuite pour les candidats. Chaque utilisateur s&apos;engage à fournir des informations exactes
        et à garder ses identifiants confidentiels.
      </p>
      <h2>3. Candidats</h2>
      <p>
        Les candidats sont responsables du contenu de leur profil, de leur CV et de leurs candidatures.
        Les candidatures envoyées sont transmises au recruteur concerné et peuvent faire l&apos;objet d&apos;un classement automatique
        selon leur correspondance avec le poste.
      </p>
      <h2>4. Recruteurs</h2>
      <p>
        Les recruteurs s&apos;engagent à publier des offres réelles, légales et non discriminatoires, et à utiliser les données
        des candidats uniquement pour le recrutement concerné. Les services payants sont décrits sur la page <Link href="/tarifs">Tarifs</Link>.
      </p>
      <h2>5. Contenus interdits</h2>
      <p>
        Sont interdits les offres frauduleuses ou demandant un paiement aux candidats, les contenus trompeurs, injurieux ou illégaux.
        KTZ Emploi peut supprimer tout contenu ou suspendre tout compte qui ne respecte pas ces règles.
      </p>
      <h2>6. Responsabilité</h2>
      <p>
        KTZ Emploi met en relation candidats et recruteurs mais n&apos;est pas partie aux contrats de travail conclus entre eux.
      </p>
      <h2>7. Données personnelles</h2>
      <p>Voir notre <Link href="/confidentialite">politique de confidentialité</Link>.</p>
      <h2>8. Contact</h2>
      <p>Pour toute question : <a href="mailto:contact@ktzemploi.com">contact@ktzemploi.com</a>.</p>
    </TextPage>
  );
}
