# -*- coding: utf-8 -*-
"""
Email de candidature — Bangui Hub
KTZ Emploi — 1ere plateforme digitale d'emploi en RCA
"""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

# ─── CONFIG ───────────────────────────────────────────────────────────────────
EXPEDITEUR_NOM   = "Donald Chrysostome KITEZE - KTZ Emploi"
EXPEDITEUR_EMAIL = "kitzdon37@gmail.com"
APP_PASSWORD     = "jclp lvyv kuby kiin"

DESTINATAIRES = [
    {"nom": "Fondation Bangui Hub", "email": "contact@banguihub.org"},
    {"nom": "Bangui Hub Info",      "email": "info@banguihub.org"},
]

PIECES_JOINTES = [
    ("C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_FUZE_DIGITAL_AFRICA.pdf",
     "KTZ_Emploi_Dossier_Candidature_2026.pdf"),
    ("C:/Users/donald-chrysostome.k/rca-jobs/PITCH_DECK_FUZE_KTZ_EMPLOI.pdf",
     "KTZ_Emploi_Pitch_Deck_2026.pdf"),
    ("C:/Users/donald-chrysostome.k/Desktop/PV- KTZ Association.pdf",
     "PV_Association_Avenir_Pour_Tous_APT.pdf"),
]

OBJET = "Candidature Incubation — KTZ Emploi, 1ere plateforme digitale d'emploi en RCA — Diaspora centrafricaine"

CORPS = """\
Madame, Monsieur,

Je me permets de vous contacter afin de soumettre la candidature de KTZ Emploi \
au programme d'incubation de la Fondation Bangui Hub.

Je suis Donald Chrysostome KITEZE, Centrafricain de 29 ans, Ingenieur en \
Microelectronique, Telecommunications et Reseaux (Universite Cote d'Azur, Nice), \
membre de la diaspora centrafricaine residant en France. \
J'ai fonde et developpe seul — sur fonds propres — KTZ Emploi : \
la premiere plateforme digitale de recrutement de la Republique Centrafricaine.


-- POURQUOI BANGUI HUB --

La mission de la Fondation Bangui Hub — accompagner la jeunesse et la diaspora \
centrafricaine dans la creation d'entreprises a fort impact — correspond \
exactement a ma demarche et a celle de KTZ Emploi.

Je cherche un ancrage local fort a Bangui pour :
1. Accelerer le deploiement operationnel de la plateforme en RCA
2. Constituer et former une equipe locale
3. Formaliser l'entreprise (immatriculation RCCM Bangui)
4. Developper les partenariats institutionnels (ACFPE, IECD, Universite de Bangui)
5. Acceder aux programmes de financement internationaux (AFD, UE, PNUD) \
qui exigent un ancrage local credible


-- KTZ EMPLOI EN BREF --

KTZ Emploi est la premiere et unique plateforme digitale de recrutement \
de la Republique Centrafricaine.

Probleme resolu :
La RCA affiche un taux de chomage des jeunes superieur a 60% dans un marche \
100% informel. Aucune plateforme digitale d'emploi n'existe dans le pays. \
Les offres circulent uniquement par bouche-a-oreille ou WhatsApp.

Solution deployee :
- Site web ktzemploi.com (Next.js 15 / Vercel) — en ligne
- Application mobile Android (React Native / Expo SDK 54) — developpee et testee
- Backend API REST complet (auth JWT, CVtheque, candidatures, favoris, stats)
- Agence de recrutement physique a Bangui — a ouvrir
- Centre de formation professionnelle certifiant — a structurer

Marche :
- 5,5 millions d'habitants, zero concurrent digital
- Premier entrant absolu sur ce marche
- Scalabilite vers le Tchad, Congo-Brazzaville et Cameroun (An 3)

Modele economique :
- 8 sources de revenus (offres premium, CVtheque, formations, recrutement direct...)
- Break-even prevu au 6e mois d'exploitation
- ROI cumule 5 ans estime : 1,68 million EUR
- Investissement initial : 3 000 a 5 000 EUR (fonds propres)

Traction et partenariats :
- Candidature FUZE / Digital Africa (AFD) soumise et eligible
- Candidature PNUD YouthConnekt RCA en cours
- 12 courriers envoyes : PNUD, OIT, FAO, OIM, GIZ, Proparco
- Contacts etablis : IECD Bangui, ACFPE, OIT, FAO, GIZ

Code source open source (MIT) — engagement de publication sur GitHub \
dans les 90 jours suivant le financement.


-- MA DEMANDE --

Je souhaiterais :
1. Integrer le programme d'incubation de Bangui Hub pour KTZ Emploi
2. Beneficier de votre accompagnement pour le deploiement local a Bangui
3. Obtenir un rendez-vous (visioconference) pour presenter le projet en detail
4. Etre mis en relation avec vos partenaires institutionnels et financiers en RCA


-- DOCUMENTS JOINTS --

1. Dossier de candidature complet KTZ Emploi (12 sections) — \
marche, solution, modele economique, projections financieres, equipe, strategie
2. Pitch Deck KTZ Emploi (12 slides) — presentation visuelle du projet
3. PV de l'Association Avenir Pour Tous (A.P.T) — structure juridique fondatrice


Je suis entierement disponible pour un echange, une presentation ou \
toute information complementaire, a votre convenance.

Dans l'attente de votre retour, veuillez recevoir mes sinceres salutations \
et toute ma consideration pour votre engagement en faveur de la jeunesse \
et de la diaspora centrafricaine.

Donald Chrysostome KITEZE
Ingenieur Microelectronique, Telecommunications et Reseaux
Fondateur — KTZ Emploi | President — Association Avenir Pour Tous (A.P.T)
kitzdon37@gmail.com
+33 6 25 34 51 75
https://ktzemploi.com
"""

# ─── ENVOI ────────────────────────────────────────────────────────────────────

def envoyer(dest):
    msg = MIMEMultipart()
    msg["Subject"] = OBJET
    msg["From"]    = f"{EXPEDITEUR_NOM} <{EXPEDITEUR_EMAIL}>"
    msg["To"]      = dest["email"]
    msg.attach(MIMEText(CORPS, "plain", "utf-8"))

    for chemin, nom_fichier in PIECES_JOINTES:
        if not os.path.exists(chemin):
            print(f"  [AVERTISSEMENT] Fichier introuvable : {chemin}")
            continue
        with open(chemin, "rb") as f:
            part = MIMEApplication(f.read(), Name=nom_fichier)
        part["Content-Disposition"] = f'attachment; filename="{nom_fichier}"'
        msg.attach(part)
        print(f"  Joint : {nom_fichier}")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(EXPEDITEUR_EMAIL, APP_PASSWORD)
        server.sendmail(EXPEDITEUR_EMAIL, dest["email"], msg.as_string())


if __name__ == "__main__":
    print("=== Envoi candidature Bangui Hub ===\n")
    for dest in DESTINATAIRES:
        print(f"[{dest['nom']}] Envoi vers {dest['email']}...")
        try:
            envoyer(dest)
            print(f"[{dest['nom']}] OK — mail envoye\n")
        except Exception as e:
            print(f"[{dest['nom']}] ECHEC — {e}\n")
    print("=== Termine ===")
