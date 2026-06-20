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

const NOM   = 'Donald Chrysostome Kiteze';
const VILLE = 'Anglet';
const GMAIL = process.env.SMTP_USER;
const from  = `"Donald Chrysostome — Développeur Web" <${GMAIL}>`;

const relances = [
  {
    to: 'bpsurfschool@gmail.com',
    subject: 'Re: Votre site — les photos sont cassees et la reservation ne fonctionne pas',
    text: `Bonjour Mathieu,

Je me permets de revenir vers vous suite a mon email de mardi.

Vos photos cassees et votre systeme de reservation bloque sont des problemes qui coutent des reservations chaque jour en pleine approche de la saison.

Je peux commencer les corrections cette semaine — un simple appel de 15 minutes suffit pour evaluer ce qu'il faut faire.

Vous pouvez me rappeler directement ou repondre a cet email.

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'contact@maisoncuevas.com',
    subject: 'Re: Maison Cuevas — un detail sur votre site qui nuit a votre image',
    text: `Bonjour,

Je reviens vers vous au sujet du texte Lorem ipsum visible sur votre site et de l'absence de tarifs et d'avis clients.

Pour un hebergement de prestige comme la Maison Cuevas, ces details font la difference aupres d'une clientele exigeante.

Si vous souhaitez qu'on en discute, je suis disponible cette semaine a Anglet ou Biarritz.

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'biarritzecosurfschool@gmail.com',
    subject: 'Re: Biarritz Eco Surf School — reservations perdues chaque jour',
    text: `Bonjour,

Je me permets de relancer suite a mon email de mardi.

La saison estivale approche rapidement. Mettre en place un systeme de reservation en ligne maintenant vous permettrait de capter les reservations spontanees des touristes qui arrivent en juin.

15 minutes d'echange cette semaine pour voir si je peux vous aider ?

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'info@newschoolsurf.com',
    subject: 'Re: NewSchool Surf — 30 ans d\'experience mal valorises en ligne',
    text: `Bonjour,

Je reviens vers vous suite a mon message de mardi sur votre site.

30 ans d'experience, deux locations, une clientele fidelee — c'est une base solide. Un site modernise avec reservation en ligne et version anglaise/espagnole peut vraiment faire la difference sur cette saison.

Disponible pour en parler cette semaine ?

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'info@ecoledesurf-hendaye.com',
    subject: 'Re: Ecole Hendaia — la clientele espagnole que vous ne captez pas encore',
    text: `Bonjour,

Je me permets de relancer au sujet de la clientele espagnole non captee par votre site actuel.

Hendaye est idealement placee pour attirer cette clientele — une version espagnole avec reservation en ligne pourrait significativement augmenter vos reservations cet ete.

Je suis disponible cette semaine si vous souhaitez en discuter.

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'anglet@ecoledesurf.com',
    subject: 'Re: Ecole de Surf Anglet — reservations en ligne avant l\'ete ?',
    text: `Bonjour,

Je reviens vers vous suite a mon email de mardi.

La plage de Marinella est un spot ideal — un systeme de reservation en ligne permettrait aux touristes de booker directement depuis leur hotel le soir pour le lendemain matin.

Je suis disponible cette semaine, n'hesitez pas a me rappeler.

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'info@biarritz-hotel-ocean.com',
    subject: 'Re: Hotel de l\'Ocean — recuperer vos reservations directes sans commission',
    text: `Bonjour,

Je me permets de relancer au sujet des commissions sur vos reservations en ligne que j'avais mentionnees mardi.

Un moteur de reservation integre a votre site vous permettrait de garder 100% de vos revenus sur les reservations directes — c'est une economie concrete et immediate sur la saison.

Disponible cette semaine pour en parler ?

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
  {
    to: 'hotel.maitagaria@wanadoo.fr',
    subject: 'Re: Hotel Maitagaria — vos chambres meritent mieux en ligne',
    text: `Bonjour,

Je reviens vers vous suite a mon email de mardi.

Afficher les prix et les avis clients directement sur votre site sont les deux premiers pas pour reduire votre dependance a Booking.com et augmenter vos reservations directes.

Je suis disponible cette semaine a Anglet ou Biarritz si vous souhaitez en discuter.

Bonne journee,
${NOM}
${VILLE}
${GMAIL}`,
  },
];

async function sendAll() {
  let success = 0;
  let failed = 0;

  for (const email of relances) {
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
