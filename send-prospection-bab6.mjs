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
    to: 'contact@ariane-coiffure.com',
    subject: 'Ariane Coiffure — votre site date de plus de 10 ans, ça se voit',
    text: `Bonjour,

J'ai visité votre site Ariane Coiffure et je vous contacte parce que votre présence en ligne ne reflète pas du tout la qualité de votre service à domicile.

Votre site utilise encore une navigation en images — un format qui n'existe plus depuis 2012 environ. Sur téléphone, c'est quasiment inutilisable. Or aujourd'hui, la grande majorité des recherches de coiffeur à domicile se font depuis un mobile.

J'ai aussi noté l'absence totale d'avis clients sur le site. Une coiffeuse à domicile qui intervient chez ses clients depuis des années a forcément des clientes satisfaites — ces témoignages mis en avant sur votre site seraient un déclencheur de confiance immédiat pour de nouveaux prospects.

Je suis développeur web basé à Anglet. Je pourrais vous créer un site moderne, mobile, avec vos tarifs, vos créneaux et vos avis clients mis en valeur.

Si vous souhaitez qu'on en discute, je suis disponible sans engagement.

Bien cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'nymphea.biarritz@outlook.fr',
    subject: 'Nymphea Biarritz — votre bouton de paiement ne fonctionne pas',
    text: `Bonjour,

J'ai visité votre site Nymphea Biarritz et j'ai constaté un problème technique : votre bouton PayPal sur la page de réservation ne fonctionne pas. Pour une cliente qui souhaitait payer un bon cadeau ou régler une prestation en ligne, c'est une vente perdue directe.

J'ai aussi remarqué que vos tarifs ne sont pas affichés sur le site — les visiteurs doivent ouvrir Planity pour voir les prix. Cette étape supplémentaire réduit le taux de conversion, surtout pour les nouvelles clientes qui découvrent votre institut.

Par ailleurs, aucun avis client n'est visible. Dans le secteur du bien-être et de la beauté, les témoignages sont souvent ce qui convainc une personne d'essayer un nouveau soin.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes et vous créer un site plus complet, avec tarifs intégrés, système de réservation fluide et section avis.

Disponible si vous souhaitez en discuter.

Bien cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'jean-claude.castagnet@wanadoo.fr',
    subject: 'Atelier Castagnet — votre formulaire de contact est cassé',
    text: `Bonjour,

Je me permets de vous contacter au sujet de votre site web. En essayant d'utiliser votre formulaire de contact, j'ai constaté que le CAPTCHA de validation ne fonctionne pas correctement — ce qui rend toute prise de contact via votre site impossible pour vos clients.

Pour un garage qui mise sur la qualité et la satisfaction client, un formulaire de contact défaillant, c'est des demandes de devis perdues chaque semaine sans que vous le sachiez.

J'ai aussi noté que votre site n'affiche aucun tarif, pas d'avis clients, et que l'adresse indiquée mentionne Biarritz alors que vous êtes à Anglet — ce genre de détail peut perdre des clients qui cherchent un garage sur Google Maps.

Je suis développeur web basé à Anglet. Je travaille avec des artisans et prestataires locaux pour leur donner une vraie présence en ligne qui génère des contacts qualifiés.

Si vous souhaitez qu'on en discute, je suis disponible.

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
