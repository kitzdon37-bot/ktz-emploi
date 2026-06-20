"""
Script d'envoi des mails partenaires — KTZ Emploi
Utilise Gmail SMTP avec un App Password Google.

AVANT D'EXECUTER :
1. Active la validation en 2 étapes sur ton compte Google
2. Génère un "App Password" sur : myaccount.google.com/apppasswords
3. Mets ton App Password dans la variable APP_PASSWORD ci-dessous
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time

# ─── CONFIG ───────────────────────────────────────────────────────────────────

EXPEDITEUR_NOM   = "Donald Chrysostome KITEZE — KTZ Emploi"
EXPEDITEUR_EMAIL = "kitzdon37@gmail.com"
EXPEDITEUR       = f"{EXPEDITEUR_NOM} <{EXPEDITEUR_EMAIL}>"
APP_PASSWORD   = "COLLE_TON_APP_PASSWORD_ICI"   # ex: "abcd efgh ijkl mnop"
DELAI_SECONDES = 10   # délai entre chaque mail pour éviter spam

# ─── PARTIES COMMUNES ─────────────────────────────────────────────────────────

INTRODUCTION = """Madame, Monsieur,

Je me permets de vous contacter afin de vous présenter mes projets entrepreneuriaux en République Centrafricaine et d'explorer la possibilité d'un accompagnement dans le cadre de vos programmes de soutien à l'entrepreneuriat et au développement économique.

Je suis Donald KITEZE, jeune Centrafricain de 29 ans, résidant actuellement à Nice, en France. Ingénieur en Microélectronique, Télécommunications et Réseaux, je m'investis activement dans le développement économique et social de mon pays.


── MES PROJETS ──

1. KTZ EMPLOI — La première plateforme de recrutement en ligne de RCA
https://ktzemploi.com

KTZ Emploi est un écosystème complet dédié à l'emploi en République Centrafricaine, articulé autour de trois piliers :

• Une plateforme numérique (site web + application mobile Android) qui met en relation les employeurs et les candidats centrafricains. Elle permet de publier des offres d'emploi, d'accéder à une CVthèque locale (développeurs, comptables, médecins, juristes, logisticiens, etc.) et de gérer les candidatures en ligne.

• Une agence de recrutement physique à Bangui, qui accompagnera les entreprises dans la recherche et la sélection de leurs talents locaux, et offrira aux candidats un suivi personnalisé dans leurs démarches de recherche d'emploi.

• Un centre de formation professionnelle, qui proposera des formations pratiques et certifiantes adaptées aux besoins du marché centrafricain : informatique, gestion, entrepreneuriat, métiers techniques, langues, etc. L'objectif est de renforcer l'employabilité des jeunes et de combler le fossé entre les compétences disponibles et les besoins des entreprises.

Cette initiative vise à digitaliser un marché de l'emploi encore 100 % informel, à réduire le chômage des jeunes et à connecter les talents centrafricains aux opportunités économiques locales et internationales.

2. ASSOCIATION AVENIR POUR TOUS – KTZ ASSOCIATION

Fondée en France, cette association a pour mission de former la jeunesse centrafricaine, de l'aider à acquérir des compétences professionnelles adaptées à ses talents, et de soutenir son insertion dans le monde du travail. Elle agit en complémentarité directe avec la plateforme KTZ Emploi et le centre de formation.

3. PRODUCTION LOCALE D'HUILE D'ARACHIDE

Une entreprise visant à valoriser les cultures locales, créer des emplois dans les zones rurales et développer une filière agro-industrielle durable en RCA.

4. PRODUCTION DE POULETS DE CHAIR

Une initiative qui contribuera à renforcer la sécurité alimentaire et à générer des opportunités économiques pour les communautés locales.
"""

CLOTURE = """Je dispose déjà d'une partie des financements nécessaires grâce à mes économies et activités professionnelles, mais un soutien complémentaire me permettrait de maximiser l'impact social et économique de ces initiatives.

Je joins à ce mail les documents suivants :
• Ma pièce d'identité
• Présentation de l'Association Avenir Pour Tous – KTZ

Je vous remercie sincèrement pour le temps accordé à ma demande et reste entièrement disponible pour tout échange à votre convenance.

Dans l'attente de votre réponse, veuillez recevoir mes salutations distinguées.

Donald Chrysostome KITEZE
Ingénieur Microélectronique, Télécommunications et Réseaux
Fondateur — KTZ Emploi | Président — Association Avenir Pour Tous (A.P.T)
kitzdon37@gmail.com
+33 6 25 34 51 75
https://ktzemploi.com"""

# ─── PARTENAIRES ──────────────────────────────────────────────────────────────

PARTENAIRES = [

    {
        "nom":   "PNUD Centrafrique",
        "email": "registry.cf@undp.org",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant que Programme des Nations Unies pour le Développement en République Centrafricaine, le PNUD pilote des programmes qui soutiennent directement l'entrepreneuriat des jeunes et la transformation numérique, notamment via :

• Le programme YouthConnekt RCA — mon parcours de jeune entrepreneur de la diaspora, créateur d'emplois et d'impact social, correspond précisément au profil soutenu par ce programme
• La Stratégie Nationale Jeunesse — KTZ Emploi s'inscrit directement dans l'axe « employabilité, entrepreneuriat et autonomisation économique des jeunes »
• Les programmes d'innovation numérique — KTZ Emploi digitalise un marché de l'emploi encore 100 % informel, en phase avec les objectifs de développement durable

Mes projets s'alignent avec les priorités du PNUD en RCA : emploi des jeunes, formation professionnelle, entrepreneuriat numérique et résilience économique.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Savoir si mes projets sont éligibles aux programmes PNUD ou YouthConnekt actifs en RCA
2. Obtenir un rendez-vous avec votre bureau de Bangui pour vous présenter mes initiatives en détail
3. Explorer toute forme de partenariat, d'accompagnement ou d'orientation que vous pourriez m'apporter""",
    },

    {
        "nom":   "Ambassade de France — SCAC Bangui",
        "email": "scac.bangui-amba@diplomatie.gouv.fr",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant que Service de Coopération et d'Action Culturelle de l'Ambassade de France en République Centrafricaine, vous portez des programmes qui soutiennent directement le développement économique, la formation professionnelle et l'entrepreneuriat local, notamment via :

• Le Fonds Social de Développement (FSD) — KTZ Emploi est un projet à fort impact social, porté par un jeune Centrafricain de la diaspora, parfaitement éligible à ce type de soutien
• Digital Africa / Programme FUZE (AFD) — KTZ Emploi remplit les critères d'éligibilité : startup fondée par un national africain, opérant en RCA, au stade early-stage
• La Bangui Hub Foundation — premier incubateur de RCA, soutenu par l'Ambassade de France : nous souhaitons intégrer cet écosystème avec votre appui
• L'axe formation professionnelle et emploi des jeunes — au cœur de la politique de coopération française en Afrique subsaharienne

Mes projets s'alignent avec les priorités françaises en RCA : numérique, entrepreneuriat jeune, formation professionnelle et développement économique inclusif.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Savoir si mes projets sont éligibles au Fonds Social de Développement (FSD) ou à d'autres dispositifs de la coopération française
2. Obtenir une mise en relation avec Digital Africa / FUZE pour candidater au programme de financement pre-seed (20 000 à 100 000 EUR, sans dilution)
3. Explorer un accompagnement vers la Bangui Hub Foundation pour intégrer l'écosystème startup local soutenu par la France
4. Obtenir un rendez-vous au SCAC pour présenter mes initiatives en détail""",
    },

    {
        "nom":   "OIT / ILO — Bureau Afrique centrale",
        "email": "ilo@ilo.org",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant qu'Organisation Internationale du Travail, vous opérez en République Centrafricaine des programmes qui soutiennent directement l'emploi décent des jeunes dans les États fragiles, notamment via :

• Le programme Jobs for Peace and Resilience (JPR) — KTZ Emploi est une brique numérique complémentaire à cette action terrain : une plateforme de mise en relation employeurs/candidats qui renforce la transparence du marché du travail centrafricain
• Le projet d'observatoire national de l'emploi et de la formation professionnelle en RCA — KTZ Emploi peut fournir des données en temps réel sur les offres, les profils et les secteurs porteurs
• L'axe emploi des jeunes dans les contextes de fragilité — mes projets touchent directement les jeunes sans emploi, y compris dans les zones secondaires via l'application mobile Android

Mes projets s'alignent avec les priorités de l'OIT en RCA : emploi décent, formation professionnelle, réduction du chômage des jeunes et structuration du marché du travail.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Explorer un partenariat avec l'OIT pour intégrer KTZ Emploi comme outil numérique de l'observatoire national de l'emploi en RCA
2. Savoir si mes projets sont éligibles à un financement ou à une assistance technique dans le cadre du programme JPR
3. Obtenir un rendez-vous avec votre bureau régional pour présenter mes initiatives en détail""",
    },

    {
        "nom":   "ACFPE — Agence Centrafricaine Formation Professionnelle et Emploi",
        "email": "acfpe-rca@acfpe.info",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant qu'Agence Centrafricaine pour la Formation Professionnelle et l'Emploi, vous êtes l'interlocuteur institutionnel de référence en matière d'emploi et de formation en RCA, notamment comme structure d'exécution du projet i-COMPETE de la Banque Mondiale. À ce titre :

• KTZ Emploi est un outil numérique directement complémentaire à votre mission : digitaliser la mise en relation employeurs-candidats en RCA, un marché encore 100 % informel
• Notre centre de formation professionnelle à venir s'inscrit dans la même logique que vos actions : renforcer l'employabilité des jeunes centrafricains
• Un partenariat entre l'ACFPE et KTZ Emploi permettrait de démultiplier la portée des programmes d'insertion professionnelle grâce au numérique et au mobile

Mes projets s'alignent avec les priorités de l'ACFPE : formation professionnelle, insertion des jeunes et structuration du marché du travail centrafricain.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Explorer un partenariat institutionnel entre l'ACFPE et KTZ Emploi pour digitaliser les services d'emploi en RCA
2. Savoir si mes projets peuvent bénéficier d'un appui dans le cadre du projet i-COMPETE (Banque Mondiale)
3. Obtenir un rendez-vous à vos bureaux de Bangui pour vous présenter mes initiatives en détail""",
    },

    {
        "nom":   "Proparco / Choose Africa",
        "email": "proparco@proparco.fr",
        "objet": "Demande de financement — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant que bras financier privé du Groupe AFD, Proparco soutient via l'initiative Choose Africa les startups et PME africaines à fort impact social et économique. KTZ Emploi s'inscrit directement dans cette dynamique :

• Choose Africa cible précisément les startups numériques africaines en phase de développement — KTZ Emploi digitalise un marché de l'emploi encore 100 % informel en RCA, un marché vierge à fort potentiel de croissance
• L'initiative Digital Africa, portée conjointement avec l'AFD, finance les startups tech africaines fondées par des nationaux — je suis Centrafricain, basé en France, et mon projet opère entièrement en RCA
• Proparco dispose d'un bureau régional à Douala couvrant l'Afrique centrale, dont la RCA — notre projet est donc dans votre périmètre géographique d'intervention

Mes projets s'alignent avec les priorités de Proparco : entrepreneuriat numérique, emploi des jeunes, croissance inclusive et impact social mesurable.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Savoir si KTZ Emploi est éligible à un financement Choose Africa (subvention, avance remboursable ou prise de participation)
2. Explorer un accompagnement via le programme FUZE / Digital Africa pour la phase de lancement (20 000 à 100 000 EUR)
3. Obtenir un rendez-vous avec votre bureau de Douala ou votre équipe startup pour présenter mes initiatives en détail""",
    },

    {
        "nom":   "GIZ — Bureau Régional Yaoundé",
        "email": "giz-kamerun@giz.de",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant qu'agence de coopération allemande dont le bureau régional de Yaoundé couvre la République Centrafricaine, la GIZ opère des programmes qui soutiennent directement l'emploi des jeunes et les compétences numériques en Afrique centrale, notamment via :

• Le programme Invest for Jobs — KTZ Emploi crée des conditions favorables à l'emploi en RCA en connectant les talents aux employeurs via le numérique
• Les partenariats pour la formation numérique en Afrique francophone — notre centre de formation professionnelle est complémentaire à ces initiatives
• L'axe entrepreneuriat et développement du secteur privé — mes projets (plateforme emploi, agro-industrie, aviculture) créent des emplois directs et indirects en RCA

Mes projets s'alignent avec les priorités de la GIZ en Afrique centrale : emploi des jeunes, compétences numériques, développement du secteur privé et formation professionnelle.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Savoir si mes projets sont éligibles à un financement ou à une assistance technique de la GIZ en RCA
2. Explorer un partenariat dans le cadre des programmes d'emploi des jeunes et de formation numérique en Afrique centrale
3. Obtenir un rendez-vous avec votre bureau de Yaoundé pour vous présenter mes initiatives en détail""",
    },

    {
        "nom":   "Orange Centrafrique",
        "email": "ocf.serviceclient@orange.com",
        "objet": "Proposition de partenariat — KTZ Emploi, première application mobile d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant qu'opérateur télécom de référence en République Centrafricaine, avec le récent lancement de votre réseau 4G (mai 2025), Orange Centrafrique est un partenaire stratégique naturel pour KTZ Emploi :

• Notre application mobile Android s'appuie directement sur la connectivité mobile — le déploiement de la 4G Orange en RCA est un accélérateur majeur pour notre adoption
• Un partenariat de distribution permettrait à Orange de proposer KTZ Emploi comme application recommandée à ses abonnés, renforçant la valeur de son offre 4G
• Un accord data préférentiel (zero-rating ou bundle data) permettrait aux chercheurs d'emploi centrafricains d'accéder à la plateforme sans crainte de consommer leur forfait
• Orange Fab, l'accélérateur du Groupe Orange, soutient précisément les startups mobiles à fort impact en Afrique

Ce partenariat est une opportunité pour Orange Centrafrique de positionner son réseau 4G comme vecteur d'impact social et économique concret pour les Centrafricains.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Explorer un partenariat de distribution : référencement de KTZ Emploi auprès de vos abonnés
2. Discuter d'un accord data préférentiel (zero-rating) pour l'accès à notre application
3. Savoir si KTZ Emploi peut bénéficier d'un accompagnement via Orange Fab Africa
4. Obtenir un rendez-vous avec votre direction commerciale ou partenariats pour présenter le projet""",
    },

    {
        "nom":   "MINUSCA — Mission des Nations Unies en Centrafrique",
        "email": "minusca-procurement@un.org",
        "objet": "Demande de partenariat — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant que Mission des Nations Unies en République Centrafricaine, la MINUSCA soutient activement l'emploi des jeunes et l'entrepreneuriat local, notamment via :

• Le programme YouthConnekt RCA — dont la MINUSCA est partenaire officiel depuis 2024 — KTZ Emploi est un outil numérique directement complémentaire à cette initiative pour connecter les jeunes aux opportunités d'emploi
• Le partenariat avec la Bangui Hub Foundation (novembre 2024) — nous souhaitons nous inscrire dans cet écosystème que vous contribuez à soutenir
• Le recrutement de personnel local — en tant qu'organisation présente massivement à Bangui et en provinces, la MINUSCA recrute régulièrement des profils centrafricains (assistants, chauffeurs, agents de terrain, traducteurs, informaticiens, etc.)

KTZ Emploi vous offre un accès direct et numérique au vivier de talents centrafricains qualifiés, avec une visibilité maximale auprès de la communauté locale.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Explorer un partenariat institutionnel dans le cadre du programme YouthConnekt RCA
2. Présenter KTZ Emploi comme outil de recrutement de personnel local pour la MINUSCA
3. Obtenir un rendez-vous avec votre bureau de Bangui pour présenter mes initiatives en détail""",
    },

    {
        "nom":   "BDEAC — Banque de Développement des États d'Afrique Centrale",
        "email": "n.ngartel@bdeac.org",
        "objet": "Demande de financement — KTZ Emploi, première plateforme d'emploi en RCA",
        "pourquoi": """── POURQUOI VOUS CONTACTER ──

En tant que banque de développement de la zone CEMAC dont la RCA est membre, la BDEAC finance les projets à fort impact économique en Afrique centrale. KTZ Emploi s'inscrit directement dans ce cadre :

• Un projet numérique créateur d'emplois en RCA — membre de la CEMAC — avec trois piliers : plateforme digitale, agence de recrutement physique et centre de formation professionnelle
• Des projets agro-industriels (huile d'arachide, aviculture) à fort potentiel de création d'emplois ruraux en RCA, directement dans le périmètre d'intervention de la BDEAC
• La BDEAC dispose d'une représentation nationale à Bangui, ce qui facilite le suivi et l'instruction des dossiers

Mes projets s'alignent avec les priorités de la BDEAC : développement du secteur privé, création d'emplois, diversification économique et financement des PME en zone CEMAC.""",
        "demande": """── MA DEMANDE ──

Je souhaiterais :
1. Savoir si mes projets (KTZ Emploi, production d'huile d'arachide, aviculture) sont éligibles à un financement BDEAC direct ou via une Institution Financière Nationale partenaire
2. Obtenir les coordonnées de votre représentation nationale à Bangui pour déposer un dossier
3. Explorer toute forme de soutien financier ou d'accompagnement que vous pourriez m'apporter""",
    },

]

# ─── ENVOI ────────────────────────────────────────────────────────────────────

def construire_corps(p):
    return (
        INTRODUCTION
        + "\n\n"
        + p["pourquoi"]
        + "\n\n"
        + p["demande"]
        + "\n\n"
        + CLOTURE
    )


def envoyer_mail(destinataire_email, objet, corps):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = objet
    msg["From"]    = EXPEDITEUR
    msg["To"]      = destinataire_email
    msg.attach(MIMEText(corps, "plain", "utf-8"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EXPEDITEUR_EMAIL, APP_PASSWORD)
        server.sendmail(EXPEDITEUR_EMAIL, destinataire_email, msg.as_string())


def main():
    if APP_PASSWORD == "COLLE_TON_APP_PASSWORD_ICI":
        print("ERREUR : Renseigne ton App Password Google avant d'executer ce script.")
        print("Genere-le sur : https://myaccount.google.com/apppasswords")
        return

    print(f"Expediteur affiché : {EXPEDITEUR}")

    print(f"=== Envoi de {len(PARTENAIRES)} mails ===\n")

    for i, p in enumerate(PARTENAIRES, 1):
        corps = construire_corps(p)
        try:
            print(f"[{i}/{len(PARTENAIRES)}] Envoi à {p['nom']} ({p['email']})...", end=" ")
            envoyer_mail(p["email"], p["objet"], corps)
            print("OK")
        except Exception as e:
            print(f"ECHEC — {e}")

        if i < len(PARTENAIRES):
            time.sleep(DELAI_SECONDES)

    print("\n=== Terminé ===")


if __name__ == "__main__":
    main()
