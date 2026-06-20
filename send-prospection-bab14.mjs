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
    to: 'contact@groom-immo.com',
    subject: "Groom Immo — une erreur visible sur votre site nuit à votre image",
    text: `Bonjour,

J'ai visité votre site groom-immo.com et j'ai constaté deux problèmes visibles par tous vos visiteurs : une erreur "#NOM?" s'affiche dans la zone de sélection de biens, et plusieurs annonces affichent des images manquantes à la place des photos de propriétés.

Pour une agence immobilière à Biarritz qui travaille sur des biens haut de gamme, ces défauts techniques donnent une impression peu professionnelle — exactement l'inverse de ce que vous voulez projeter à une clientèle exigeante.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes, moderniser l'affichage de vos annonces et améliorer l'expérience de vos visiteurs.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'donzacqimmo64@wanadoo.fr',
    subject: "Donzacq Immo — votre site n'est pas sécurisé (pas de HTTPS)",
    text: `Bonjour,

J'ai visité votre site donzacq-immo.com et j'ai constaté qu'il n'est pas sécurisé — votre adresse commence par "http" et non "https". Depuis 2018, les navigateurs affichent une alerte "Site non sécurisé" à vos visiteurs, ce qui peut les faire fuir avant même qu'ils aient vu vos annonces.

J'ai aussi noté que certaines images de propriétés ne se chargent pas correctement, et qu'il n'y a pas de visite virtuelle disponible — une fonctionnalité que les acheteurs attendent de plus en plus pour présélectionner un bien avant de se déplacer.

Je suis développeur web basé à Anglet. Je pourrais activer le HTTPS, corriger les images et moderniser votre site pour qu'il soit à la hauteur de votre réputation depuis 2004.

Disponible cette semaine.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@sarldumas.fr',
    subject: "Agence Sud Ouest — votre fonctionnalité de recherche vocale ne fonctionne pas",
    text: `Bonjour,

J'ai visité votre site sarldumas.fr et j'ai constaté que votre fonctionnalité de recherche vocale par IA affiche un message d'erreur "Il semblerait que votre microphone ne fonctionne pas" pour tout visiteur qui l'utilise. C'est une fonctionnalité premium qui donne en l'état une mauvaise impression technique.

Pour une agence familiale implantée à Bayonne depuis les années 1930, cette image ne correspond pas à votre standing. J'ai aussi noté l'absence d'avis clients sur le site et seulement 6 biens listés en page d'accueil — peu pour convaincre un acheteur de rester.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et moderniser votre présence pour qu'elle reflète vraiment votre expérience du marché basque.

Je suis disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@monzeo.fr',
    subject: "Monzéo — vos annonces s'affichent sans photos sur votre site",
    text: `Bonjour,

J'ai visité votre site monzeo.fr et j'ai constaté un problème technique qui impacte toutes vos annonces : les photos de propriétés ne se chargent pas — des icônes vides apparaissent à la place sur l'ensemble du catalogue.

Pour un acheteur qui parcourt vos biens depuis son téléphone, une annonce sans photo ne génère aucun intérêt. Ce problème vous fait probablement perdre des contacts qualifiés chaque jour.

J'ai aussi noté que votre section "Investir dans du neuf" est entièrement vide, sans contenu ni biens listés.

Je suis développeur web basé à Anglet. Je pourrais diagnostiquer et corriger ces problèmes d'affichage rapidement.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'ndesbieys@manoirdefrance.com',
    subject: "Manoir de France — des erreurs d'affichage visibles sur votre site",
    text: `Bonjour,

J'ai visité votre site manoirdefrance.fr et j'ai repéré plusieurs problèmes techniques : des erreurs d'encodage font apparaître "louÃ©" à la place de "loué" sur certaines annonces, plusieurs images ne se chargent pas, et le design général accuse son âge.

Pour une agence spécialisée dans les biens de caractère au Pays Basque, ce type de défauts nuit directement à la perception de votre sérieux — notamment auprès d'une clientèle exigeante qui compare plusieurs agences en ligne.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes techniques et moderniser l'affichage de vos annonces pour qu'il soit à la hauteur de votre positionnement.

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
