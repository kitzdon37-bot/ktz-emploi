# -*- coding: utf-8 -*-
"""
Envoi du dossier de candidature PNUD / YouthConnekt RCA — KTZ Emploi
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
    {"nom": "PNUD Centrafrique",    "email": "registry.cf@undp.org"},
    {"nom": "YouthConnekt Africa",  "email": "info@youthconnektafrica.org"},
]

PIECES_JOINTES = [
    ("C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_PNUD_YOUTHCONNEKT.pdf",
     "KTZ_Emploi_Dossier_PNUD_YouthConnekt_2026.pdf"),
    ("C:/Users/donald-chrysostome.k/rca-jobs/Titre_de_sejour (1).pdf",
     "Titre_de_sejour_KITEZE_Donald.pdf"),
    ("C:/Users/donald-chrysostome.k/Desktop/PV- KTZ Association.pdf",
     "PV_Association_Avenir_Pour_Tous_APT.pdf"),
    ("C:/Users/donald-chrysostome.k/Desktop/KTZ-Emploi-Documentation-v4.pdf",
     "KTZ_Emploi_Documentation_Technique_v4.pdf"),
]

OBJET = "Candidature KTZ Emploi — Programme YouthConnekt RCA / PNUD — Innovation Numerique & Emploi"

CORPS = """\
Madame, Monsieur,

Je me permets de vous soumettre la candidature de KTZ Emploi au programme \
YouthConnekt RCA dans la categorie Innovation Numerique & Emploi.

KTZ Emploi est la premiere plateforme digitale de recrutement de la Republique \
Centrafricaine, developpee par un jeune ingenieur centrafricain de la diaspora. \
Le projet articule trois piliers complementaires : une plateforme numerique \
(site web + application mobile Android), une agence de recrutement physique \
a Bangui, et un centre de formation professionnelle certifiant.


-- POURQUOI YOUTHCONNEKT RCA --

KTZ Emploi s'aligne directement avec les quatre axes strategiques du programme :

1. EMPLOYABILITE : la plateforme constitue un parcours complet d'insertion \
pour les jeunes centrafricains — formation, candidature, emploi.

2. ENTREPRENEURIAT : le projet est lui-meme une startup fondee par un jeune \
de la diaspora ; le centre de formation inclut un module dedie a la creation \
d'entreprise en RCA.

3. INNOVATION NUMERIQUE : premiere plateforme digitale d'emploi en RCA, \
developpee avec une stack moderne (Next.js, React Native / Expo SDK 54) et \
optimisee pour les contraintes locales (faible connectivite, smartphones \
d'entree de gamme).

4. AUTONOMISATION ECONOMIQUE : les projets agro-industriels associes \
(production d'huile d'arachide, elevage de poulets de chair) creent des \
emplois directs en zones rurales et renforcent l'autonomie economique des \
communautes locales. Intervention dans les memes villes que YouthConnekt RCA : \
Bangui, Berberati, Bossangoa.


-- ETAT D'AVANCEMENT --

Le projet est a un stade de prototype fonctionnel :
- Plateforme web deployee et operationnelle : https://ktzemploi.com
- Application mobile Android developpee et testee
- Backend complet : API REST, authentification JWT, CVtheque, gestion des candidatures
- Association Avenir Pour Tous (A.P.T) fondee en France
- Discussions en cours avec l'IECD Bangui et l'ACFPE
- Documentation technique complete de 42 pages (budget, projections, risques)

Seuil de rentabilite prevu des le 6e mois d'exploitation. \
Investissement initial documente : 44 476 524 XAF (67 800 EUR). \
ROI cumule sur 5 ans : 1,68 M EUR.


-- MA DEMANDE --

Je souhaiterais :
1. Integrer officiellement KTZ Emploi dans le programme YouthConnekt RCA \
comme startup partenaire dans la categorie Innovation Numerique & Emploi
2. Beneficier d'une subvention d'amorcage (30 000 a 50 000 USD) pour financer \
l'ouverture de l'agence physique a Bangui et le lancement du centre de formation
3. Acceder au reseau YouthConnekt RCA et au mentorat des experts PNUD en \
entrepreneuriat numerique et developpement economique


-- DOCUMENTS JOINTS --

1. Dossier de candidature complet (PDF) — 13 sections, chiffres issus de la \
documentation technique
2. Titre de sejour — piece d'identite du porteur de projet
3. PV de l'Association Avenir Pour Tous (A.P.T)
4. Documentation technique KTZ Emploi v4 (42 pages) — budget, projections, \
plan d'action, analyse des risques


Je reste entierement disponible pour un echange ou une presentation a votre \
convenance, par visioconference ou en personne a Bangui lors de mon prochain deplacement.

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
    print("=== Envoi du dossier PNUD / YouthConnekt RCA ===\n")
    for dest in DESTINATAIRES:
        print(f"[{dest['nom']}] Envoi vers {dest['email']}...")
        try:
            envoyer(dest)
            print(f"[{dest['nom']}] OK — mail envoye\n")
        except Exception as e:
            print(f"[{dest['nom']}] ECHEC — {e}\n")
    print("=== Termine ===")
