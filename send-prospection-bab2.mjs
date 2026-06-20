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
    to: 'vaguebasque@yahoo.fr',
    subject: 'La Vague Basque — votre site mérite une mise à jour',
    text: `Bonjour,

J'ai visité votre site La Vague Basque et j'ai beaucoup de respect pour ce que vous faites — plus de vingt ans d'enseignement du surf à la Côte des Basques, c'est une vraie référence.

Justement, je pense que votre site web ne reflète pas encore ce niveau d'excellence. J'ai identifié trois points concrets qui peuvent vous faire perdre des clients chaque semaine :

1. Design vieillissant
Votre site utilise une charte graphique datée qui contraste avec l'image dynamique du surf. Un visiteur qui compare plusieurs écoles en ligne sera davantage attiré par le site le plus moderne et rassurant. Aujourd'hui, l'apparence d'un site, c'est votre vitrine.

2. Peu d'avis clients mis en avant
Les avis et témoignages sont le premier déclencheur de confiance pour un touriste ou un parent qui cherche une école de surf. Un emplacement dédié aux avis sur votre site renforcerait immédiatement votre crédibilité.

3. Référencement Google perfectible
Votre site n'exploite pas tout son potentiel SEO local. Des optimisations ciblées sur des recherches comme "cours de surf Biarritz" ou "école de surf Côte des Basques" vous permettraient d'apparaître en meilleure position et de capter plus de clients organiquement.

Je suis développeur web basé à Anglet. Je travaille avec des prestataires d'activités sportives et nautiques du Pays Basque. Si vous souhaitez qu'on échange sur ce que je pourrais faire pour votre site, je suis disponible sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@ecoledesurf-rainbow.com',
    subject: 'École Rainbow — vos tarifs sont introuvables en ligne',
    text: `Bonjour,

J'ai visité votre site École de Surf Rainbow à Anglet et j'ai repéré un problème précis qui vous coûte probablement des inscriptions : il n'y a aucun tarif affiché sur le site.

Quand un touriste ou un parent cherche une école de surf depuis son téléphone, la première chose qu'il regarde, c'est le prix. Si votre site ne l'affiche pas, il passe à la prochaine école — celle qui lui donne l'information directement.

J'ai aussi remarqué :

- Pas de réservation en ligne directe. Un système de réservation intégré avec créneaux disponibles permettrait à vos clients de s'inscrire à tout moment, même le soir depuis leur mobile.
- Pas d'avis clients visibles. La certification Fédération Française de Surf que vous affichez est un vrai atout — mais sans témoignages concrets de clients satisfaits, ce signal de confiance reste sous-exploité.

Je suis développeur web basé à Anglet. Je construis des sites pour des écoles de surf et activités nautiques du Pays Basque. Je peux vous créer un site clair, avec tarifs visibles et réservation directe.

Si vous souhaitez voir ce que ça donnerait pour votre école, je suis disponible pour en discuter.

Cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'hello@ona-pilates.com',
    subject: 'ONA Studio — vos clients doivent télécharger une app pour réserver',
    text: `Bonjour,

J'ai visité votre site ONA Studio et le concept est vraiment bien positionné — Pilates, Reformer et Yoga à Anglet, dans un cadre soigné. Votre offre est solide.

Cependant, j'ai identifié un frein important : pour réserver un cours, vos visiteurs doivent télécharger votre application mobile. C'est une étape supplémentaire que beaucoup de personnes n'effectueront pas — surtout les nouveaux clients qui découvrent votre studio pour la première fois.

Un système de réservation directement intégré à votre site (sans appli à installer) réduirait ce frein et convertirait plus de visiteurs en clients réels.

Par ailleurs, votre site ne propose pas encore d'avis clients visibles. Dans le secteur du bien-être, les témoignages sont un facteur de décision majeur — une personne qui hésite entre deux studios ira naturellement vers celui dont les avis clients sont les plus visibles.

Je suis développeur web basé à Anglet. Je pourrais intégrer un système de réservation web fluide et une section témoignages sur votre site, sans modifier l'esthétique que vous avez construite.

Si cela vous intéresse, je suis disponible pour en parler sans engagement.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'contact@latelier-pilates64.fr',
    subject: "L'Atelier Pilates — vos tarifs ne s'affichent pas en page d'accueil",
    text: `Bonjour,

J'ai visité le site de L'Atelier Pilates à Anglet et j'ai noté un point qui freine probablement vos inscriptions : les tarifs ne sont pas visibles directement depuis la page d'accueil.

Un visiteur qui arrive pour la première fois sur votre site veut savoir rapidement si votre offre correspond à son budget. S'il doit chercher ou cliquer plusieurs fois pour trouver les prix, il risque de repartir sans s'inscrire.

J'ai aussi observé que le design général du site commence à dater, et que la section avis clients est absente. Dans un secteur aussi personnel que le Pilates, les témoignages de clientes satisfaites sont souvent le déclencheur final d'une inscription.

Je suis développeur web basé à Anglet. Je pourrais moderniser votre site, rendre les tarifs et créneaux plus accessibles, et intégrer une section témoignages — tout en conservant votre identité visuelle.

Si vous souhaitez qu'on en discute, je suis disponible à votre convenance.

Bien cordialement,
KITEZE NGOUYOMBO Donald Chrysostome
Développeur web — Anglet
kitzdon37@gmail.com`,
  },
  {
    to: 'kass@konceptraining.fr',
    subject: 'Konceptraining — votre site donne l\'impression que l\'activité est à l\'arrêt',
    text: `Bonjour Kass,

J'ai visité votre site Konceptraining et votre offre de coaching est sérieuse — Personal Training, Boxe, préparation physique à Anglet. Vous avez clairement les compétences.

Mais votre site envoie un signal qui nuit à votre image : le dernier article de blog date de juin 2021. Pour un visiteur qui ne vous connaît pas encore, un site sans activité visible depuis plusieurs années donne l'impression que le coach est peut-être parti ou que l'activité tourne au ralenti.

J'ai aussi remarqué que les tarifs sont cachés derrière un lien séparé que beaucoup de visiteurs ne trouveront pas, et que votre site fait la promotion d'une application de réservation qui n'est pas encore bien connue — ce qui crée de la friction pour les nouveaux clients.

Un site simple, à jour, avec vos tarifs affichés clairement, des témoignages de clients et une prise de contact rapide serait bien plus efficace pour convertir vos visiteurs en clients.

Je suis développeur web basé à Anglet. Si vous voulez qu'on en parle, je suis disponible sans engagement.

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
