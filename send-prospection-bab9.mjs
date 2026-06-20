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

const email = {
  to: 'contact@chiropracteur-biarritz.com',
  subject: 'Cabinet Chiropractique Biarritz — vos images ne s\'affichent pas sur votre site',
  text: `Bonjour,

J'ai visité votre site chiropracteur-biarritz.com et j'ai constaté un problème technique important : les images ne s'affichent pas correctement sur l'ensemble du site — des icônes SVG vides apparaissent à la place de vos visuels.

Pour un cabinet qui reçoit de nouveaux patients venant vous découvrir en ligne, un site avec des images manquantes donne une impression peu soignée qui peut freiner la prise de rendez-vous.

J'ai aussi noté que vos tarifs ne sont pas affichés, et qu'aucun avis client n'est visible sur le site. Dans le secteur de la santé, ces deux éléments sont souvent décisifs pour un nouveau patient qui hésite entre plusieurs praticiens.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes techniques, intégrer vos tarifs et mettre en valeur les témoignages de vos patients.

Si vous souhaitez qu'on en discute, je suis disponible sans engagement.

Bien cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
};

async function send() {
  try {
    await transporter.sendMail({ from, to: email.to, subject: email.subject, text: email.text });
    console.log(`✅ Envoyé → ${email.to}`);
  } catch (err) {
    console.error(`❌ Échec → ${email.to} : ${err.message}`);
    process.exit(1);
  }
}

send();
