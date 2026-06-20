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
  to: 'contact@hoteljulesvernebiarritz.com',
  subject: "Hôtel Jules Verne — plusieurs images ne s'affichent pas sur votre site",
  text: `Bonjour,

J'ai visité votre site hoteljulesvernebiarritz.com et j'ai constaté plusieurs problèmes techniques : de nombreuses images apparaissent sous forme de cases vides sur les galeries de chambres, et une section entière de la page (Piscine & Fitness) s'affiche en double.

Pour un hôtel 4 étoiles à Biarritz, ces défauts visuels créent un décalage avec le standing que vous proposez — un voyageur qui compare plusieurs établissements depuis son téléphone peut passer son chemin.

J'ai aussi noté que les réservations passent par une plateforme externe, ce qui génère des commissions sur chaque séjour. Un moteur de réservation directe intégré à votre site vous permettrait de récupérer ces marges.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et optimiser votre site pour maximiser les réservations directes.

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
