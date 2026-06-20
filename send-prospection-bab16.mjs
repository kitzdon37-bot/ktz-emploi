import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const from = `"Donald Chrysostome — Développeur Web" <${process.env.SMTP_USER}>`;

const emails = [
  {
    to: 'contact@crossfit-etxea.fr',
    subject: "CrossFit Etxea — votre site ne donne pas les horaires ni les tarifs",
    text: `Bonjour,

J'ai visité votre site crossfit-etxea.fr et le concept est clair — box CrossFit à Anglet avec essai gratuit. Mais deux points freinent probablement vos inscriptions : les tarifs ne sont nulle part sur le site, et les créneaux de cours ne sont pas affichés. Un visiteur qui ne sait pas combien ça coûte ni quand ont lieu les cours repart sans s'inscrire.

J'ai aussi constaté que vos liens vers les réseaux sociaux pointent vers des pages génériques Facebook et Instagram, pas vers vos profils — ce qui donne une impression de site inachevé. Et votre copyright date de 2021, ce qui suggère que le site n'a pas été mis à jour depuis plusieurs années.

Je suis développeur web basé à Anglet. Je pourrais intégrer vos tarifs, un planning de cours en temps réel et corriger ces points pour que votre site convertisse mieux les visiteurs en nouveaux membres.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@lecoach-biarritz.fr',
    subject: "Le Coach Biarritz — une erreur technique visible sur votre site",
    text: `Bonjour,

J'ai visité votre site lecoach-biarritz.fr et votre offre est bien structurée — tarifs clairs, avis Google intégrés, contact WhatsApp. C'est un bon point de départ.

Mais j'ai repéré un problème technique visible par tous vos visiteurs : une erreur "Array" s'affiche à la place d'une image sur votre page d'accueil. Ce genre de bug crée une première impression négative, surtout pour un coach personnel dont l'image professionnelle est centrale.

J'ai aussi noté que la prise de rendez-vous est uniquement manuelle (formulaire de contact sans sélection de créneaux) — un système de réservation en ligne permettrait à vos clients de s'inscrire directement, sans échange de messages.

Je suis développeur web basé à Anglet. Je pourrais corriger l'erreur et intégrer un système de réservation adapté à votre activité.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'fitnessclubluzien@hotmail.com',
    subject: "Fitness Club Luzien — votre galerie ne s'affiche pas et vos tarifs sont introuvables",
    text: `Bonjour,

J'ai visité votre site fitnessclubluzien.com et votre club a une belle offre — muscu, cross-training, yoga, escalade à Saint-Jean-de-Luz. Mais deux points bloquent probablement vos nouvelles inscriptions : les tarifs ne sont nulle part visibles sur le site, et la galerie photo ne charge aucun contenu.

Un visiteur qui cherche une salle à Saint-Jean-de-Luz depuis son téléphone a besoin de voir les prix et les installations en quelques secondes — sans ça, il passe à la salle suivante. J'ai aussi noté que le site est construit sur un template Wix qui accuse son âge, notamment sur mobile.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site, afficher clairement vos tarifs et intégrer un planning de cours en temps réel.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@thesweatclub.fr',
    subject: "The Sweat Club — votre planning de cours ne se charge pas",
    text: `Bonjour Elisa,

J'ai visité votre site thesweatclub.fr et votre concept est clair — barre, coaching personnel, conseils nutrition à Saint-Jean-de-Luz.

Mais j'ai constaté un problème technique visible par toutes vos clientes : la section planning des cours est bloquée sur "Chargement..." et n'affiche jamais les créneaux. Une cliente qui veut vérifier les horaires avant de s'inscrire repart sans information — et sans réserver.

Je suis développeur web basé à Anglet. Je pourrais corriger ce bug et intégrer un vrai système de réservation en ligne pour que vos cours se remplissent directement depuis le site.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'info@crossfithendaye.com',
    subject: "CrossFit Hendaye — des erreurs visibles nuisent à l'image de votre box",
    text: `Bonjour,

J'ai visité votre site crossfithendaye.com et votre box a un bon positionnement — à 3 minutes de la plage, essai gratuit, intro régulière pour les débutants.

Mais plusieurs problèmes techniques sont visibles par tous vos visiteurs : vos liens réseaux sociaux sont cassés (ils pointent vers "#" au lieu de vos profils), une section du site affiche du texte en espagnol ("No hay categorías") — trace d'un bug WordPress non corrigé — et aucun tarif n'est accessible depuis la page d'accueil.

Pour une box CrossFit qui veut attirer de nouveaux membres, ces défauts créent une impression de site abandonné.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et ajouter vos tarifs et un système d'inscription en ligne.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'itsatraining64@gmail.com',
    subject: "Itsa Training — votre planning affiche une image cassée",
    text: `Bonjour,

J'ai visité votre site itsatraining.fr et votre concept est bien pensé — cross training 24h/6j à Itxassou, accès flexible, coaching en petit groupe.

J'ai repéré un problème dans la section planning : une image placeholder s'affiche à la place du vrai contenu. Et vos tarifs d'abonnement ne sont pas accessibles directement depuis la page d'accueil — un visiteur intéressé doit appeler ou envoyer un formulaire juste pour connaître les prix, ce qui décourage beaucoup d'inscriptions.

Je suis développeur web basé à Anglet. Je pourrais corriger ce bug et intégrer vos tarifs et un système d'inscription en ligne directement sur le site.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'hello@ona-pilates.com',
    subject: "ONA Studio — vos horaires affichent deux informations contradictoires",
    text: `Bonjour,

J'ai visité votre site ona-pilates.com et votre studio a une offre complète — yoga, pilates, reformer, app mobile. La présentation est soignée.

Mais j'ai repéré une incohérence visible par tous vos visiteurs : vos horaires indiquent "7h00 à 22h00" dans le footer et "7h00 à 20h00" dans le contenu principal — deux informations contradictoires qui peuvent générer de la confusion et des frustrations chez vos clients.

J'ai aussi noté que plusieurs sections sont dupliquées (tarifs, liens app, coordonnées), ce qui alourdit la page et nuit à la lisibilité.

Je suis développeur web basé à Anglet. Je pourrais corriger ces incohérences et alléger la structure de vos pages.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
];

async function sendAll() {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      await transporter.sendMail({ from, to: email.to, subject: email.subject, text: email.text });
      console.log(`✅ Envoyé → ${email.to}`);
      success++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Échec → ${email.to} : ${err.message}`);
      failed++;
    }
  }

  console.log(`\nRésultat : ${success} envoyés, ${failed} échecs`);
}

sendAll();
