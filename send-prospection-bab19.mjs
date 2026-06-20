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
    to: 'contact@hotel-aragon.com',
    subject: "J'ai redessiné le site de L'Aragon — vous voulez voir ?",
    text: `Bonjour,

J'ai analysé votre site hotel-aragon.com et j'ai esquissé une version modernisée — sans les caractères corrompus qui s'affichent dans vos textes, avec un système de réservation en ligne et vos tarifs visibles directement.

Pour un hôtel-restaurant à Tarbes, votre site actuel donne une impression datée qui ne reflète pas votre cuisine. Je voudrais vous montrer le résultat.

Vous avez 5 minutes cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@agencefochimmobilier.fr',
    subject: "J'ai refait votre site Agence Foch — vous voulez comparer ?",
    text: `Bonjour,

J'ai étudié votre site agencefochimmobilier.fr et j'ai travaillé sur une version avec toutes les photos de biens qui s'affichent correctement — en ce moment, la majorité des images de votre catalogue sont remplacées par des icônes vides.

Pour une agence immobilière à Tarbes, des annonces sans photos ne génèrent aucun contact. Je voudrais vous montrer la maquette.

Disponible cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@caubet-immobilier.com',
    subject: "J'ai redessiné votre site Caubet Immobilier — vous voulez voir ?",
    text: `Bonjour,

J'ai analysé votre site caubet-immobilier.com et j'ai esquissé une version améliorée — avec les photos de biens qui s'affichent toutes correctement, les descriptions complètes et une section actualités active pour booster votre référencement local.

Je voudrais vous montrer le résultat. Vous avez 5 minutes cette semaine ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'frederic.casahoursat@wanadoo.fr',
    subject: "Casahoursat — votre site affiche une alerte \"Non sécurisé\" à tous vos visiteurs",
    text: `Bonjour Frédéric,

J'ai visité votre site sarl-casahoursat.fr et votre certificat SSL a expiré — tous vos visiteurs voient un avertissement "Site non sécurisé" avant même d'accéder à votre page. La plupart quittent immédiatement.

Pour un artisan chauffagiste-plombier en activité depuis 2002, ce problème vous fait perdre des demandes de devis chaque jour.

Je suis développeur web basé à Anglet. Je pourrais régler ça et moderniser votre site.

Disponible si vous souhaitez en discuter.

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@chezgermaine.fr',
    subject: "Chez Germaine — votre site est inaccessible en ce moment",
    text: `Bonjour,

En essayant de visiter votre site chezgermaine.fr aujourd'hui, je suis tombé sur une erreur — le site est complètement inaccessible pour tout visiteur.

Un client qui cherche votre adresse ou vos horaires depuis son téléphone ne trouve rien et va ailleurs.

Je suis développeur web basé à Anglet. Je pourrais diagnostiquer le problème et vous remettre en ligne rapidement — avec un site moderne qui reflète votre cuisine.

Disponible si vous souhaitez en discuter.

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'f.laffitte64@orange.fr',
    subject: "J'ai redessiné votre site — vous voulez voir le résultat ?",
    text: `Bonjour Frédéric,

J'ai analysé votre site frederic-laffitte.fr et j'ai esquissé une version sans les images cassées et avec un vrai formulaire de demande de devis en ligne.

En ce moment, plusieurs photos de services ne s'affichent pas et votre menu de navigation apparaît trois fois sur la même page — un bug visible par tous vos visiteurs.

Je voudrais vous montrer la maquette. Vous avez 5 minutes ?

Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'roques.sarah@gmail.com',
    subject: "J'ai redessiné votre site — vous voulez voir ?",
    text: `Bonjour Sarah,

J'ai analysé votre site coiffeur-montdemarsan-40.fr et j'ai travaillé sur une version avec votre photo d'accueil qui s'affiche vraiment (actuellement une image de remplacement apparaît à la place), vos horaires cohérents et un système de réservation en ligne.

Je voudrais vous montrer le résultat — ça prend 5 minutes.

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
