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
  to: 'surfecole@gmail.com',
  subject: "Re: École du Surf Biarritz — une chose qui vous coûte des réservations cet été",
  text: `Bonjour,

Je me permets de revenir vers vous suite à mon précédent message.

La saison estivale démarre dans quelques jours et c'est exactement le moment où les touristes cherchent une école de surf depuis leur téléphone — souvent le soir depuis leur location, pour le lendemain matin.

Si votre site ne leur permet pas de réserver directement en ligne, ou si les tarifs ne sont pas affichés clairement, ils passent à la prochaine école en 10 secondes.

Je peux mettre en place ces améliorations rapidement. Un échange de 15 minutes cette semaine suffit pour que j'évalue exactement ce qui peut être fait — et je peux vous montrer un exemple concret de ce que ça donnerait.

N'hésitez pas à me répondre ou à me rappeler directement.

Bonne journée,
Donald Chrysostome Kiteze
Développeur web — Anglet
kitzdon37@gmail.com`,
};

async function send() {
  try {
    await transporter.sendMail({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    });
    console.log(`✅ Relance envoyée → ${email.to}`);
  } catch (err) {
    console.error(`❌ Échec → ${email.to} : ${err.message}`);
    process.exit(1);
  }
}

send();
