// Réponses de secours du chatbot, utilisées quand l'IA (API Anthropic) ne répond pas :
// crédit épuisé, panne, clé absente… Le visiteur obtient toujours une réponse utile.

type Intent = { keywords: string[]; answer: string };

// Normalise : minuscules, sans accents ni ponctuation
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

const INTENTS: Intent[] = [
  {
    keywords: ["postul", "candidat", "appliquer", "envoyer mon cv", "repondre a une offre"],
    answer:
      "Pour postuler, c'est simple :\n- Créez un compte candidat sur /inscription\n- Choisissez une offre sur /emplois\n- Cliquez sur « Postuler », joignez votre CV (PDF ou Word) et une courte lettre de motivation\n\nVous suivez ensuite vos candidatures dans votre espace, rubrique « Mes candidatures ». Les recruteurs ont 10 jours pour répondre.",
  },
  {
    keywords: ["publier", "offre d emploi", "recrut", "poster une offre", "embaucher", "annonce"],
    answer:
      "Pour publier une offre :\n- Créez un compte recruteur sur /inscription (« Je recrute »)\n- Dans votre tableau de bord, cliquez sur « Publier une offre »\n\n🎉 La publication est gratuite jusqu'à fin novembre 2026. Les candidatures arrivent ensuite dans « Candidatures reçues », triées automatiquement.",
  },
  {
    keywords: ["tarif", "prix", "abonnement", "plan", "combien", "payer", "paiement", "orange money", "airtel"],
    answer:
      "Les abonnements recruteurs démarrent à 10 000 XAF/mois (plan Micro), sans engagement. Le paiement se fait par Orange Money ou Airtel Money, avec une activation sous 24 h.\n\nTous les détails sont sur /tarifs. Et la publication est gratuite jusqu'à fin novembre 2026 !",
  },
  {
    keywords: ["salaire", "remuneration", "paye", "combien gagne"],
    answer:
      "Vous trouverez les grilles de salaires par métier et par secteur en Centrafrique sur /salaires. C'est utile pour négocier ou vérifier qu'une offre est dans les prix du marché 💰",
  },
  {
    keywords: ["cv", "curriculum"],
    answer:
      "Quelques conseils pour un CV qui marque :\n- 1 à 2 pages maximum, clair et aéré\n- Commencez par vos expériences les plus récentes, avec des résultats concrets\n- Adaptez-le à chaque offre en reprenant les mots-clés de l'annonce\n- Ajoutez un numéro joignable et une adresse email professionnelle\n\nVous pouvez créer votre CV directement dans votre espace, rubrique « Mon CV ».",
  },
  {
    keywords: ["lettre de motivation", "lettre"],
    answer:
      "Pour une bonne lettre de motivation :\n- Courte : 3 paragraphes suffisent\n- Expliquez pourquoi ce poste et cette entreprise vous intéressent\n- Donnez 1 ou 2 exemples concrets de ce que vous avez réussi\n- Terminez en proposant un entretien\n\nÉvitez les lettres génériques : les recruteurs le voient tout de suite.",
  },
  {
    keywords: ["entretien", "interview"],
    answer:
      "Pour préparer un entretien :\n- Renseignez-vous sur l'entreprise et relisez l'offre\n- Préparez 2 ou 3 exemples concrets de vos réussites\n- Préparez des questions à poser au recruteur\n- Soyez à l'heure et dans une tenue soignée\n\nPlus de conseils sur /blog. Bonne chance 💪",
  },
  {
    keywords: ["mot de passe", "connecter", "connexion", "identifiant", "acces a mon compte"],
    answer:
      "Pour vous connecter, allez sur /connexion (par email ou par WhatsApp).\n\nMot de passe oublié ? Cliquez sur « Mot de passe oublié ? » sur la page de connexion : vous recevrez un lien par email pour en choisir un nouveau.",
  },
  {
    keywords: ["inscri", "creer un compte", "compte"],
    answer:
      "Créez votre compte gratuitement sur /inscription :\n- « Je cherche un emploi » si vous êtes candidat\n- « Je recrute » si vous êtes une entreprise\n\nL'inscription se fait par email ou par WhatsApp.",
  },
  {
    keywords: ["emploi", "travail", "job", "boulot", "offre", "cherche", "poste", "stage"],
    answer:
      "Toutes les offres sont sur /emplois. Vous pouvez filtrer par secteur, ville et type de contrat 🔎\n\nAstuce : créez une alerte dans votre espace (« Mes alertes ») pour recevoir les nouvelles offres qui vous correspondent.",
  },
  {
    keywords: ["entreprise", "societe", "employeur"],
    answer: "Découvrez les entreprises qui recrutent en RCA et leurs offres sur /entreprises.",
  },
  {
    keywords: ["application", "android", "mobile", "appli"],
    answer: "L'application mobile Android est en cours de développement. En attendant, le site fonctionne très bien sur téléphone 📱",
  },
  {
    keywords: ["bonjour", "salut", "bonsoir", "hello", "cc", "coucou", "slt", "bjr"],
    answer:
      "Bonjour 👋 Je peux vous aider à :\n- trouver une offre d'emploi (/emplois)\n- postuler et préparer votre CV\n- publier une offre si vous recrutez\n\nQue cherchez-vous ?",
  },
  {
    keywords: ["merci"],
    answer: "Avec plaisir ! N'hésitez pas si vous avez une autre question 😊",
  },
];

const DEFAULT_ANSWER =
  "Je n'ai pas bien compris votre question 🤔 Je peux vous renseigner sur :\n- les offres d'emploi (/emplois)\n- comment postuler ou améliorer votre CV\n- la publication d'offres et les tarifs (/tarifs)\n- les salaires en RCA (/salaires)\n\nVous pouvez aussi nous écrire directement avec le bouton WhatsApp du site.";

/** Trouve la meilleure réponse préparée pour le dernier message du visiteur. */
export function fallbackAnswer(message: string): string {
  const text = ` ${normalize(message)} `;
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const k = normalize(kw).trim();
      // mots très courts (cc, cv…) : mot entier ; sinon début de mot
      const re = k.length <= 3 ? new RegExp(`\\b${k}\\b`) : new RegExp(`\\b${k}`);
      if (re.test(text)) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  return best ? best.intent.answer : DEFAULT_ANSWER;
}
