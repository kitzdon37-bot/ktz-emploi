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
    to: 'starter.anglet@orange.fr',
    subject: 'Auto-école Starter — vos images ne s\'affichent pas sur votre site',
    text: `Bonjour,

J'ai visité votre site autoecolestarter.com et j'ai constaté un problème technique : de nombreuses images apparaissent sous forme d'icônes vides sur l'ensemble du site. Pour un futur conducteur qui compare plusieurs auto-écoles en ligne, cette impression de site cassé peut le faire partir vers un concurrent.

J'ai aussi remarqué qu'aucune inscription en ligne n'est disponible et que vos avis Google, pourtant mentionnés, ne sont pas affichés directement sur le site. En 2026, un candidat au permis commence toujours par regarder les avis avant de choisir son école — les afficher sur votre page d'accueil serait un vrai levier de conversion.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et vous intégrer un formulaire d'inscription en ligne — ce qui réduit considérablement le travail administratif à l'accueil.

Disponible cette semaine si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@ae-aguilera.fr',
    subject: 'Auto-école Aguilera — votre menu de navigation s\'affiche 4 fois sur votre site',
    text: `Bonjour,

J'ai visité votre site auto-ecole-aguilera.fr et j'ai repéré un problème technique qui nuit à l'image de votre école : votre menu de navigation s'affiche en double voire en quadruple sur certaines pages, et plusieurs images apparaissent sous forme d'icônes vides.

Pour une école labelisée "École de Conduite de Qualité" avec 98% de réussite en conduite accompagnée, votre site ne reflète pas encore ce niveau d'excellence.

J'ai aussi noté que vos tarifs ne sont pas affichés — or c'est la première information qu'un candidat au permis cherche. Et aucun avis client n'est visible, alors que vos résultats parlent d'eux-mêmes.

Je suis développeur web basé à Anglet. Je pourrais corriger ces bugs, afficher vos tarifs et vos avis pour que votre site soit à la hauteur de votre réputation.

Je suis disponible si vous souhaitez en discuter.

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
