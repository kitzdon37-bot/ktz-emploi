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
    to: 'contact@hotelvillableue.fr',
    subject: "La Villa Bleue — toutes les photos de votre site sont cassées",
    text: `Bonjour,

J'ai visité votre site hotel-lavillableue.com et j'ai constaté un problème critique visible par tous vos visiteurs : l'ensemble des photos du site ne s'affiche pas — la bannière principale, toutes les photos de chambres, les icônes d'équipements, les photos d'appartements. Le site s'affiche en grande partie vide pour tout visiteur qui arrive.

Pour un hôtel-restaurant à Cambo-les-Bains, c'est des réservations perdues chaque jour — un voyageur qui ne voit aucune photo repart immédiatement.

Je suis développeur web basé à Anglet. Je pourrais corriger ce problème rapidement et moderniser votre présence en ligne.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'hostellerie.parc@orange.fr',
    subject: "Hostellerie du Parc — votre site affiche des images de remplacement à la place de vos photos",
    text: `Bonjour,

J'ai visité votre site hotel-parc-cambo.com et j'ai constaté un problème visible par tous vos visiteurs : le carrousel principal affiche des images génériques "dummy" à la place de vos vraies photos d'hôtel. Ce bug provient d'un plugin de diaporama obsolète (RevSlider) qui n'a pas été mis à jour.

Pour un établissement à Cambo-les-Bains qui accueille une clientèle en recherche de séjours thermaux, une première impression avec des images vides nuit directement aux réservations.

Je suis développeur web basé à Anglet. Je pourrais corriger ce problème et moderniser votre site pour qu'il reflète la qualité de votre établissement.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@casabaia-hendaye.com',
    subject: "Casa Baia — votre bouton de réservation ne fonctionne pas",
    text: `Bonjour,

J'ai visité votre site casabaia-hendaye.com et votre chambre d'hôtes a une belle présentation. Mais j'ai repéré un problème qui vous coûte probablement des réservations directes : le bouton "Réserver sans commission" affiché sur votre site ne mène nulle part — il n'est pas fonctionnel.

Un visiteur qui veut réserver directement sans passer par Booking ou Airbnb (et donc sans commission) arrive sur un lien mort. Aucun tarif par chambre n'est non plus affiché clairement, ce qui force les visiteurs à vous contacter juste pour connaître les prix.

Je suis développeur web basé à Anglet. Je pourrais intégrer un vrai système de réservation directe avec calendrier et tarifs visibles — pour vous faire récupérer ces marges.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@lba-electricien-cambolesbains.fr',
    subject: "LBA Électricien — votre formulaire de contact ne fonctionne pas",
    text: `Bonjour,

J'ai visité votre site lba-electricien-cambolesbains.fr et j'ai constaté deux problèmes qui nuisent à votre image professionnelle : votre formulaire de contact est vide et non fonctionnel, et votre site répète le terme "électricien Cambo les Bains" de nombreuses fois de façon visible — une technique SEO dépassée que Google pénalise aujourd'hui et qui donne une impression peu sérieuse à vos visiteurs.

Un client qui cherche un électricien à Cambo et qui tombe sur un formulaire cassé ira chez un concurrent.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et refaire votre site avec un design professionnel adapté à votre métier.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'maison.louges@wanadoo.fr',
    subject: "Maison Louges — votre site affiche des images cassées et votre email date de 2000",
    text: `Bonjour,

J'ai visité votre site maisonlouges.com et j'ai repéré plusieurs problèmes qui nuisent à votre crédibilité : le logo du site ne s'affiche pas (image cassée), plusieurs autres images sont également manquantes, et votre adresse email de contact — en @wanadoo.fr — est un service qui n'existe plus depuis plus de 15 ans, ce qui peut inspirer peu confiance à de nouveaux clients.

Il n'y a par ailleurs aucun portfolio de réalisations, ce qui est pourtant le principal argument pour un artisan cherchant à convaincre un prospect.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site, corriger ces problèmes et créer une galerie de vos travaux.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'secretariat.feugas@gmail.com',
    subject: "Menuiserie Feugas — un lien cassé dans votre portfolio fait fuir vos prospects",
    text: `Bonjour,

J'ai visité votre site menuiseriefeugas.com et j'ai constaté un problème dans votre portfolio : un filtre de navigation pointe vers une page inexistante, ce qui génère une erreur pour les visiteurs qui cherchent à voir vos réalisations. Pour une menuiserie dont le travail se vend par l'image, un portfolio qui ne fonctionne pas est un frein direct à la prise de contact.

J'ai aussi noté que le site est construit sur un template WordPress de 2014 — il n'est plus adapté aux standards actuels, notamment sur mobile.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site et créer un portfolio fonctionnel qui met vraiment en valeur vos réalisations.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'agence@lons-immo.fr',
    subject: "Pau Immo — votre email ne correspond pas à votre site web",
    text: `Bonjour,

J'ai visité votre site pau-immo.fr et j'ai constaté une incohérence qui peut nuire à la confiance de vos prospects : l'adresse email affichée sur le site est en @lons-immo.fr, alors que votre site s'appelle pau-immo.fr. Un acheteur ou vendeur potentiel qui remarque cette divergence peut douter de la fiabilité de l'agence.

J'ai aussi noté qu'aucun système de prise de rendez-vous en ligne n'est disponible pour les visites, et que l'un de vos profils d'agents n'affiche pas de photo.

Je suis développeur web basé à Anglet. Je pourrais harmoniser votre identité en ligne et améliorer la conversion de vos visiteurs en contacts qualifiés.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@lafabrique-delimmobilier.com',
    subject: "La Fabrique de l'Immobilier — votre recherche vocale affiche une erreur pour tous vos visiteurs",
    text: `Bonjour,

J'ai visité votre site lafabrique-delimmobilier.com et j'ai constaté que votre fonctionnalité de recherche vocale par IA affiche un message d'erreur "votre microphone ne fonctionne pas ou votre navigateur n'est pas compatible" pour tout visiteur qui l'utilise. C'est une fonctionnalité premium qui donne en l'état une mauvaise impression technique à l'ensemble de vos visiteurs.

Pour une agence immobilière à Pau qui se démarque avec des outils innovants, ce type de bug nuit directement à la crédibilité que vous cherchez à construire.

Je suis développeur web basé à Anglet. Je pourrais corriger ce problème et optimiser votre site pour améliorer l'expérience de vos visiteurs.

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
