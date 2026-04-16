export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  authorRole: string;
  coverColor: string;
  content: string;
};

export const articles: Article[] = [
  {
    id: 1,
    slug: "comment-rediger-un-cv",
    title: "Comment rédiger un CV qui se démarque en RCA",
    excerpt: "Votre CV est votre carte de visite. Découvrez les meilleures pratiques pour créer un CV percutant adapté au marché centrafricain.",
    category: "CV & Candidature",
    readTime: "5 min",
    date: "10 avril 2025",
    author: "Marie Koyambonou",
    authorRole: "Consultante RH",
    coverColor: "from-blue-500 to-blue-600",
    content: `
## Pourquoi votre CV est si important ?

En République Centrafricaine, les recruteurs reçoivent en moyenne **30 à 50 CV** pour chaque poste. Vous avez moins de **30 secondes** pour faire bonne impression. Un CV bien structuré peut faire toute la différence.

---

## 1. La structure idéale d'un CV en RCA

Un bon CV doit contenir les sections suivantes, dans cet ordre :

### En-tête
- Votre **nom complet** en grand
- Votre **titre professionnel** (ex: Comptable, Ingénieur réseau, Assistant RH)
- **Téléphone**, **Email**, **Ville** (Bangui ou autre)
- Lien LinkedIn si disponible

### Profil professionnel (3-4 lignes)
Résumez qui vous êtes et ce que vous apportez. Exemple :
> *"Comptable avec 5 ans d'expérience dans le secteur bancaire en RCA, spécialisé dans la gestion budgétaire et la conformité fiscale. Rigoureux et orienté résultats."*

### Expériences professionnelles
Pour chaque poste, indiquez :
- **Titre du poste** | Nom de l'entreprise | Durée
- 2-3 **résultats concrets** (pas juste des tâches)

❌ Mauvais : *"Gérer la comptabilité"*
✅ Bon : *"Réduit les délais de clôture mensuelle de 5 jours à 2 jours grâce à l'automatisation des rapports"*

### Formation
Du plus récent au plus ancien. Mentionnez votre diplôme, l'établissement et l'année.

### Compétences
Langues (Français, Sango, Anglais…), outils informatiques, logiciels métier.

---

## 2. Les erreurs à éviter absolument

🚫 **Photo non professionnelle** — Utilisez une photo formelle, fond neutre
🚫 **CV trop long** — Maximum 2 pages pour moins de 10 ans d'expérience
🚫 **Fautes d'orthographe** — Faites relire par quelqu'un
🚫 **Informations inutiles** — Pas besoin de mettre votre âge, religion ou situation familiale
🚫 **Même CV pour tous les postes** — Adaptez votre CV à chaque offre

---

## 3. Adapter votre CV selon le secteur

### Humanitaire / ONG (PNUD, CICR, MSF...)
Mettez en avant : langues parlées, expériences terrain, disponibilité pour voyager

### Banque / Finance (Ecobank, BSCA...)
Mettez en avant : certifications comptables, logiciels (SAP, SAGE), rigueur

### Télécoms / IT (Airtel, SOCATEL...)
Mettez en avant : certifications techniques, projets réalisés, technologies maîtrisées

---

## 4. Le format et la présentation

- **Police** : Arial, Calibri ou Times New Roman, taille 10-12
- **Format** : PDF (jamais Word, ça se déforme)
- **Nom du fichier** : \`CV_Prénom_Nom.pdf\` — pas \`CV_final_v3_2.pdf\` !
- **Couleurs** : Sobre, une couleur d'accent maximum

---

## 5. Exemple de structure en 1 page

\`\`\`
JEAN MBAYE
Développeur Web | Bangui | +236 72 00 00 00 | jean@email.com

PROFIL
Développeur web avec 3 ans d'expérience, spécialisé React et Node.js.
Passionné par les solutions numériques adaptées au contexte africain.

EXPÉRIENCES
Développeur Front-end | Société X | Jan 2022 – Présent
• Développé 5 applications web utilisées par +200 utilisateurs
• Réduit le temps de chargement des pages de 40%

FORMATION
Licence Informatique | Université de Bangui | 2021

COMPÉTENCES
Langues: Français (courant), Sango (natif), Anglais (intermédiaire)
Tech: React, Node.js, JavaScript, Git, MySQL
\`\`\`

---

## En résumé

✅ Structurez votre CV clairement
✅ Quantifiez vos résultats
✅ Adaptez-le à chaque poste
✅ Envoyez-le en PDF
✅ Soignez la présentation visuelle

Votre CV est votre premier pas vers l'emploi de vos rêves. Prenez le temps de le peaufiner !
    `,
  },
  {
    id: 2,
    slug: "reussir-son-entretien",
    title: "Réussir son entretien d'embauche : 10 conseils essentiels",
    excerpt: "L'entretien est votre chance de briller. Préparez-vous efficacement avec ces conseils pratiques testés par des professionnels RH.",
    category: "Entretien",
    readTime: "7 min",
    date: "5 avril 2025",
    author: "Patrick Ngaïssona",
    authorRole: "Directeur RH",
    coverColor: "from-orange-500 to-amber-500",
    content: `
## L'entretien d'embauche : un moment décisif

Un entretien, c'est une rencontre humaine. Le recruteur cherche à savoir **si vous pouvez faire le travail**, **si vous vous intégrerez dans l'équipe** et **si vous êtes motivé**. Voici comment vous y préparer.

---

## Conseil 1 : Préparez-vous sur l'entreprise

Avant l'entretien, renseignez-vous sur :
- L'activité principale de l'entreprise
- Ses projets récents
- Sa culture et ses valeurs

Un recruteur est toujours impressionné par un candidat qui connaît son entreprise.

---

## Conseil 2 : Relisez l'offre d'emploi

Identifiez les **compétences clés** demandées et préparez des exemples concrets qui prouvent que vous les possédez.

---

## Conseil 3 : Préparez vos réponses aux questions classiques

### "Parlez-moi de vous"
Structurez en 3 parties : **Formation → Expériences → Motivation**
*Durée : 2-3 minutes maximum*

### "Quels sont vos points faibles ?"
Choisissez un vrai défaut que vous avez travaillé à améliorer.
❌ *"Je suis perfectionniste"* (trop banal)
✅ *"J'avais du mal à déléguer, j'ai travaillé dessus en formant mon équipe"*

### "Pourquoi voulez-vous ce poste ?"
Montrez votre **motivation sincère** + ce que vous apportez.

### "Où vous voyez-vous dans 5 ans ?"
Montrez de l'ambition, mais en cohérence avec le poste.

---

## Conseil 4 : La règle STAR pour répondre aux questions

Pour toute question comportementale (*"Donnez un exemple de..."*) :
- **S**ituation — contexte
- **T**âche — votre rôle
- **A**ction — ce que vous avez fait
- **R**ésultat — le résultat obtenu

---

## Conseil 5 : Soignez votre apparence

- Tenue **professionnelle et propre** (costume ou tailleur)
- Chaussures cirées
- Pas de parfum excessif
- Téléphone en silencieux

---

## Conseil 6 : Arrivez à l'heure (ou en avance)

Planifiez d'arriver **10-15 minutes avant**. En cas d'imprévu, prévenez immédiatement par téléphone.

---

## Conseil 7 : Le langage corporel

- **Poignée de main** ferme
- **Regard direct** (sans fixer)
- **Posture droite**, bras non croisés
- **Souriez** naturellement

---

## Conseil 8 : Posez des questions pertinentes

À la fin, quand on vous demande si vous avez des questions, posez-en ! C'est un signe d'intérêt.

Bonnes questions :
- *"Quels sont les principaux défis du poste ?"*
- *"Comment se passe l'intégration des nouveaux collaborateurs ?"*
- *"Quelles sont les perspectives d'évolution ?"*

---

## Conseil 9 : Gérez le stress

- **Respirez profondément** avant d'entrer
- **Parlez lentement** et articulez bien
- Si vous ne comprenez pas une question, demandez à la reformuler
- Dites *"je ne sais pas, mais je peux me renseigner"* plutôt que d'inventer

---

## Conseil 10 : Le suivi après l'entretien

Envoyez un **email de remerciement** dans les 24h :
> *"Bonjour [Prénom], merci pour cet entretien enrichissant. Je reste très motivé pour rejoindre votre équipe et suis disponible pour tout complément d'information."*

---

## En résumé

La préparation est la clé. Plus vous vous préparez, plus vous serez serein le jour J. Bonne chance !
    `,
  },
  {
    id: 3,
    slug: "secteurs-qui-recrutent-rca",
    title: "Les secteurs qui recrutent le plus en RCA en 2025",
    excerpt: "Humanitaire, télécoms, finance... Découvrez quels secteurs offrent le plus d'opportunités en République Centrafricaine.",
    category: "Marché de l'emploi",
    readTime: "4 min",
    date: "28 mars 2025",
    author: "Sophie Wangué",
    authorRole: "Analyste emploi",
    coverColor: "from-purple-500 to-purple-600",
    content: `
## L'état du marché de l'emploi en RCA

La République Centrafricaine connaît une dynamique économique particulière, avec plusieurs secteurs qui offrent de réelles opportunités pour les candidats qualifiés.

---

## 1. Humanitaire & ONG — Le secteur le plus actif

La RCA accueille de nombreuses organisations internationales :
- **PNUD** (Programme des Nations Unies pour le Développement)
- **MINUSCA** (Mission de l'ONU)
- **MSF** (Médecins Sans Frontières)
- **CICR**, **UNICEF**, **PAM**, **OMS**...

**Profils recherchés :** Logisticiens, administrateurs, coordinateurs de projet, traducteurs (français/anglais/sango), agents de terrain

**Salaires :** 300 000 à 2 000 000 XAF selon le poste et l'organisation

---

## 2. Télécommunications — En pleine croissance

- **Airtel RCA** — Le principal opérateur mobile
- **SOCATEL** — Télécoms fixe et internet
- **Orange RCA** (en développement)

**Profils recherchés :** Techniciens réseau, ingénieurs télécoms, commerciaux, SAV

---

## 3. Banque & Finance — Secteur stable

- **Ecobank RCA**
- **BSCA** (Banque Sahélo-Saharienne pour le Commerce et l'Industrie)
- **BGFI Bank**
- Microfinances locales

**Profils recherchés :** Comptables, auditeurs, chargés de clientèle, analystes crédit

---

## 4. Santé — Demande permanente

Avec les défis sanitaires du pays, les professionnels de santé sont très recherchés :
- Médecins généralistes et spécialistes
- Infirmiers et sage-femmes
- Pharmaciens
- Techniciens de laboratoire

---

## 5. Éducation & Formation

- Enseignants (primaire, secondaire, supérieur)
- Formateurs professionnels
- Directeurs d'établissement

Les établissements privés recrutent activement.

---

## 6. BTP & Construction

Avec les projets de reconstruction nationale :
- Ingénieurs civils et BTP
- Architectes
- Conducteurs de travaux
- Techniciens en génie civil

---

## 7. Agriculture & Agroalimentaire

La RCA a un fort potentiel agricole :
- Agronomes
- Techniciens agricoles
- Gestionnaires de projets agricoles

---

## Conseils pour maximiser vos chances

1. **Apprenez l'anglais** — Indispensable pour les ONG et multinationales
2. **Maîtrisez le français écrit** — Les rapports et emails sont en français
3. **Certifications reconnues** — ACCA pour la finance, PMP pour la gestion de projet
4. **Réseau professionnel** — Beaucoup d'offres circulent par bouche-à-oreille
5. **LinkedIn** — Créez un profil professionnel visible

---

## Conclusion

Le marché de l'emploi en RCA offre des opportunités réelles, surtout pour ceux qui investissent dans leur formation et leur réseau professionnel. KTZ Emploi vous accompagne dans cette recherche !
    `,
  },
  {
    id: 4,
    slug: "rediger-lettre-de-motivation",
    title: "Rédiger une lettre de motivation convaincante",
    excerpt: "La lettre de motivation est souvent la clé d'une candidature réussie. Apprenez à structurer un message qui accroche les recruteurs.",
    category: "CV & Candidature",
    readTime: "6 min",
    date: "20 mars 2025",
    author: "Marie Koyambonou",
    authorRole: "Consultante RH",
    coverColor: "from-green-500 to-emerald-600",
    content: `
## Pourquoi la lettre de motivation ?

Alors que le CV dit **ce que vous avez fait**, la lettre de motivation explique **pourquoi vous voulez ce poste** et **ce que vous apportez spécifiquement à cette entreprise**. C'est votre chance de vous exprimer au-delà des cases.

---

## La structure parfaite en 3 paragraphes

### Paragraphe 1 — L'accroche (3-4 lignes)
Montrez que vous connaissez l'entreprise et expliquez pourquoi ce poste vous attire.

> *"Votre organisation occupe une place centrale dans le développement économique de la RCA. En tant que comptable passionné par la transparence financière, rejoindre votre équipe représente pour moi bien plus qu'un emploi : c'est l'occasion de contribuer à une mission qui a du sens."*

### Paragraphe 2 — Votre valeur ajoutée (4-5 lignes)
Reliez vos compétences aux besoins du poste. Citez 2-3 réalisations concrètes.

> *"Fort de 4 ans d'expérience en gestion comptable, j'ai notamment optimisé les processus de clôture mensuelle chez [Entreprise X], réduisant les délais de 8 à 3 jours. Je maîtrise les logiciels SAGE et SAP, outils que j'utilise quotidiennement."*

### Paragraphe 3 — La conclusion (2-3 lignes)
Exprimez votre enthousiasme et proposez un entretien.

> *"Convaincu que mon profil correspond à vos attentes, je serais ravi d'échanger lors d'un entretien à votre convenance. Je reste disponible au [téléphone] ou par email."*

---

## Les règles d'or

✅ **Maximum 1 page** — Les recruteurs ne lisent pas les romans
✅ **Personnalisée** — Jamais la même lettre pour deux entreprises
✅ **Ton professionnel** mais **humain** — Pas de langage trop formel ou robotique
✅ **Pas de répétition du CV** — La lettre complète, elle ne répète pas
✅ **Relecture obligatoire** — Zéro faute d'orthographe

---

## Les erreurs classiques

❌ *"Je vous écris pour postuler au poste de..."* — Commence directement, pas par une évidence
❌ *"Je suis dynamique, sérieux et motivé"* — Tout le monde dit ça, prouvez-le !
❌ *"Je n'ai pas d'expérience mais..."* — Ne commencez jamais par vos faiblesses
❌ *"Veuillez agréer, Monsieur/Madame, l'expression de mes salutations distinguées"* — Trop formel, trop long

---

## Formule de politesse moderne

> *"Dans l'attente de votre retour, je vous adresse mes cordiales salutations."*

---

## Exemple complet

\`\`\`
Bangui, le 15 avril 2025

Objet : Candidature au poste de Chargé de communication

Madame, Monsieur,

Votre organisation joue un rôle majeur dans la communication
institutionnelle en Centrafrique. C'est avec un vif intérêt que
je postule au poste de Chargé de communication, convaincu que
mon profil correspond à vos besoins.

Au cours de mes 3 années chez [Entreprise], j'ai géré les
réseaux sociaux (passant de 500 à 8 000 abonnés), rédigé
des communiqués de presse et organisé 12 événements
institutionnels. Ma maîtrise de Canva, WordPress et du
storytelling me permet de créer des contenus à fort impact.

Je serais heureux d'échanger lors d'un entretien à votre
convenance. Disponible au +236 72 000 000.

Cordiales salutations,
Jean Mbaye
\`\`\`

---

Votre lettre est prête. N'oubliez pas : soyez vous-même, soyez précis et montrez votre enthousiasme sincère !
    `,
  },
  {
    id: 5,
    slug: "negocier-son-salaire",
    title: "Négocier son salaire : guide complet pour la RCA",
    excerpt: "Savoir négocier sa rémunération est une compétence essentielle. Voici comment aborder cette discussion avec confiance.",
    category: "Carrière",
    readTime: "8 min",
    date: "15 mars 2025",
    author: "Armand Bello",
    authorRole: "Coach carrière",
    coverColor: "from-yellow-500 to-orange-500",
    content: `
## La négociation salariale : un droit, pas une impolitesse

Beaucoup de candidats n'osent pas négocier leur salaire par peur de "déranger" ou de perdre l'offre. C'est une erreur ! Les recruteurs **s'attendent à une négociation** et respectent les candidats qui connaissent leur valeur.

---

## Étape 1 : Connaître les salaires du marché en RCA

Avant de négocier, renseignez-vous sur les fourchettes de salaires par secteur :

| Secteur | Débutant | Confirmé (5 ans+) |
|---------|----------|-------------------|
| Humanitaire/ONG | 400 000 XAF | 1 200 000+ XAF |
| Banque/Finance | 300 000 XAF | 800 000 XAF |
| Télécoms/IT | 350 000 XAF | 1 000 000 XAF |
| Santé (privé) | 250 000 XAF | 700 000 XAF |
| Éducation | 150 000 XAF | 400 000 XAF |
| Administration | 200 000 XAF | 500 000 XAF |

*Ces chiffres sont indicatifs et varient selon l'entreprise.*

---

## Étape 2 : Connaître votre valeur

Avant la négociation, listez :
- Vos **diplômes et certifications**
- Vos **années d'expérience**
- Vos **réalisations chiffrées**
- Vos **compétences rares** (langues étrangères, logiciels spécialisés)

---

## Étape 3 : Choisir le bon moment

Le meilleur moment pour négocier ? **Quand on vous fait une offre**, pas avant.

Si on vous demande vos prétentions en entretien :
> *"Je préfère d'abord mieux comprendre les responsabilités du poste avant d'avancer un chiffre. Quelle est la fourchette prévue pour ce poste ?"*

---

## Étape 4 : La technique du "silence"

Quand vous annoncez votre chiffre, **taisez-vous**. Ne remplissez pas le silence avec des justifications. Laissez le recruteur répondre.

---

## Étape 5 : Formuler sa demande

### Script simple et efficace

> *"Sur la base de mon expérience de [X ans] et de mes compétences en [domaine], et compte tenu du niveau de responsabilités décrit, j'envisageais une rémunération autour de [votre chiffre]. Est-ce que cela correspond à votre budget ?"*

**Astuce :** Donnez un chiffre légèrement supérieur à votre minimum pour avoir de la marge.

---

## Et si la réponse est non ?

Si le budget est vraiment fixe, négociez les **avantages** :
- Jours de congé supplémentaires
- Formation payée par l'entreprise
- Possibilité d'évolution salariale à 6 mois
- Prime de performance
- Téléphone ou véhicule de service

---

## Ce qu'il ne faut jamais faire

❌ Mentir sur votre salaire actuel
❌ Accepter sans réfléchir, puis regretter
❌ Donner un chiffre trop bas par peur
❌ Négocier par email (faites-le en face à face ou par téléphone)

---

## Conclusion

Négocier son salaire, ça se prépare comme un entretien. Connaissez votre valeur, préparez vos arguments, et ayez confiance en vous. Vous le méritez !
    `,
  },
  {
    id: 6,
    slug: "se-reconvertir-professionnellement",
    title: "Se reconvertir professionnellement en RCA : par où commencer ?",
    excerpt: "Changer de carrière peut être intimidant, mais avec la bonne approche, c'est tout à fait réalisable. Voici les étapes clés.",
    category: "Carrière",
    readTime: "10 min",
    date: "8 mars 2025",
    author: "Sophie Wangué",
    authorRole: "Analyste emploi",
    coverColor: "from-pink-500 to-rose-600",
    content: `
## La reconversion : un nouveau départ possible à tout âge

Que vous ayez 25 ou 45 ans, changer de secteur d'activité est possible. En RCA, certains secteurs comme l'IT, l'humanitaire et la finance recrutent des profils variés et sont ouverts aux reconversions.

---

## Étape 1 : Pourquoi vous reconvertir ?

Posez-vous ces questions honnêtement :
- Je manque de **motivation** dans mon travail actuel ?
- Mon secteur offre **peu de perspectives** ?
- J'ai une **passion** que je veux transformer en métier ?
- Je cherche un **meilleur salaire** ou plus de **stabilité** ?

Identifier la vraie raison vous aidera à choisir la bonne direction.

---

## Étape 2 : Identifier vos compétences transférables

Vos expériences passées ont de la valeur partout. Exemples :

| Vous venez de... | Vous pouvez aller vers... |
|-----------------|--------------------------|
| Enseignement | Formation professionnelle, RH |
| Comptabilité | Finance ONG, audit |
| Journalisme | Communication, marketing |
| Militaire/Police | Sécurité privée, logistique ONG |
| Agriculture | Gestion de projets agricoles |

---

## Étape 3 : Se former

En RCA, plusieurs options existent :

### Formations courtes (3-6 mois)
- Informatique et bureautique
- Comptabilité (SAGE, SAP)
- Anglais professionnel
- Gestion de projet

### Certifications internationales reconnues
- **PMP** (Project Management Professional)
- **ACCA** (comptabilité internationale)
- **Google certifications** (marketing digital, IT support)
- **Coursera / edX** — Des milliers de cours en ligne gratuits

---

## Étape 4 : Construire son réseau dans le nouveau secteur

- **LinkedIn** : Connectez-vous avec des professionnels du secteur cible
- **Associations professionnelles** : Rejoignez les associations de votre secteur cible
- **Bénévolat** : Offrez vos services gratuitement pour acquérir de l'expérience

---

## Étape 5 : Adapter votre CV et votre discours

Dans votre CV et entretien, mettez en avant :
- Vos **compétences transférables**
- Votre **motivation sincère** pour le nouveau secteur
- Les **formations** que vous avez suivies
- Les **projets personnels** liés au nouveau domaine

---

## Étape 6 : Accepter de recommencer (temporairement)

Une reconversion peut signifier un salaire inférieur au départ. C'est souvent temporaire. Planifiez financièrement cette transition.

---

## Les métiers d'avenir en RCA

Si vous cherchez où vous orienter, voici les secteurs porteurs :

🌐 **IT & Numérique** — Développeurs, data analysts, cybersécurité
🤝 **Humanitaire** — Coordinateurs projet, logisticiens
💊 **Santé** — Toujours en demande
💰 **Finance & Microfinance** — Expansion des services financiers
🌱 **Agro-industrie** — Transformation agricole en plein essor

---

## Conclusion

Une reconversion réussie demande du temps, de la préparation et de la persévérance. Mais des centaines de professionnels en RCA l'ont fait. Vous pouvez y arriver aussi !
    `,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
