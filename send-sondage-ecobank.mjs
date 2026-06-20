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

const from = `"KITEZE NGOUYOMBO Donald Chrysostome — KTZ Emploi" <${process.env.SMTP_USER}>`;

const emails = [
  { to: 'RNOUNGA@ecobank.com' },
  { to: 'NGaddiel@ecobank.com' },
];

const subject = "Sondage recrutement RCA — ktzemploi.com";
const text = `Bonjour,

Je me permets de vous contacter en tant que fondateur de KTZ Emploi (ktzemploi.com), la première plateforme digitale dédiée au recrutement en République Centrafricaine.

Dans le cadre du développement de notre service, nous menons actuellement un sondage auprès des entreprises et organisations présentes en RCA afin de mieux comprendre leurs besoins en recrutement et d'adapter notre offre.

Ce sondage prend moins de 3 minutes et vos retours nous seraient très précieux :
https://ktz-emploi-sondage.netlify.app

KTZ Emploi centralise les offres d'emploi, les candidatures et les profils de candidats qualifiés en RCA — avec une application mobile disponible pour faciliter vos recrutements locaux.

Je reste disponible pour tout échange sur notre plateforme et les opportunités de collaboration.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Fondateur — KTZ Emploi
kitzdon37@gmail.com`;

async function sendAll() {
  for (const email of emails) {
    try {
      await transporter.sendMail({ from, to: email.to, subject, text });
      console.log(`✅ Envoyé → ${email.to}`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Échec → ${email.to} : ${err.message}`);
    }
  }
}

sendAll();
