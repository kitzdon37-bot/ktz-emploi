# -*- coding: utf-8 -*-
"""
Candidature AfCFTA Startup Acceleration & Partnership Programme 2026
Deadline : 24 mai 2026
Email : SME.Support@au-afcfta.org
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
    {"nom": "AfCFTA SME Unit", "email": "SME.Support@au-afcfta.org"},
]

PIECES_JOINTES = [
    ("C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_FUZE_DIGITAL_AFRICA.pdf",
     "KTZ_Emploi_Business_Plan_2026.pdf"),
    ("C:/Users/donald-chrysostome.k/rca-jobs/PITCH_DECK_FUZE_KTZ_EMPLOI.pdf",
     "KTZ_Emploi_Pitch_Deck_2026.pdf"),
]

OBJET = "Application: AfCFTA Startup Acceleration & Partnership Programme 2026 — KTZ Emploi (Digital Platform / RCA)"

CORPS = """\
Dear AfCFTA SME Unit Team,

I am writing to submit my application for the AfCFTA Startup Acceleration \
& Partnership Programme 2026.

My name is Donald Chrysostome KITEZE, 29 years old, a Microelectronics, \
Telecommunications and Networks Engineer (University Cote d'Azur, Nice, France), \
founder of KTZ Emploi — the first digital employment platform in \
the Central African Republic (CAR).


-- STARTUP OVERVIEW --

Name    : KTZ Emploi
Website : https://ktzemploi.com
Sector  : Digital Platform / HR-Tech / EdTech
Stage   : Pre-seed — Functional prototype deployed
Country : Central African Republic (CAR) / France


-- WHAT KTZ EMPLOI IS --

KTZ Emploi is the FIRST and ONLY digital recruitment platform in the Central \
African Republic, a market of 5.5 million people with ZERO digital job platform \
and a youth unemployment rate above 60%.

The platform operates on three complementary pillars:

1. DIGITAL PLATFORM (ktzemploi.com + Android app)
   - Job board connecting employers and candidates in CAR
   - CV database, application management, candidate tracking
   - Optimized for low bandwidth and entry-level smartphones (React Native / Expo SDK 54)
   - API-first architecture enabling open data access to the CAR employment market

2. PHYSICAL RECRUITMENT AGENCY (Bangui, CAR)
   - In-person pre-selection and placement services
   - Serving NGOs, international organizations, and local SMEs
   - Bridge between the digital platform and offline communities

3. VOCATIONAL TRAINING CENTER
   - 6 certified training modules (Year 1)
   - Target: 50 learners per cohort
   - Partnerships in progress: ACFPE (National Employment Agency), University of Bangui

Business model: 8 revenue streams (premium job listings, CV database access, \
direct recruitment fees, training fees, employer branding, API access, B2G contracts, \
diaspora remote hiring)

Financial projections:
- Break-even: Month 6 of operations (+324,372 XAF net profit)
- 5-year cumulative ROI: EUR 1.68 million
- Initial investment: EUR 3,000-5,000 (self-funded)


-- ALIGNMENT WITH AfCFTA PRIORITIES --

KTZ Emploi directly addresses AfCFTA priority sectors:

DIGITAL PLATFORM: KTZ Emploi is a two-sided digital marketplace connecting \
labor supply and demand across the CEMAC region. The platform's API-first \
architecture enables cross-border labor market data sharing aligned with \
AfCFTA's protocol on the free movement of persons and workers.

SCALABILITY ACROSS AFRICA: The platform is designed for rapid replication:
- Year 1: Central African Republic (5.5M people)
- Year 2: Chad (17M people) + Republic of Congo (5.5M people)
- Year 3: Cameroon (27M people) + Gabon (2.3M people)
Total addressable market by Year 3: 57+ million people across 5 CEMAC countries

INTERNATIONAL EXPANSION READINESS: KTZ Emploi is structured as a tech platform \
with API access, enabling international companies (including Korean companies \
expanding in Central Africa) to access verified local talent pools. \
This creates a direct bridge between AfCFTA member states and \
global investment partners including Korea.

INTRA-AFRICAN TRADE: By formalizing labor markets across CEMAC countries, \
KTZ Emploi directly supports intra-African trade by:
- Enabling formal employment contracts (replacing informal arrangements)
- Providing employers with cross-border talent sourcing
- Building a regional HR data infrastructure aligned with AfCFTA protocols


-- INNOVATION AND COMPETITIVE ADVANTAGE --

1. FIRST MOVER: Zero digital competitors in CAR — absolute first mover advantage
2. MODERN TECH STACK: Next.js 15, React Native/Expo SDK 54, REST API with JWT auth
3. OPEN SOURCE: Full codebase published under MIT license within 90 days of funding
4. OPEN DATA: First open data API for the Central African employment market
5. HYBRID MODEL: Digital + physical + training — unique combination not replicated anywhere in CEMAC
6. DIASPORA-LED: Founded by a Centrafricain engineer from France with deep local knowledge


-- TRACTION AND VALIDATION --

- Functional prototype: ktzemploi.com live on Vercel (Next.js)
- Android application developed and tested (Google Play submission pending)
- Complete REST API backend (auth JWT, CV database, applications, favorites, stats)
- FUZE / Digital Africa (AFD) application: submitted and declared ELIGIBLE
- PNUD YouthConnekt RCA: application in progress
- 12 institutional letters sent: UNDP, ILO, FAO, IOM, GIZ, Proparco
- Partnerships in progress: IECD Bangui, ACFPE, UNDP
- Technical documentation: 42 pages (budget, projections, risk analysis, roadmap)
- Association Avenir Pour Tous (APT): legally registered in France


-- FOUNDER PROFILE --

Donald Chrysostome KITEZE
- Age: 29 years old, Centrafricain, French diaspora
- Education: MEng Microelectronics, Telecommunications & Networks — \
University Cote d'Azur, Nice, France
- Built KTZ Emploi entirely alone, self-funded (EUR 3,000-5,000)
- Full-stack developer: Next.js, React Native, Node.js, PostgreSQL, REST API
- LinkedIn: https://linkedin.com/in/donald-kiteze


-- DOCUMENTS ATTACHED --

1. KTZ Emploi Business Plan 2026 (12 sections, PDF) — market analysis, \
solution, business model, financial projections (5 years), budget, \
risk analysis, team, impact, scalability roadmap

2. KTZ Emploi Pitch Deck 2026 (12 slides, PDF) — visual presentation \
of the project for investor/accelerator review


I am fully available for any additional information, interview, or \
presentation at your convenience.

Thank you for considering KTZ Emploi for the AfCFTA Startup Acceleration \
& Partnership Programme 2026. I believe KTZ Emploi represents exactly the \
type of innovative, scalable, Africa-first digital platform that AfCFTA \
aims to promote and accelerate.

Sincerely,

Donald Chrysostome KITEZE
Founder — KTZ Emploi
President — Association Avenir Pour Tous (A.P.T)
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
    print("=== Envoi candidature AfCFTA Startup Acceleration 2026 ===\n")
    for dest in DESTINATAIRES:
        print(f"[{dest['nom']}] Envoi vers {dest['email']}...")
        try:
            envoyer(dest)
            print(f"[{dest['nom']}] OK — mail envoye\n")
        except Exception as e:
            print(f"[{dest['nom']}] ECHEC — {e}\n")
    print("=== Termine ===")
