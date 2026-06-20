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
  to: 'clinique.bayonne@biovet.fr',
  subject: "BIO'VET Bayonne — votre expertise ne se voit pas assez sur votre site",
  text: `Bonjour,

J'ai visité votre site biovetbayonne.fr et votre clinique a clairement un positionnement fort — cardiologie, dermatologie, chirurgie orthopédique, NAC. C'est une offre spécialisée que peu de cliniques du secteur proposent.

Pourtant, deux choses nuisent à votre visibilité en ligne : aucun avis client n'est affiché sur votre site, et vos tarifs ne sont pas accessibles. Un propriétaire d'animal qui cherche une clinique spécialisée à Bayonne commence par comparer les avis et les prix — sans ces informations, il peut passer à côté de votre expertise.

Je suis développeur web basé à Anglet. Je pourrais intégrer vos avis Google directement sur votre site et améliorer la présentation de vos spécialités pour que votre niveau de compétence soit visible dès la première visite.

Disponible si vous souhaitez en discuter.

Cordialement,
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
