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
    to: 'agence@awimmo64.com',
    subject: 'AWIMMO64 — votre site a une fonctionnalité IA qui ne fonctionne pas',
    text: `Bonjour,

J'ai visité votre site awimmo64.net et j'ai repéré plusieurs points qui méritent attention.

Le plus visible : votre fonction de recherche vocale par IA affiche un message d'erreur "Il semblerait que votre microphone ne fonctionne pas" pour tout visiteur qui l'utilise. C'est une fonctionnalité premium que vous avez investie, mais qui donne en l'état une mauvaise impression technique.

J'ai aussi noté que :

- La section "Avis clients" apparaît dans la navigation mais est vide. Pour une agence immobilière indépendante, les avis clients sont un élément de confiance décisif face aux grandes enseignes.
- Malgré une compatibilité Matterport/Nodalview visible dans le code de votre site, les visites virtuelles ne sont pas activées sur vos annonces. En 2026, les acheteurs s'attendent à pouvoir visiter virtuellement avant de se déplacer.
- Le design général du site manque de modernité par rapport à la concurrence digitale du secteur immobilier.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes techniques, activer les visites virtuelles et moderniser la présentation de vos annonces pour que votre site devienne un vrai outil commercial.

Si vous souhaitez qu'on en discute, je suis disponible sans engagement.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'sobilobiarritz@gmail.com',
    subject: 'Sobilo Location — vos tarifs sont introuvables sur votre site',
    text: `Bonjour,

J'ai visité votre site de location de vélos, scooters et motos à Biarritz et j'ai constaté quelque chose qui freine probablement vos réservations en ligne : aucun tarif n'est clairement visible sur le site.

Quand un touriste cherche à louer un scooter ou un vélo pour sa journée à Biarritz, il compare plusieurs prestataires rapidement depuis son téléphone. Si votre site ne lui donne pas un prix immédiatement, il passera au suivant.

J'ai aussi remarqué :
- Pas d'email visible sur le site — seulement un numéro de téléphone. Beaucoup de clients, notamment les touristes étrangers, préfèrent écrire plutôt qu'appeler.
- Les liens de réservation pointent vers une plateforme externe (Lokki) ce qui crée une rupture dans l'expérience client.
- Le contenu du site est très dense, ce qui nuit à la lisibilité sur mobile.

Je suis développeur web basé à Anglet. Si vous souhaitez moderniser votre site avec des tarifs clairs, une réservation directe fluide et un meilleur affichage mobile, je suis disponible pour en discuter.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'aock64@gmail.com',
    subject: 'Anglet Olympique Canoë Kayak — votre présence en ligne peut faire plus pour vous',
    text: `Bonjour,

Je vous contacte au sujet de la présence en ligne de l'Anglet Olympique Canoë Kayak.

Le kayak de mer à la Barre d'Anglet est une activité que beaucoup de touristes et locaux cherchent activement en ligne chaque été. Pourtant, sans site web dédié et bien référencé, ces personnes ne vous trouvent pas facilement — elles trouvent d'autres prestataires qui ont une meilleure visibilité numérique.

Un site simple mais efficace pour votre club permettrait :
- D'apparaître sur Google quand quelqu'un cherche "kayak de mer Anglet" ou "sortie kayak Pays Basque"
- D'informer clairement sur vos créneaux, vos tarifs et les niveaux requis
- De recevoir des demandes de réservation directement en ligne

Je suis développeur web basé à Anglet et je travaille avec des associations et prestataires d'activités nautiques locaux. Si vous souhaitez qu'on discute de ce que je pourrais faire pour votre club, je suis disponible sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
];

async function sendAll() {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    try {
      await transporter.sendMail({
        from,
        to: email.to,
        subject: email.subject,
        text: email.text,
      });
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
