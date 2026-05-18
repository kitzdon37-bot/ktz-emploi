import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const existing = await prisma.blogPost.findUnique({ where: { slug: base } });
  return existing ? `${base}-${Date.now()}` : base;
}

const articles = [
  {
    title: "Comment rédiger un CV percutant pour le marché de l'emploi en RCA",
    category: "Conseils",
    excerpt: "Votre CV est votre première carte de visite. Découvrez comment le rédiger pour retenir l'attention des recruteurs centrafricains.",
    content: `<h2>Pourquoi votre CV est crucial</h2>
<p>En République Centrafricaine, le marché de l'emploi est compétitif. Un recruteur passe en moyenne <strong>30 secondes</strong> sur un CV avant de décider s'il mérite une lecture approfondie. Chaque détail compte.</p>

<h2>1. Soignez la structure</h2>
<p>Un bon CV doit suivre une structure claire et aérée :</p>
<ul>
  <li><strong>Informations personnelles</strong> : nom, prénom, téléphone, email, ville</li>
  <li><strong>Résumé professionnel</strong> : 2 à 3 lignes percutantes sur votre profil</li>
  <li><strong>Expériences professionnelles</strong> : du plus récent au plus ancien</li>
  <li><strong>Formation</strong> : diplômes et certifications</li>
  <li><strong>Compétences</strong> : techniques et comportementales</li>
  <li><strong>Langues</strong> : français, sango, anglais, etc.</li>
</ul>

<h2>2. Personnalisez pour chaque offre</h2>
<p>Évitez d'envoyer le même CV à tous les employeurs. Adaptez votre résumé et vos compétences aux exigences spécifiques de chaque poste. Lisez attentivement la description du poste et utilisez les mêmes mots-clés.</p>

<h2>3. Quantifiez vos réalisations</h2>
<p>Au lieu d'écrire <em>"J'ai géré une équipe"</em>, préférez <em>"J'ai géré une équipe de 8 personnes, augmentant la productivité de 25%"</em>. Les chiffres parlent d'eux-mêmes.</p>

<h2>4. Évitez les erreurs courantes</h2>
<ul>
  <li>Fautes d'orthographe (relisez-vous plusieurs fois)</li>
  <li>Photo non professionnelle</li>
  <li>CV trop long (maximum 2 pages)</li>
  <li>Informations obsolètes</li>
  <li>Adresse email peu sérieuse</li>
</ul>

<h2>5. Format et présentation</h2>
<p>Envoyez toujours votre CV en <strong>PDF</strong> pour conserver la mise en page. Nommez votre fichier de façon professionnelle : <em>CV_Prénom_Nom_Poste.pdf</em>.</p>

<p>Avec KTZ Emploi, vous pouvez créer et publier votre profil directement en ligne pour être visible auprès des meilleurs recruteurs de Centrafrique.</p>`,
  },
  {
    title: "Les secteurs qui recrutent le plus en Centrafrique en 2025",
    category: "Marché de l'emploi",
    excerpt: "Quels sont les domaines d'activité offrant le plus d'opportunités en RCA cette année ? Tour d'horizon des secteurs porteurs.",
    content: `<h2>Un marché en pleine transformation</h2>
<p>Malgré les défis structurels, la République Centrafricaine connaît une dynamique de développement portée par plusieurs secteurs clés. En 2025, certains domaines se distinguent par leur capacité à créer de l'emploi.</p>

<h2>1. Les Organisations Internationales et ONG</h2>
<p>Les Nations Unies, l'Union Européenne, MSF, IRC, NRC et des dizaines d'autres organisations sont fortement présentes en RCA. Elles recherchent en permanence des profils locaux dans :</p>
<ul>
  <li>Logistique et gestion des stocks</li>
  <li>Suivi-évaluation (MEAL)</li>
  <li>Ressources humaines</li>
  <li>Finance et comptabilité</li>
  <li>Communication</li>
</ul>

<h2>2. Le secteur des Télécommunications</h2>
<p>Orange, Telecel et les acteurs du digital continuent de recruter des techniciens réseau, des commerciaux terrain, des agents service client et des développeurs.</p>

<h2>3. Le BTP et les Infrastructures</h2>
<p>Avec les projets de reconstruction et les financements internationaux, le secteur du bâtiment offre de nombreuses opportunités pour les ingénieurs, techniciens et ouvriers qualifiés.</p>

<h2>4. La Santé</h2>
<p>Médecins, infirmiers, sages-femmes, laborantins et agents de santé communautaire sont très recherchés, tant dans le public que dans les structures ONG.</p>

<h2>5. L'Éducation</h2>
<p>Les enseignants qualifiés, les directeurs d'établissement et les formateurs professionnels sont en forte demande, particulièrement dans les zones hors de Bangui.</p>

<h2>6. La Finance et la Microfinance</h2>
<p>Les banques commerciales, CMCA, Ecobank et les institutions de microfinance recrutent des caissiers, agents de crédit et responsables commerciaux.</p>

<h2>Comment saisir ces opportunités ?</h2>
<p>Inscrivez-vous sur <strong>KTZ Emploi</strong>, créez un profil complet et activez les alertes emploi pour recevoir les offres correspondant à votre domaine directement dans votre boîte mail.</p>`,
  },
  {
    title: "Réussir son entretien d'embauche : les 10 règles d'or",
    category: "Conseils",
    excerpt: "L'entretien d'embauche est une étape décisive. Voici les conseils pratiques pour faire bonne impression et décrocher le poste.",
    content: `<h2>La préparation fait la différence</h2>
<p>Un entretien réussi ne s'improvise pas. Il se prépare méthodiquement. Voici les 10 règles qui font la différence.</p>

<h2>1. Renseignez-vous sur l'entreprise</h2>
<p>Avant l'entretien, documentez-vous sur l'organisation : son activité, ses projets, ses valeurs. Cette connaissance vous permettra de poser des questions pertinentes et de montrer votre motivation réelle.</p>

<h2>2. Préparez vos réponses aux questions classiques</h2>
<ul>
  <li><em>"Parlez-moi de vous"</em></li>
  <li><em>"Quelles sont vos forces et faiblesses ?"</em></li>
  <li><em>"Pourquoi voulez-vous rejoindre notre organisation ?"</em></li>
  <li><em>"Où vous voyez-vous dans 5 ans ?"</em></li>
</ul>

<h2>3. Soignez votre tenue vestimentaire</h2>
<p>Habillez-vous de façon professionnelle et adaptée à la culture de l'organisation. Dans le doute, optez pour une tenue sobre et élégante.</p>

<h2>4. Arrivez à l'heure (ou en avance)</h2>
<p>Prévoyez d'arriver 10 à 15 minutes en avance. En cas d'imprévu, prévenez immédiatement.</p>

<h2>5. Adoptez le bon langage corporel</h2>
<p>Poignée de main ferme, contact visuel maintenu, posture droite sans être rigide. Votre corps communique autant que vos mots.</p>

<h2>6. Utilisez la méthode STAR</h2>
<p>Pour répondre aux questions comportementales : <strong>S</strong>ituation, <strong>T</strong>âche, <strong>A</strong>ction, <strong>R</strong>ésultat. Vos exemples concrets sont bien plus convaincants que des affirmations générales.</p>

<h2>7. Posez des questions intelligentes</h2>
<p>Préparez 3 à 5 questions sur le poste, l'équipe ou les projets de l'organisation. Cela montre votre intérêt et votre sérieux.</p>

<h2>8. Maîtrisez votre prétention salariale</h2>
<p>Renseignez-vous sur les grilles salariales du secteur en RCA. Donnez une fourchette réaliste et montrez votre flexibilité.</p>

<h2>9. Envoyez un message de remerciement</h2>
<p>Dans les 24h après l'entretien, envoyez un email de remerciement bref et professionnel. Ce geste vous démarquera.</p>

<h2>10. Faites le bilan</h2>
<p>Après chaque entretien, notez ce qui s'est bien passé et les points à améliorer. Chaque entretien est une expérience qui vous prépare au suivant.</p>`,
  },
  {
    title: "Employeurs : comment rédiger une offre d'emploi attractive sur KTZ Emploi",
    category: "Recrutement",
    excerpt: "Une offre bien rédigée attire les bons candidats. Guide pratique pour les recruteurs centrafricains.",
    content: `<h2>L'offre d'emploi, premier contact avec votre futur employé</h2>
<p>La qualité de votre offre d'emploi détermine directement la qualité des candidatures que vous recevrez. Une annonce vague génère des candidatures hors profil, vous faisant perdre un temps précieux.</p>

<h2>Les éléments indispensables</h2>

<h3>1. Un titre clair et précis</h3>
<p>Évitez les titres vagues. Préférez : <em>"Comptable confirmé – Bangui (H/F)"</em> ou <em>"Chargé de logistique – ONG internationale – RCA"</em>.</p>

<h3>2. Une présentation de votre organisation</h3>
<p>En 2 à 4 lignes, présentez votre entreprise : secteur, mission, taille. Les candidats veulent savoir pour qui ils vont travailler.</p>

<h3>3. Les missions du poste</h3>
<p>Listez clairement les responsabilités principales sous forme de points. Un candidat doit comprendre exactement ce qu'on attend de lui.</p>

<h3>4. Le profil recherché</h3>
<ul>
  <li>Niveau d'études requis</li>
  <li>Années d'expérience minimum</li>
  <li>Compétences techniques indispensables</li>
  <li>Qualités personnelles attendues</li>
  <li>Langues requises (français, sango, anglais…)</li>
</ul>

<h3>5. Les conditions de travail</h3>
<p>Indiquez le type de contrat, le lieu de travail et si possible une fourchette salariale. Les candidats qui postulent en connaissance de cause seront mieux motivés.</p>

<h3>6. La procédure de candidature</h3>
<p>Expliquez clairement comment postuler, quels documents fournir et la date limite.</p>

<h2>Les erreurs à éviter</h2>
<ul>
  <li>Trop d'exigences (le candidat parfait n'existe pas)</li>
  <li>Jargon interne incompréhensible</li>
  <li>Pas de localisation indiquée</li>
  <li>Offre laissée en ligne après la clôture</li>
</ul>

<p>Sur <strong>KTZ Emploi</strong>, publiez vos offres en quelques minutes et accédez à notre CVthèque pour identifier proactivement les meilleurs profils centrafricains.</p>`,
  },
  {
    title: "Télétravail en RCA : opportunités et défis pour les professionnels centrafricains",
    category: "Tendances",
    excerpt: "Le télétravail s'installe progressivement en Centrafrique. Quelles opportunités cela ouvre-t-il et comment s'y adapter ?",
    content: `<h2>Une révolution qui touche aussi la RCA</h2>
<p>Si le télétravail a explosé dans les pays développés, il gagne aussi du terrain en République Centrafricaine, porté par les organisations internationales, les entreprises tech et les startups africaines.</p>

<h2>Quels emplois peuvent se faire à distance depuis Bangui ?</h2>
<ul>
  <li><strong>Développement web et mobile</strong> : travailler pour des clients en Europe ou dans la diaspora</li>
  <li><strong>Design graphique</strong> : création visuelle, motion design, UI/UX</li>
  <li><strong>Traduction et rédaction</strong> : contenus en français, sango, anglais</li>
  <li><strong>Support client</strong> : pour des entreprises africaines ou internationales</li>
  <li><strong>Comptabilité et finance</strong> : gestion à distance pour les PME</li>
  <li><strong>Community management</strong> : gestion des réseaux sociaux</li>
</ul>

<h2>Les défis du télétravail en RCA</h2>

<h3>La connectivité internet</h3>
<p>Le principal obstacle reste la qualité et le coût de l'internet. Les forfaits 4G d'Orange RCA et les connexions satellite émergentes aident à surmonter ce défi.</p>

<h3>L'électricité</h3>
<p>Les coupures fréquentes nécessitent des équipements de backup : onduleur, panneau solaire, batterie externe pour PC.</p>

<h3>Les outils de collaboration</h3>
<p>Maîtriser Zoom, Slack, Trello, Notion et Google Workspace est devenu indispensable pour travailler avec des équipes distantes.</p>

<h2>Comment se préparer ?</h2>
<ol>
  <li>Investissez dans un équipement fiable (ordinateur, connexion, batterie)</li>
  <li>Créez un espace de travail dédié chez vous</li>
  <li>Formez-vous aux outils digitaux de collaboration</li>
  <li>Construisez votre portfolio en ligne (GitHub, Behance, LinkedIn)</li>
</ol>

<p><strong>KTZ Emploi</strong> intègre le filtre "Télétravail" dans ses offres d'emploi pour vous aider à trouver des postes compatibles avec le travail à distance.</p>`,
  },
  {
    title: "Les droits des travailleurs en République Centrafricaine : ce que vous devez savoir",
    category: "Législation",
    excerpt: "Contrat de travail, congés payés, licenciement, salaire minimum… Connaissez-vous réellement vos droits en tant que salarié en RCA ?",
    content: `<h2>Connaître ses droits pour mieux les défendre</h2>
<p>Le Code du travail de la République Centrafricaine encadre les relations entre employeurs et salariés. Beaucoup de travailleurs ignorent leurs droits fondamentaux. Voici les points essentiels.</p>

<h2>Le contrat de travail</h2>
<p>Tout emploi doit faire l'objet d'un contrat écrit :</p>
<ul>
  <li><strong>CDI</strong> (Contrat à Durée Indéterminée) : sans limite de durée, protection maximale</li>
  <li><strong>CDD</strong> (Contrat à Durée Déterminée) : limité dans le temps, renouvelable sous conditions</li>
  <li><strong>Contrat de stage</strong> : durée limitée, encadrement obligatoire</li>
</ul>
<p>Exigez toujours un contrat signé avant de commencer à travailler.</p>

<h2>Le salaire minimum (SMIG)</h2>
<p>La RCA dispose d'un Salaire Minimum Interprofessionnel Garanti. Aucun employeur ne peut vous payer en dessous de ce seuil. Renseignez-vous auprès du Ministère du Travail pour le montant en vigueur.</p>

<h2>Les congés payés</h2>
<p>Tout salarié a droit à <strong>2,5 jours de congés payés par mois</strong> de travail effectif, soit 30 jours par an.</p>

<h2>La durée légale du travail</h2>
<p>La durée légale est de <strong>40 heures par semaine</strong>. Toute heure supplémentaire doit être rémunérée avec une majoration.</p>

<h2>La protection contre le licenciement abusif</h2>
<p>Un employeur ne peut pas vous licencier sans motif valable. En cas de licenciement abusif, vous pouvez saisir l'Inspection du Travail ou le Tribunal du Travail pour obtenir réparation.</p>

<h2>La sécurité sociale (OCSS)</h2>
<p>Tout employeur est tenu d'affilier ses salariés à l'<strong>Office Centrafricain de Sécurité Sociale</strong> qui couvre les risques maladie, maternité, accident du travail et retraite.</p>

<h2>En cas de litige</h2>
<p>Contactez l'<strong>Inspection du Travail de Bangui</strong> ou un syndicat professionnel. Gardez toujours une copie de votre contrat et de tous vos bulletins de salaire.</p>`,
  },
  {
    title: "Créer sa startup en RCA : guide pour les jeunes entrepreneurs centrafricains",
    category: "Entrepreneuriat",
    excerpt: "De l'idée à la réalisation : comment lancer son entreprise en République Centrafricaine et accéder aux financements disponibles.",
    content: `<h2>L'entrepreneuriat, une alternative à l'emploi salarié</h2>
<p>Face au manque d'emplois formels, de nombreux jeunes Centrafricains choisissent de créer leur propre activité. L'entrepreneuriat peut être une voie vers l'indépendance financière et le développement économique du pays.</p>

<h2>Étape 1 : Valider son idée</h2>
<ul>
  <li>Quel problème concret mon produit ou service résout-il ?</li>
  <li>Qui sont mes clients potentiels à Bangui ou en RCA ?</li>
  <li>Existe-t-il déjà des concurrents ? Comment me différencier ?</li>
</ul>

<h2>Étape 2 : Rédiger un business plan</h2>
<p>Même simple, un business plan doit couvrir : description de l'activité, étude de marché, modèle économique et prévisionnel financier.</p>

<h2>Étape 3 : Créer officiellement votre entreprise</h2>
<p>En RCA, créez votre entreprise auprès du <strong>Guichet Unique de Formalisation des Entreprises (GUFE)</strong> à Bangui :</p>
<ul>
  <li><strong>Auto-entrepreneur</strong> : simple et rapide</li>
  <li><strong>SARL</strong> : adaptée aux PME</li>
  <li><strong>SA</strong> : pour les grands projets avec actionnaires</li>
</ul>

<h2>Étape 4 : Accéder aux financements</h2>
<ul>
  <li><strong>PNUD / FIDA</strong> : programmes d'appui aux jeunes entrepreneurs</li>
  <li><strong>AFD</strong> : financements PME</li>
  <li><strong>Microfinance</strong> : CMCA et institutions locales</li>
  <li><strong>Tony Elumelu Foundation</strong> : 5 000 $ pour les startups africaines</li>
  <li><strong>Africa's Business Heroes</strong> : concours Alibaba pour entrepreneurs africains</li>
</ul>

<h2>Étape 5 : Se faire accompagner</h2>
<p>Rejoignez les réseaux d'entrepreneurs à Bangui : CCIAMA, APECA, ou les incubateurs soutenus par les organisations internationales. Un mentor expérimenté peut faire toute la différence.</p>

<p>KTZ Emploi met à votre disposition un espace pour recruter vos premiers collaborateurs dès que votre startup décolle.</p>`,
  },
  {
    title: "Comment utiliser LinkedIn pour trouver un emploi depuis la RCA",
    category: "Conseils",
    excerpt: "LinkedIn est le réseau professionnel numéro 1 au monde. Voici comment l'utiliser efficacement depuis Bangui pour booster votre carrière.",
    content: `<h2>LinkedIn, un outil encore sous-utilisé en RCA</h2>
<p>Avec plus d'un milliard d'utilisateurs dans le monde, LinkedIn est incontournable pour les professionnels. En RCA, il est encore peu exploité — une vraie opportunité pour ceux qui s'y mettent maintenant.</p>

<h2>1. Créer un profil complet et professionnel</h2>
<ul>
  <li><strong>Photo professionnelle</strong> : fond neutre, tenue professionnelle, sourire naturel</li>
  <li><strong>Titre accrocheur</strong> : ex. "Comptable | Expert finance ONG | Bangui, RCA"</li>
  <li><strong>Résumé</strong> : 3 à 5 lignes sur votre parcours et vos ambitions</li>
  <li><strong>Expériences détaillées</strong> avec des réalisations quantifiées</li>
  <li><strong>Compétences</strong> : ajoutez-en au moins 10 pour être trouvé</li>
</ul>

<h2>2. Construire votre réseau stratégiquement</h2>
<p>Connectez-vous avec vos anciens collègues, les RH des organisations qui vous intéressent, les professionnels centrafricains de votre secteur et des experts internationaux de votre domaine.</p>

<h2>3. Être actif sur la plateforme</h2>
<p>LinkedIn récompense l'activité. Publiez 1 fois par semaine : réflexions sur votre secteur, articles sur des problématiques centrafricaines, commentaires pertinents sur des publications d'experts.</p>

<h2>4. Postuler intelligemment</h2>
<p>Filtrez par localisation "République Centrafricaine" ou "Bangui", par type "Télétravail" pour les opportunités à distance, et recherchez directement les ONG et entreprises présentes en RCA.</p>

<h2>5. Approcher les recruteurs en direct</h2>
<p>N'hésitez pas à envoyer un message personnalisé à un responsable RH. Présentez-vous brièvement et proposez un échange. Cette démarche proactive distingue les candidats ambitieux.</p>

<p>Combinez LinkedIn avec <strong>KTZ Emploi</strong> pour maximiser vos chances sur le marché local centrafricain.</p>`,
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@ktz-emploi.com' } });
  if (!admin) { console.log('Admin introuvable'); return; }

  let count = 0;
  for (const art of articles) {
    const s = await makeSlug(art.title);
    await prisma.blogPost.create({
      data: {
        title: art.title,
        slug: s,
        excerpt: art.excerpt,
        content: art.content,
        category: art.category,
        published: true,
        authorId: admin.id,
      }
    });
    count++;
    console.log(`✅ [${count}/${articles.length}] ${art.title.substring(0, 55)}...`);
  }
  console.log(`\n🎉 ${count} articles publiés avec succès.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
