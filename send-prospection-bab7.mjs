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
    to: 'contact@menuisier-bab.com',
    subject: 'Menuisier BAB — votre site affiche encore "en cours de réalisation"',
    text: `Bonjour,

J'ai visité votre site menuisier-bab.com et le message "Notre site est en cours de réalisation" est toujours affiché. Pour quelqu'un qui cherche un menuisier sur Google, c'est rédhibitoire — pas de services, pas de réalisations, pas de contact clair. Vos concurrents qui ont un site fonctionnel captent ces clients à votre place.

Je suis développeur web basé à Anglet. Je peux vous livrer un site complet et professionnel rapidement — avec vos réalisations en photos, vos prestations détaillées et un formulaire de devis. C'est exactement ce qu'un client cherche avant d'appeler un menuisier.

Si vous souhaitez qu'on avance sur ça, je suis disponible cette semaine.

Cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@fleuriste-biarritz.com',
    subject: 'Pivoine & Cie — 45 ans d\'expertise que votre site ne valorise pas encore',
    text: `Bonjour,

J'ai visité votre site Pivoine & Cie et une chose m'a frappé : 45 ans de présence à Biarritz, et pourtant aucun avis client n'est visible sur le site. Pour un visiteur qui ne vous connaît pas encore, cette réputation acquise sur des décennies est invisible.

J'ai aussi constaté que vos commandes en ligne passent par une plateforme externe — chaque clic vers un autre site est une occasion de perdre un client. Un module de commande intégré directement sur votre site vous permettrait de garder vos clients dans votre univers du début à la fin.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site, y intégrer vos avis Google et une commande directe, pour que votre réputation soit enfin visible à la hauteur de ce que vous faites.

Je suis disponible si vous souhaitez en discuter.

Bien cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'sandra@thai-yoga-massage.fr',
    subject: 'Thaï Yoga Massage — vos tarifs sont invisibles sur votre site',
    text: `Bonjour Sandra,

J'ai visité votre site thai-yoga-massage.fr et votre offre est solide — yoga, massages, formations certifiées, 98% de satisfaction. Mais j'ai constaté que vos tarifs ne sont nulle part affichés directement sur le site.

Quand une personne cherche un cours de yoga ou un massage à Anglet, la première chose qu'elle regarde, c'est le prix. Si elle doit aller sur Planity pour le trouver, beaucoup ne feront pas cette démarche — et iront chez un concurrent dont le site répond directement.

Par ailleurs, votre certification Qualiopi et vos 15 ans d'expérience sont des arguments forts qui mériteraient d'être mis beaucoup plus en avant dès la page d'accueil.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site pour qu'il reflète vraiment la qualité de ce que vous proposez.

Disponible pour en discuter si vous le souhaitez.

Bien cordialement,
Donald Chrysostome Kiteze — Développeur web, Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 't.blanchet@hotmail.fr',
    subject: 'Blanchet Paysages — votre section chiffres clés est vide',
    text: `Bonjour,

J'ai visité votre site blanchet-paysages.fr et j'ai remarqué que votre section statistiques — "Chantiers réalisés", "Clients satisfaits" — affiche des emplacements vides, sans chiffres. Pour un visiteur, c'est une rupture de confiance immédiate : le site semble incomplet ou abandonné.

Pour un paysagiste qui cherche à se faire connaître dans le Pays Basque, ces premiers signaux de confiance sont essentiels. J'ai aussi noté l'absence de témoignages clients et de photos de réalisations qui donnent vraiment envie de faire appel à vos services.

Je suis développeur web basé à Anglet. Je pourrais corriger ces points et vous donner un site qui inspire confiance et génère des demandes de devis.

Si vous souhaitez en parler, je suis disponible.

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
