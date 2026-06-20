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
    to: 'contact@kaiku.fr',
    subject: "J'ai redessiné votre site — vous voulez voir ?",
    text: `Bonjour,

J'ai analysé votre site kaiku.fr et j'ai esquissé une version modernisée — avec votre menu affiché directement sur la page, un système de réservation fonctionnel et vos photos en valeur.

Pour un restaurant étoilé à Saint-Jean-de-Luz, votre site actuel ne reflète pas le niveau de votre cuisine. Je voudrais vous montrer ce que ça pourrait donner.

Ça vous intéresse de voir la maquette ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@artis-immo.fr',
    subject: "J'ai refait votre site Artis Immo — vous voulez comparer ?",
    text: `Bonjour,

J'ai étudié votre site artis-immo.fr et j'ai travaillé sur une version améliorée — sans les images manquantes sur les biens, avec le formulaire de recherche corrigé et un blog actif pour booster votre référencement local.

Je voudrais vous montrer le résultat. Vous avez 5 minutes cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'antoninanik@yahoo.com',
    subject: "J'ai créé une maquette pour Hor Dago — vous voulez la voir ?",
    text: `Bonjour Antonina,

J'ai visité votre site hordago-hendaye.fr et j'ai créé une maquette avec un vrai système de réservation directe, les tarifs par chambre clairement affichés et un calendrier de disponibilités en temps réel.

Ça vous permettrait de prendre des réservations sans commission, directement depuis votre site. Je voudrais vous montrer à quoi ça ressemble.

Intéressée ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'legarage.bar@gmail.com',
    subject: "J'ai refait le site du Garage Bar — vous voulez voir ?",
    text: `Bonjour,

J'ai analysé votre site le-garage-bar.fr et j'ai esquissé une version sans les photos cassées, avec votre menu intégré directement sur la page et un système de réservation en ligne.

Je voudrais vous montrer le résultat — ça prend 5 minutes.

Disponible cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'nicolas.soleil@wanadoo.fr',
    subject: "J'ai redessiné le site de l'Hôtel Beausoleil — vous voulez voir ?",
    text: `Bonjour Nicolas,

J'ai analysé votre site hotelbeausoleildax.com et j'ai travaillé sur une version avec vos coordonnées fonctionnelles, vos tarifs de chambres affichés et un module de réservation directe.

En ce moment, ni votre numéro de téléphone ni votre email ne fonctionnent sur le site — des clients essaient de vous contacter et n'y arrivent pas.

Je voudrais vous montrer ce que ça pourrait donner. Vous avez 5 minutes ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@immo-dax.fr',
    subject: "J'ai refait votre site Immo Dax — vous voulez comparer ?",
    text: `Bonjour,

J'ai étudié votre site immo-dax.fr et j'ai esquissé une version modernisée — sans les fiches de biens cassées, avec un lien Google My Business à jour (votre lien Google+ pointe vers un réseau fermé depuis 2019) et un design adapté aux mobiles.

Pour une agence présente à Dax depuis 1983, votre site mérite mieux. Je voudrais vous montrer la maquette.

Vous avez 5 minutes cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@domaine-agerria.com',
    subject: "J'ai redessiné le site du Domaine Agerria — vous voulez voir ?",
    text: `Bonjour,

J'ai analysé votre site domaine-agerria.com et j'ai créé une maquette avec vos tarifs de chambres affichés directement, un module de réservation intégré et les horaires du restaurant clairement visibles.

Pour un domaine hôtelier au cœur du Pays Basque, votre site actuel ne met pas assez en valeur votre cadre. Je voudrais vous montrer le résultat.

Intéressé ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'reservation@restaurant-euskalduna.com',
    subject: "J'ai redessiné votre site — vous voulez voir le résultat ?",
    text: `Bonjour,

J'ai analysé votre site restaurant-euskalduna.com et j'ai travaillé sur une version avec vos menus et tarifs affichés directement, sans avoir à naviguer pour les trouver.

Je voudrais vous montrer la maquette — ça prend 5 minutes.

Disponible cette semaine ?

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
