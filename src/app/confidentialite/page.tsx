import Link from "next/link";
import TextPage from "@/components/seo/TextPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  path: "/confidentialite",
  title: "Politique de confidentialité",
  description: "Comment KTZ Emploi collecte, utilise et protège les données personnelles des candidats et des recruteurs.",
});

export default function ConfidentialitePage() {
  return (
    <TextPage title="Politique de confidentialité" updated="octobre 2026">
      <p>
        KTZ Emploi attache une grande importance à la protection de vos données personnelles.
        Cette page explique quelles données nous collectons, pourquoi, et quels sont vos droits.
      </p>
      <h2>Données collectées</h2>
      <ul>
        <li>Données de compte : nom, adresse email, numéro de téléphone (WhatsApp), mot de passe chiffré.</li>
        <li>Profil candidat : titre, compétences, expérience, formation, CV et lettres de motivation.</li>
        <li>Profil recruteur : informations sur l&apos;entreprise et offres publiées.</li>
        <li>Données d&apos;utilisation : pages visitées et statistiques de fréquentation anonymisées.</li>
      </ul>
      <h2>Utilisation des données</h2>
      <ul>
        <li>Créer et gérer votre compte, et vous permettre de postuler ou de recruter.</li>
        <li>Transmettre vos candidatures aux recruteurs concernés.</li>
        <li>Vous envoyer les codes de connexion, les alertes emploi et les notifications que vous avez demandées.</li>
        <li>Classer les candidatures reçues par un recruteur selon leur correspondance avec le poste (analyse automatique du profil et du CV).</li>
        <li>Rendre votre CV visible dans la CVthèque, uniquement si vous l&apos;avez rendu public.</li>
      </ul>
      <h2>Prestataires</h2>
      <p>
        Pour faire fonctionner le service, certaines données sont traitées par nos prestataires techniques :
        Vercel (hébergement), Supabase (base de données), Resend (emails), un service d&apos;envoi WhatsApp (codes et notifications),
        Anthropic (analyse des candidatures et assistant en ligne) et Google (connexion avec un compte Google).
        Nous ne vendons jamais vos données.
      </p>
      <h2>Durée de conservation</h2>
      <p>Vos données sont conservées tant que votre compte est actif. Vous pouvez demander leur suppression à tout moment.</p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez consulter, corriger ou supprimer vos données depuis votre espace, ou en nous écrivant à{" "}
        <a href="mailto:contact@ktzemploi.com">contact@ktzemploi.com</a>. Voir aussi la page <Link href="/contact">Contact</Link>.
      </p>
    </TextPage>
  );
}
