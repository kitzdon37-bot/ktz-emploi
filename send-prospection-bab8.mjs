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
    to: 'larrantza.contact@gmail.com',
    subject: "L'Arrantza — vos clients vous cherchent sur Google et ne trouvent rien",
    text: `Bonjour,

J'ai cherché le site web de L'Arrantza sur Google et je suis tombé sur une fiche annuaire et votre Instagram — pas de site propre. Pour un restaurant de plage à Anglet en pleine saison touristique, c'est des réservations perdues chaque jour.

Un touriste qui sort de son hôtel et cherche "restaurant vue mer Anglet" depuis son téléphone ne va pas chercher votre numéro dans un annuaire. Il clique sur le premier restaurant qui a un site clair avec un menu et la possibilité de réserver.

Je suis développeur web basé à Anglet. Je peux vous créer un site simple et efficace — votre menu, vos horaires, quelques belles photos de la terrasse, et un lien de réservation. En quelques jours, vous existez sur Google.

Disponible cette semaine si vous voulez en discuter.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'miladybeach@gmail.com',
    subject: 'Milady Beach — votre formulaire de contact ne fonctionne pas',
    text: `Bonjour,

J'ai visité votre site Milady Beach et j'ai constaté un problème : votre formulaire de contact affiche un CAPTCHA mal configuré qui empêche l'envoi. Un client qui essaie de vous contacter ou de réserver depuis votre site repart sans avoir pu le faire.

J'ai aussi remarqué qu'aucun menu avec prix n'est visible en ligne. Pour un restaurant en bord de mer à Biarritz, les touristes comparent plusieurs adresses avant de choisir — celui qui donne l'information directement gagne la réservation.

Je suis développeur web basé à Anglet. Je pourrais corriger ces points rapidement et vous donner un site qui génère vraiment des réservations en pleine saison.

Je suis disponible si vous souhaitez qu'on en discute.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'indigo64600@gmail.com',
    subject: 'L\'Indigo — votre site indique que vous êtes fermés en permanence',
    text: `Bonjour,

J'ai visité votre site et j'ai constaté un problème visible par tous vos visiteurs : la mention "We are closed" s'affiche en permanence sur votre page, quelle que soit l'heure à laquelle on visite le site.

Pour un restaurant sur l'Esplanade des Gascons avec terrasse vue sur l'océan, c'est potentiellement des dizaines de clients qui repartent en pensant que vous êtes fermés — alors que vous êtes ouverts.

J'ai aussi noté que votre menu n'est disponible qu'en image, sans prix lisibles sur mobile.

Je suis développeur web basé à Anglet. Je peux corriger ce problème rapidement et moderniser votre présence en ligne avant que la pleine saison arrive.

Disponible cette semaine.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'angelupizza@gmail.com',
    subject: 'Angelu Pizza — votre site date de 2017, vos concurrents ont pris de l\'avance',
    text: `Bonjour,

J'ai visité votre site Angelu Pizza et j'ai constaté que le design remonte aux alentours de 2017. Vos pizzas méritent mieux : pas d'avis clients visibles directement sur le site, commandes redirigées vers une plateforme externe, et une présentation qui ne met pas vos produits en valeur.

En saison, un touriste qui cherche "pizza Anglet" compare plusieurs pizzerias en 30 secondes sur son téléphone — le site le plus moderne et rassurant remporte la commande.

Je suis développeur web basé à Anglet. Je pourrais vous créer un site moderne avec votre carte en ligne, les avis clients intégrés et une commande directe sans commission.

Si ça vous intéresse, je suis disponible.

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
