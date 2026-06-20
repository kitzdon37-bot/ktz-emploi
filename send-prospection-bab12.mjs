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
    to: 'contact@archimia.fr',
    subject: "ARCHIMIA — 20 ans d'expérience mais aucun avis client sur votre site",
    text: `Bonjour,

J'ai visité votre site archimia.fr et votre positionnement est clair — architecture d'intérieur haut de gamme au Pays Basque depuis plus de 20 ans. Mais deux éléments freinent la conversion de vos visiteurs en prospects.

Premier point : aucun avis client n'est visible sur votre site. Un client qui envisage de confier sa rénovation à un architecte d'intérieur cherche avant tout des témoignages de personnes qui ont déjà fait ce choix. Sans cela, même 20 ans d'expérience restent invisibles pour un premier visiteur.

Second point : votre site est construit sur Wix avec un design datant de 2017 — cela commence à se voir, notamment sur mobile, et peut nuire à la perception premium de votre agence.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site, intégrer vos avis et créer une présentation de vos réalisations qui soit à la hauteur de vos projets.

Disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'philippe@createursdinterieur.com',
    subject: 'Créateurs d\'Intérieur — des fautes sur votre version anglaise qui nuisent à votre image',
    text: `Bonjour Philippe,

J'ai visité votre site createursdinterieur.com et votre agence a un beau parcours — 18 ans d'activité, des réalisations variées sur toute la Côte Basque.

Cependant, j'ai repéré plusieurs fautes sur votre version anglaise qui peuvent nuire à votre crédibilité auprès d'une clientèle internationale : "recommand" au lieu de "recommend", "Lanscape designer" au lieu de "Landscape designer", et quelques incohérences de ponctuation. Pour une agence qui travaille avec une clientèle étrangère dans une région touristique comme Biarritz, ces détails comptent.

J'ai aussi constaté que votre page "Prices" existe dans la navigation mais n'affiche aucun contenu — un prospect qui clique dessus repart sans information.

Je suis développeur web basé à Anglet. Je pourrais corriger ces points et moderniser votre présence en ligne.

Je suis disponible si vous souhaitez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@mp-home.fr',
    subject: 'MP-HOME — un lien cassé dans votre portfolio fait fuir vos prospects',
    text: `Bonjour,

J'ai visité votre site mp-home.fr et votre approche est soignée — accompagnement sur mesure, collaboration avec des artisans locaux, projets résidentiels et commerciaux.

Mais j'ai constaté un problème qui vous coûte probablement des prises de contact : un lien dans votre portfolio ("FLOQUET A") pointe vers une page vide. Pour un visiteur qui cherche à voir vos réalisations avant de vous contacter, arriver sur une page blanche est rédhibitoire.

J'ai aussi noté que le site n'a pas été mis à jour depuis janvier 2023 et que plusieurs images apparaissent en placeholder. Dans un secteur aussi visuel que la décoration d'intérieur, la qualité de la présentation en ligne est directement liée à la perception de votre travail.

Je suis développeur web basé à Anglet. Je pourrais corriger ces points et moderniser votre site pour qu'il reflète vraiment la qualité de vos projets.

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
