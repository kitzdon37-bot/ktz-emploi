import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time

EXPEDITEUR_NOM   = "Donald Chrysostome KITEZE - KTZ Emploi"
EXPEDITEUR_EMAIL = "kitzdon37@gmail.com"
EXPEDITEUR       = f"{EXPEDITEUR_NOM} <{EXPEDITEUR_EMAIL}>"
APP_PASSWORD     = "COLLE_TON_APP_PASSWORD_ICI"

INTRODUCTION = (
    "Madame, Monsieur,\n\n"
    "Je me permets de vous contacter afin de vous presenter mes projets entrepreneuriaux "
    "en Republique Centrafricaine et d'explorer la possibilite d'un accompagnement dans "
    "le cadre de vos programmes de soutien a l'entrepreneuriat et au developpement economique.\n\n"
    "Je suis Donald KITEZE, jeune Centrafricain de 29 ans, residant actuellement a Nice, "
    "en France. Ingenieur en Microelectronique, Telecommunications et Reseaux, je m'investis "
    "activement dans le developpement economique et social de mon pays.\n\n\n"
    "-- MES PROJETS --\n\n"
    "1. KTZ EMPLOI - La premiere plateforme de recrutement en ligne de RCA\n"
    "https://ktzemploi.com\n\n"
    "KTZ Emploi est un ecosysteme complet dedie a l'emploi en Republique Centrafricaine, "
    "articule autour de trois piliers :\n\n"
    "- Une plateforme numerique (site web + application mobile Android) qui met en relation "
    "les employeurs et les candidats centrafricains. Elle permet de publier des offres d'emploi, "
    "d'acceder a une CVtheque locale (developpeurs, comptables, medecins, juristes, logisticiens, "
    "etc.) et de gerer les candidatures en ligne.\n\n"
    "- Une agence de recrutement physique a Bangui, qui accompagnera les entreprises dans la "
    "recherche et la selection de leurs talents locaux, et offrira aux candidats un suivi "
    "personnalise dans leurs demarches de recherche d'emploi.\n\n"
    "- Un centre de formation professionnelle, qui proposera des formations pratiques et "
    "certifiantes adaptees aux besoins du marche centrafricain : informatique, gestion, "
    "entrepreneuriat, metiers techniques, langues, etc. L'objectif est de renforcer "
    "l'employabilite des jeunes et de combler le fosse entre les competences disponibles "
    "et les besoins des entreprises.\n\n"
    "Cette initiative vise a digitaliser un marche de l'emploi encore 100% informel, "
    "a reduire le chomage des jeunes et a connecter les talents centrafricains aux "
    "opportunites economiques locales et internationales.\n\n"
    "2. ASSOCIATION AVENIR POUR TOUS - KTZ ASSOCIATION\n\n"
    "Fondee en France, cette association a pour mission de former la jeunesse centrafricaine, "
    "de l'aider a acquerir des competences professionnelles adaptees a ses talents, et de "
    "soutenir son insertion dans le monde du travail. Elle agit en complementarite directe "
    "avec la plateforme KTZ Emploi et le centre de formation.\n\n"
    "3. PRODUCTION LOCALE D'HUILE D'ARACHIDE\n\n"
    "Une entreprise visant a valoriser les cultures locales, creer des emplois dans les zones "
    "rurales et developper une filiere agro-industrielle durable en RCA.\n\n"
    "4. PRODUCTION DE POULETS DE CHAIR\n\n"
    "Une initiative qui contribuera a renforcer la securite alimentaire et a generer des "
    "opportunites economiques pour les communautes locales.\n"
)

CLOTURE = (
    "Je dispose deja d'une partie des financements necessaires grace a mes economies et "
    "activites professionnelles, mais un soutien complementaire me permettrait de maximiser "
    "l'impact social et economique de ces initiatives.\n\n"
    "Je joins a ce mail les documents suivants :\n"
    "- Ma piece d'identite\n"
    "- Presentation de l'Association Avenir Pour Tous - KTZ\n\n"
    "Je vous remercie sincerement pour le temps accorde a ma demande et reste entierement "
    "disponible pour tout echange a votre convenance.\n\n"
    "Dans l'attente de votre reponse, veuillez recevoir mes salutations distinguees.\n\n"
    "Donald Chrysostome KITEZE\n"
    "Ingenieur Microelectronique, Telecommunications et Reseaux\n"
    "Fondateur - KTZ Emploi | President - Association Avenir Pour Tous (A.P.T)\n"
    "kitzdon37@gmail.com\n"
    "+33 6 25 34 51 75\n"
    "https://ktzemploi.com"
)

PARTENAIRES = [
    {
        "nom":   "UNICEF Centrafrique",
        "email": "bangui@unicef.org",
        "objet": "Demande de partenariat - KTZ Emploi, premiere plateforme d'emploi en RCA",
        "pourquoi": (
            "-- POURQUOI VOUS CONTACTER --\n\n"
            "En tant qu'UNICEF en Republique Centrafricaine, vous portez des programmes qui "
            "soutiennent directement l'education, la formation et l'insertion des jeunes, notamment via :\n\n"
            "- Le UNICEF Venture Fund - qui finance des startups early-stage dans les pays programmes "
            "de l'UNICEF jusqu'a 100 000 USD sans dilution : KTZ Emploi, en tant que plateforme "
            "numerique d'emploi pour les jeunes Centrafricains, s'inscrit directement dans ce perimetre.\n\n"
            "- Les programmes d'inclusion numerique et d'employabilite des jeunes - notre plateforme "
            "mobile connecte les jeunes sans emploi aux opportunites du marche local, y compris "
            "dans les zones secondaires.\n\n"
            "- L'axe education et formation professionnelle - notre centre de formation professionnelle "
            "a venir complete directement les actions de l'UNICEF en matiere de renforcement des "
            "competences.\n\n"
            "Mes projets s'alignent avec les priorites de l'UNICEF en RCA : jeunesse, formation, "
            "inclusion numerique et insertion professionnelle."
        ),
        "demande": (
            "-- MA DEMANDE --\n\n"
            "Je souhaiterais :\n"
            "1. Savoir si KTZ Emploi est eligible au UNICEF Venture Fund ou a d'autres mecanismes "
            "de financement de l'UNICEF pour les startups a impact en RCA\n"
            "2. Explorer un partenariat operationnel entre l'UNICEF et KTZ Emploi pour renforcer "
            "l'employabilite des jeunes Centrafricains\n"
            "3. Obtenir un rendez-vous avec votre bureau de Bangui pour vous presenter mes "
            "initiatives en detail"
        ),
    },
    {
        "nom":   "FAO Centrafrique",
        "email": "FAO-CF@fao.org",
        "objet": "Demande de partenariat - Projets agro-industriels et plateforme d'emploi en RCA",
        "pourquoi": (
            "-- POURQUOI VOUS CONTACTER --\n\n"
            "En tant qu'Organisation des Nations Unies pour l'Alimentation et l'Agriculture "
            "en Republique Centrafricaine, vous portez des programmes qui soutiennent directement "
            "le developpement agricole, la securite alimentaire et la creation d'emplois ruraux. "
            "Mes projets s'inscrivent directement dans ces axes :\n\n"
            "- Production locale d'huile d'arachide - valorisation des cultures locales, creation "
            "d'emplois dans les zones rurales et developpement d'une filiere agro-industrielle "
            "durable en RCA : ce projet est en parfaite coherence avec les priorites de la FAO "
            "en matiere de chaines de valeur agricoles locales.\n\n"
            "- Production de poulets de chair - renforcement de la securite alimentaire et creation "
            "d'opportunites economiques pour les communautes rurales centrafricaines.\n\n"
            "- KTZ Emploi - notre plateforme d'emploi permet egalement de connecter les acteurs "
            "du secteur agricole (exploitants, techniciens, agents de terrain) aux offres d'emploi "
            "dans ce secteur en RCA.\n\n"
            "Mes projets s'alignent avec les priorites de la FAO en RCA : securite alimentaire, "
            "developpement des filieres agricoles locales, creation d'emplois ruraux et "
            "renforcement des capacites."
        ),
        "demande": (
            "-- MA DEMANDE --\n\n"
            "Je souhaiterais :\n"
            "1. Savoir si mes projets agricoles (huile d'arachide, aviculture) sont eligibles "
            "a un financement ou a une assistance technique de la FAO en RCA\n"
            "2. Explorer un partenariat technique pour structurer et developper ces filieres "
            "de maniere durable\n"
            "3. Obtenir un rendez-vous avec votre bureau de Bangui pour vous presenter "
            "mes projets en detail"
        ),
    },
    {
        "nom":   "OIM - Organisation Internationale pour les Migrations",
        "email": "iomcar@iom.int",
        "objet": "Demande de partenariat - KTZ Emploi, premiere plateforme d'emploi en RCA",
        "pourquoi": (
            "-- POURQUOI VOUS CONTACTER --\n\n"
            "En tant qu'Organisation Internationale pour les Migrations en Republique "
            "Centrafricaine, vous portez des programmes qui soutiennent directement la "
            "reintegration economique des populations deplacees, l'emploi des jeunes et "
            "le lien diaspora-pays d'origine. KTZ Emploi s'inscrit directement dans ces axes :\n\n"
            "- Le lien diaspora - pays d'origine : je suis moi-meme un jeune Centrafricain "
            "de la diaspora base a Nice, qui investit concretement dans le developpement "
            "economique de son pays via la creation d'une plateforme d'emploi digitale.\n\n"
            "- La reintegration economique des jeunes et des deplaces internes : KTZ Emploi "
            "facilite l'acces a l'emploi pour tous les Centrafricains, y compris les populations "
            "vulnerables, via une application mobile accessible depuis n'importe quel smartphone Android.\n\n"
            "- L'entrepreneuriat de la diaspora au service du developpement : mes projets "
            "(plateforme emploi, formation professionnelle, agro-industrie) creent des emplois "
            "directs et indirects en RCA.\n\n"
            "Mes projets s'alignent avec les priorites de l'OIM en RCA : emploi, reintegration "
            "economique, engagement de la diaspora et developpement local."
        ),
        "demande": (
            "-- MA DEMANDE --\n\n"
            "Je souhaiterais :\n"
            "1. Savoir si mes projets sont eligibles a un financement ou a un accompagnement "
            "dans le cadre des programmes OIM sur l'entrepreneuriat de la diaspora ou la "
            "reintegration economique en RCA\n"
            "2. Explorer un partenariat pour utiliser KTZ Emploi comme outil de reintegration "
            "professionnelle des populations deplacees centrafricaines\n"
            "3. Obtenir un rendez-vous avec votre bureau de Bangui pour vous presenter "
            "mes initiatives en detail"
        ),
    },
]


def construire_corps(p):
    return INTRODUCTION + "\n\n" + p["pourquoi"] + "\n\n" + p["demande"] + "\n\n" + CLOTURE


def envoyer_mail(dest_email, objet, corps):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = objet
    msg["From"]    = EXPEDITEUR
    msg["To"]      = dest_email
    msg.attach(MIMEText(corps, "plain", "utf-8"))
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EXPEDITEUR_EMAIL, APP_PASSWORD)
        server.sendmail(EXPEDITEUR_EMAIL, dest_email, msg.as_string())


if __name__ == "__main__":
    print(f"Expediteur : {EXPEDITEUR}")
    print(f"=== Envoi de {len(PARTENAIRES)} mails ===\n")
    for i, p in enumerate(PARTENAIRES, 1):
        corps = construire_corps(p)
        try:
            print(f"[{i}/{len(PARTENAIRES)}] Envoi a {p['nom']} ({p['email']})...", end=" ")
            envoyer_mail(p["email"], p["objet"], corps)
            print("OK")
        except Exception as e:
            print(f"ECHEC - {e}")
        if i < len(PARTENAIRES):
            time.sleep(10)
    print("\n=== Termine ===")
