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
    to: 'celinebedouet64@gmail.com',
    subject: 'Votre site Côte Basque Pilates — 3 points qui freinent vos réservations',
    text: `Bonjour Madame,

J'ai visité votre site Côte Basque Pilates récemment, et je vous écris parce que j'ai repéré trois points précis qui vous coûtent probablement des réservations chaque semaine.

1. Aucun tarif en ligne
Vos visiteurs ne savent pas combien coûte un cours. Sans prix visible, beaucoup repartent sans vous contacter — ils vont simplement chez la concurrence qui affiche ses tarifs clairement.

2. Pas de réservation en ligne
Aujourd'hui, la plupart des gens veulent réserver à 22h depuis leur téléphone, sans avoir à appeler. Chaque fois qu'une cliente intéressée ne peut pas réserver directement, c'est une inscription perdue.

3. Peu de visibilité sur Google
Votre site n'apparaît pas en première page sur des recherches comme "cours de pilates Biarritz" ou "pilates Anglet". Vos concurrents qui sont bien référencés captent ces clientes à votre place.

Ce que je propose : un site moderne, rapide, avec vos tarifs clairs, un système de réservation directe (sans commission), et un bon référencement local sur Google.

Je suis développeur web basé à Anglet. Si vous souhaitez qu'on en discute, je peux vous montrer concrètement ce que ça donnerait pour votre activité — sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@atlantic-pirogue.com',
    subject: 'Atlantic Pirogue — des réservations que vous perdez chaque été',
    text: `Bonjour,

J'ai analysé votre site Atlantic Pirogue, et je voulais vous partager quelques observations directes.

Votre site date de 2014. Sur mobile, il est difficile à utiliser — or aujourd'hui, plus de 70 % des recherches touristiques se font sur smartphone. Un visiteur qui galère sur votre site repart en 10 secondes.

Ensuite, il n'y a pas de système de réservation en ligne. En pleine saison estivale, les touristes cherchent à réserver leur sortie en pirogue le soir même ou le matin avant de partir. Si vous n'avez pas de bouton "Réserver", ils réservent chez un concurrent qui l'a.

Enfin, aucun avis client n'est mis en avant. Les avis Google sont souvent le premier déclencheur de confiance pour un touriste qui découvre votre activité.

Je suis développeur web basé à Anglet et je travaille avec des prestataires d'activités nautiques et de loisirs dans le Pays Basque. Je pourrais vous créer un site rapide, adapté mobile, avec réservation en ligne intégrée — pour que l'été prochain, vous ne laissiez plus filer aucune réservation.

Si vous souhaitez qu'on en parle, je suis disponible à votre convenance.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'emilielerecouvreux@hotmail.com',
    subject: "Chambre d'hôtes à Anglet — récupérez vos réservations directes",
    text: `Bonjour Madame,

J'ai découvert votre chambre d'hôtes à Anglet et je vous écris parce que je pense pouvoir vous aider à économiser plusieurs centaines d'euros par mois.

En ce moment, si vos réservations passent par Booking.com ou Airbnb, vous reversez entre 15 et 20 % de chaque nuitée à ces plateformes. Sur une saison, ça représente souvent 1 500 à 3 000 € qui partent directement en commission.

Avec un site web qui vous appartient, vous récupérez ces réservations directement — sans intermédiaire, sans commission. Vos clients peuvent vous contacter, voir les photos de vos chambres, consulter vos disponibilités et réserver directement chez vous.

Un site bien fait vous coûte une seule fois. Les économies sur les commissions, elles, continuent chaque année.

Je suis développeur web basé à Anglet. Je crée des sites pour des hébergements indépendants du Pays Basque — clairs, beaux sur mobile, avec un calendrier de réservation directe. Si vous souhaitez voir ce que ça pourrait donner pour votre chambre d'hôtes, je suis disponible pour en discuter sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'thomas.btzpro@gmail.com',
    subject: 'BTZ Biarritz — une erreur sur votre site qui fait fuir les clients',
    text: `Bonjour,

Je vous contacte parce que j'ai visité votre site BTZ Biarritz et j'ai constaté une erreur technique visible qui nuit directement à votre image : un message "Liquid error" s'affiche sur certaines pages.

Pour un visiteur qui ne connaît pas encore votre boutique, ce type d'erreur technique crée immédiatement une impression négative — et la plupart repartent sans aller plus loin.

Au-delà de ce bug, j'ai aussi noté que le site n'affiche pas d'avis clients et n'est pas bien positionné sur Google pour des recherches comme "surf shop Biarritz" ou "proshop bodyboard Pays Basque". Ce sont des requêtes tapées par des clients locaux et des touristes qui cherchent exactement ce que vous vendez.

Je suis développeur web basé à Anglet. Je pourrais corriger ces problèmes techniques et travailler le référencement local de votre site pour que vous apparaissiez en bonne position sur Google — et que vos clients vous trouvent avant vos concurrents.

Si vous voulez qu'on en discute, je suis disponible à votre convenance.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'cenoteplaisiranglet@outlook.fr',
    subject: 'Cénote Plaisir — vos clientes ne trouvent pas vos tarifs',
    text: `Bonjour,

J'ai visité le site de Cénote Plaisir et j'ai noté un point qui freine probablement vos inscriptions : les tarifs ne sont pas affichés directement sur le site.

Quand une cliente arrive sur votre site et ne trouve pas les prix, elle doit soit vous appeler, soit envoyer un message — et beaucoup ne le font pas. Elles vont simplement regarder ailleurs. Afficher clairement vos prix enlève ce frein et convertit beaucoup plus de visites en inscriptions.

J'ai aussi remarqué que les réservations passent par un lien externe. Intégrer directement un système de réservation dans votre site — avec vos créneaux disponibles — évite les abandons à mi-parcours et vous donne une image plus professionnelle.

Enfin, les photos de vos séances et de l'ambiance de l'espace sont le premier facteur de décision pour vos clientes. Un site avec de belles photos de l'expérience convertit beaucoup mieux.

Je suis développeur web basé à Anglet. Je travaille avec des prestataires bien-être et sports aquatiques du Pays Basque. Si vous souhaitez qu'on en parle, je peux vous montrer concrètement ce que je ferais pour votre site.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'etchebri@gmail.com',
    subject: 'Villa Etchebri — vos photos ne s\'affichent pas sur votre site',
    text: `Bonjour,

Je vous contacte suite à la visite de votre site Villa Etchebri, et j'ai remarqué un problème concret : le slider de photos en page d'accueil ne fonctionne pas — les images ne s'affichent pas correctement.

Pour un hébergement, les photos sont le premier critère de décision. Si vos visiteurs arrivent sur votre site et ne voient pas de belles images de la villa, ils repartent sans réserver — même si la réalité est bien plus belle que ce que votre site montre.

J'ai également noté que les tarifs ne sont pas clairement visibles, et que votre référencement local sur Google peut être amélioré pour que vous apparaissiez sur des recherches comme "villa location Biarritz" ou "hébergement Pays Basque".

Je suis développeur web basé à Anglet. Je pourrais corriger ce problème technique, mettre en valeur vos photos, clarifier vos tarifs et améliorer votre visibilité sur Google — pour que votre site devienne un vrai outil de réservation directe.

Si vous souhaitez en discuter, je suis disponible sans engagement.

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
      // Pause 2s entre chaque envoi pour éviter le rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`❌ Échec → ${email.to} : ${err.message}`);
      failed++;
    }
  }

  console.log(`\nRésultat : ${success} envoyés, ${failed} échecs`);
}

sendAll();
