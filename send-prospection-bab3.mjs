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
    to: 'contact@chloecamilleri.fr',
    subject: 'Votre site — les photos de votre portfolio ne s\'affichent pas',
    text: `Bonjour Madame Camilleri,

J'ai visité votre site et je vous contacte parce que j'ai constaté un problème technique important : les photos de votre portfolio ne s'affichent pas. À la place, ce sont des images vides qui apparaissent sur toutes les pages.

Pour une photographe, c'est particulièrement dommageable : un visiteur qui arrive sur votre site pour voir votre travail ne voit... rien. Il repart sans avoir eu la chance de découvrir votre talent.

J'ai aussi noté que :

- Les tarifs ne sont pas affichés pour la plupart de vos prestations (shooting, mariage, grossesse…). Les clients potentiels aiment avoir une idée du budget avant de vous contacter — sans cette information, beaucoup ne franchissent pas le pas.
- La section avis Google est présente mais vide. Les témoignages sont pourtant le premier critère de confiance dans votre secteur.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes techniques, remettre votre portfolio en ligne correctement et améliorer la conversion globale de votre site.

Si cela vous intéresse, je suis disponible pour en discuter sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'studiolampyris@gmail.com',
    subject: 'Studio Lampyris — vos clients ne savent pas ce que vous coûtez',
    text: `Bonjour Mélanie,

J'ai visité votre site Studio Lampyris et vos photos sont belles — le regard que vous posez sur les moments de vie est vraiment touchant.

Mais j'ai repéré un point qui vous fait probablement perdre des demandes de devis chaque semaine : aucun tarif n'est affiché sur votre site. Quand un couple en préparation de mariage visite plusieurs photographes en même temps, celui qui donne une idée claire de ses prix dès la première visite a beaucoup plus de chances d'être contacté.

J'ai aussi noté :
- Pas de témoignages clients visibles. Or dans la photographie de mariage, les avis et les mots de vos mariés sont souvent ce qui convainc un futur couple de vous faire confiance.
- Le design du site manque d'impact visuel pour mettre en valeur votre travail — votre portfolio pourrait être présenté de façon bien plus immersive.
- Peu de SEO local : sur des recherches comme "photographe mariage Anglet" ou "photographe mariage Pays Basque", votre position peut être améliorée.

Je suis développeur web basé à Anglet. Si vous souhaitez qu'on en discute, je suis disponible sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'jerome@anglet-electricite.com',
    subject: 'Anglet Electricité — votre site est actuellement inaccessible',
    text: `Bonjour Jérôme,

Je me permets de vous contacter parce qu'en essayant de visiter votre site anglet-electricite.com aujourd'hui, je me suis retrouvé face à une erreur — le site est actuellement inaccessible (erreur 503).

Pour un électricien local, votre site est souvent le premier point de contact d'un client en urgence ou en projet de rénovation. Si votre site est en panne, ces clients vont directement chez un concurrent dont le site fonctionne.

Au-delà de ce problème immédiat, un site d'artisan local peut faire bien plus que simplement exister en ligne. Un bon site avec vos réalisations, des avis clients vérifiés et un formulaire de demande de devis rapide peut vous générer des contacts qualifiés régulièrement — des clients qui cherchent exactement vos compétences à Anglet et dans les environs.

Je suis développeur web basé à Anglet, je travaille avec des artisans locaux du Pays Basque. Si vous souhaitez remettre votre présence en ligne sur les rails, je suis disponible pour en parler.

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
