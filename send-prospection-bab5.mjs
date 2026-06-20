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
    to: 'cdantza.asso@gmail.com',
    subject: 'Studio CDANTZA — vos futurs élèves ne trouvent pas vos tarifs ni vos horaires',
    text: `Bonjour,

J'ai visité le site du Studio CDANTZA à Anglet et j'ai identifié plusieurs points qui freinent probablement vos inscriptions.

En premier lieu : aucun tarif affiché sur le site. Un parent ou un adulte qui cherche un cours de danse commence toujours par regarder les prix. Sans cette information accessible immédiatement, beaucoup ne vous contacteront pas.

J'ai aussi constaté :
- Pas d'inscription en ligne. En 2026, proposer une pré-inscription ou un formulaire d'intérêt directement sur le site réduit considérablement le nombre d'appels à passer — et augmente le taux de transformation.
- Pas d'avis clients visibles. Les témoignages de parents ou d'élèves satisfaits sont souvent ce qui convainc une famille de choisir votre école plutôt qu'une autre.
- Pas de galerie photos ni vidéos. Voir des élèves en cours, des spectacles, des moments de vie de l'école est extrêmement engageant pour les futurs inscrits.
- Design vieillissant qui ne reflète pas l'énergie et le dynamisme d'une école de danse.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site et lui donner les fonctionnalités qui transforment les visiteurs en inscrits.

Si vous souhaitez qu'on en discute, je suis disponible sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@agnalysballetjazz.com',
    subject: "Agnalys Ballet Jazz — certaines images de votre site ne s'affichent pas",
    text: `Bonjour,

J'ai visité le site d'Agnalys Ballet Jazz à Anglet et j'ai repéré un problème technique : certaines images du slider de votre page d'accueil ne s'affichent pas correctement.

Pour une école de danse, les visuels sont la première chose que regardent les parents et les élèves potentiels. Des images manquantes dès la page d'accueil donnent une impression peu soignée qui peut faire fuir des inscriptions.

Au-delà de ce point technique, j'ai aussi noté :
- Aucun tarif affiché. C'est souvent la première question des parents — sans réponse visible sur le site, beaucoup n'iront pas plus loin.
- Pas de système d'inscription en ligne. Un formulaire de pré-inscription ou d'essai d'un cours permettrait de capter les intéressés directement depuis le site.
- Pas d'avis clients. Les témoignages de familles et d'élèves sont un levier de confiance essentiel.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et moderniser votre site pour qu'il reflète vraiment la qualité de votre enseignement.

Si vous souhaitez en discuter, je suis disponible.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'lmex64@orange.fr',
    subject: 'LMEX Déménagements — votre section avis clients est vide',
    text: `Bonjour,

J'ai visité votre site LMEX Déménagements à Bayonne et j'ai noté quelques points qui nuisent à votre conversion en ligne.

Le plus important : votre section "Ce que nos clients disent de nous" est présente sur le site mais entièrement vide. Pour un service de déménagement, les avis clients sont le premier facteur de décision — un client qui cherche un déménageur compare avant tout les expériences des autres. Cette rubrique vide peut pousser vos visiteurs vers des concurrents qui ont des témoignages visibles.

J'ai aussi observé :
- Pas de devis en ligne. Votre site invite à demander un devis mais n'offre qu'un formulaire générique. Un outil de devis interactif (avec type de déménagement, volume, distance) permettrait à vos prospects de s'engager davantage.
- Design qui commence à dater, avec des éléments visuels qui n'inspirent pas autant confiance qu'un design moderne.
- Des liens dans le pied de page qui manquent d'interactivité.

Je suis développeur web basé à Anglet. Si vous souhaitez moderniser votre présence en ligne pour gagner plus de clients qualifiés, je suis disponible pour en discuter.

Cordialement,
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
