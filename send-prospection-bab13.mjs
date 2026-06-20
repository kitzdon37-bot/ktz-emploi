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
    to: 'leduplexanglet@gmail.com',
    subject: 'Le Duplex — votre site web est inaccessible en ce moment',
    text: `Bonjour,

Je vous contacte parce qu'en essayant de visiter votre site le-duplex-coiffure.fr aujourd'hui, je suis tombé sur une erreur — le site est complètement inaccessible pour tout visiteur.

En pleine saison, c'est des clients qui cherchent votre adresse, vos horaires ou votre numéro de téléphone et qui ne trouvent rien. Ils vont chez un concurrent dont le site fonctionne.

Je suis développeur web basé à Anglet. Je pourrais diagnostiquer le problème et vous remettre en ligne rapidement — et en profiter pour moderniser votre présence avec les tarifs, une galerie et un système de réservation en ligne.

Disponible cette semaine si vous souhaitez qu'on regarde ça ensemble.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'acquilinakarine@gmail.com',
    subject: 'Salon L\'Atelier — vos clientes ne peuvent pas réserver depuis votre site',
    text: `Bonjour Karine,

J'ai visité votre site salonlatelierbayonne.com et le rendu est soigné — on sent l'ambiance chaleureuse du salon.

Mais j'ai remarqué deux points qui vous font probablement perdre des clientes : aucun tarif n'est affiché, et il n'y a pas de système de réservation en ligne. Aujourd'hui, une cliente qui découvre un nouveau salon depuis Instagram ou Google veut pouvoir réserver directement — si elle doit appeler, beaucoup ne le feront pas et iront ailleurs.

Je suis développeur web basé à Anglet. Je pourrais intégrer vos tarifs et un système de prise de RDV directement sur votre site, sans changer votre design actuel.

Disponible si vous souhaitez en discuter.

Bien cordialement,
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
