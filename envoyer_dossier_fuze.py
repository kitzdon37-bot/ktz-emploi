# -*- coding: utf-8 -*-
"""
Envoi du dossier de candidature FUZE / Digital Africa (AFD) — KTZ Emploi
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
    {"nom": "Digital Africa — FUZE", "email": "abeuque@digital-africa.co"},
    {"nom": "Digital Africa — Contact", "email": "contact@digital-africa.co"},
]

PIECES_JOINTES = [
    ("C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_FUZE_DIGITAL_AFRICA.pdf",
     "KTZ_Emploi_Dossier_FUZE_Digital_Africa_2026.pdf"),
    ("C:/Users/donald-chrysostome.k/rca-jobs/Titre_de_sejour (1).pdf",
     "Titre_de_sejour_KITEZE_Donald.pdf"),
    ("C:/Users/donald-chrysostome.k/Desktop/PV- KTZ Association.pdf",
     "PV_Association_Avenir_Pour_Tous_APT.pdf"),
    ("C:/Users/donald-chrysostome.k/Desktop/KTZ-Emploi-Documentation-v4.pdf",
     "KTZ_Emploi_Documentation_Technique_v4.pdf"),
]

OBJET = "Candidature FUZE — KTZ Emploi, 1ere plateforme digitale d'emploi en RCA — Pre-seed"

CORPS = """\
Madame, Monsieur,

Je me permets de vous contacter afin de soumettre la candidature de KTZ Emploi \
au programme FUZE de Digital Africa.

Je suis Donald KITEZE, jeune Centrafricain de 29 ans, Ingenieur en \
Microelectronique, Telecommunications et Reseaux (Universite Cote d'Azur, Nice), \
residant en France. J'ai fonde et developpe seul — sur fonds propres — \
KTZ Emploi : la premiere plateforme digitale de recrutement de la Republique \
Centrafricaine.


-- POURQUOI FUZE / DIGITAL AFRICA --

KTZ Emploi repond exactement aux criteres du programme FUZE :

1. FONDATEUR AFRICAIN : Centrafricain de la diaspora, intervenant directement \
sur le marche centrafricain avec une plateforme deployee et operationnelle.

2. SOLUTION TECH A FORT IMPACT : plateforme web (ktzemploi.com) + application \
mobile Android (Expo SDK 54 / React Native) mise en relation employeurs/candidats \
en RCA — marche 100% informel, zero concurrent digital existant.

3. STADE PRE-SEED AVEC TRACTION : prototype fonctionnel deploye, backend complet \
(API REST, JWT, CVtheque), discussions avancees avec partenaires institutionnels \
(IECD, ACFPE, PNUD, OIT, FAO).

4. MODELE ECONOMIQUE VIABLE : break-even prevu des le 6e mois d'exploitation \
(+324 372 XAF / +495 EUR de resultat net). ROI cumule 5 ans estime a 1,68M EUR. \
8 sources de revenus documentees.

5. SCALABILITE REGIONALE : modele replicable au Tchad, Congo-Brazzaville et \
Cameroun a partir de l'An 3. Code source open source (MIT) — fork libre autorise.

6. OPEN SOURCE : engagement de publier l'integralite du code sur GitHub sous \
licence MIT dans les 90 jours suivant le financement, avec API open data \
du marche de l'emploi centrafricain.


-- MES PROJETS --

1. KTZ EMPLOI — Ecosysteme complet dedie a l'emploi en RCA
https://ktzemploi.com

Trois piliers complementaires :
- Plateforme numerique (site web + application mobile Android) : mise en relation \
directe employeurs/candidats, CVtheque locale, gestion des candidatures, \
interface optimisee faible bande passante.
- Agence de recrutement physique a Bangui : accompagnement personnalise, \
preselection, accueil pour les candidats non-connectes.
- Centre de formation professionnelle certifiant : 6 modules An 1, \
50 apprenants, partenariat ACFPE et Universite de Bangui.

2. ASSOCIATION AVENIR POUR TOUS (A.P.T)
Fondee en France, dediee a la formation et a l'insertion des jeunes centrafricains.

3. PROJETS AGRO-INDUSTRIELS
Production locale d'huile d'arachide et elevage de poulets de chair — \
emplois directs en zones rurales, securite alimentaire.


-- MA DEMANDE --

Je souhaiterais :
1. Soumettre officiellement la candidature de KTZ Emploi au programme FUZE \
pour un investissement pre-seed de 50 000 a 100 000 EUR (equity)
2. Obtenir un rendez-vous avec l'equipe FUZE / Digital Africa pour presenter \
le projet en detail (visioconference disponible a votre convenance)
3. Etre oriente vers le bon interlocuteur au sein de Digital Africa \
si ce mail ne vous parvient pas directement


-- DOCUMENTS JOINTS --

1. Dossier de candidature FUZE complet (12 sections PDF) — marche, solution, \
traction, modele economique, projections, budget, strategie, risques
2. Titre de sejour — piece d'identite du porteur de projet
3. PV de l'Association Avenir Pour Tous (A.P.T)
4. Documentation technique KTZ Emploi v4 (42 pages) — budget detaille, \
projections financieres, analyse des risques, plan d'action


Je reste entierement disponible pour un echange, une presentation ou toute \
information complementaire.

Dans l'attente de votre retour, veuillez recevoir mes sinceres salutations.

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
    print("=== Envoi du dossier FUZE / Digital Africa ===\n")
    for dest in DESTINATAIRES:
        print(f"[{dest['nom']}] Envoi vers {dest['email']}...")
        try:
            envoyer(dest)
            print(f"[{dest['nom']}] OK — mail envoye\n")
        except Exception as e:
            print(f"[{dest['nom']}] ECHEC — {e}\n")
    print("=== Termine ===")
