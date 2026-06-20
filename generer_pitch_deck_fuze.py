# -*- coding: utf-8 -*-
"""
Pitch Deck — FUZE / Digital Africa
KTZ Emploi — Mai 2026
Format : A4 paysage (slides)
"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# ─── COULEURS ─────────────────────────────────────────────────────────────────
ORANGE     = HexColor("#F97316")
DARK_BLUE  = HexColor("#1E3A5F")
AFD_BLUE   = HexColor("#003189")
AFD_LIGHT  = HexColor("#E8EEFF")
LIGHT_GRAY = HexColor("#F8FAFC")
MED_GRAY   = HexColor("#94A3B8")
WHITE      = colors.white
GREEN      = HexColor("#16A34A")
LIGHT_GREEN= HexColor("#F0FDF4")
AMBER      = HexColor("#D97706")
LIGHT_AMBER= HexColor("#FFFBEB")

OUTPUT = "C:/Users/donald-chrysostome.k/rca-jobs/PITCH_DECK_FUZE_KTZ_EMPLOI.pdf"
W, H = landscape(A4)   # 297 x 210 mm
MARGIN = 1.5*cm
USABLE_W = W - 2*MARGIN
USABLE_H = H - 2*MARGIN

# ─── STYLES ───────────────────────────────────────────────────────────────────
def S(name, **kw):
    base = getSampleStyleSheet()["Normal"]
    return ParagraphStyle(name, parent=base, **kw)

def P(txt, s):  return Paragraph(txt, s)
def SP(h=0.3):  return Spacer(1, h*cm)

# ─── PAGE TEMPLATE ────────────────────────────────────────────────────────────
class SlideTemplate:
    def __init__(self):
        self.slide = 0
        self.total = 12

    def draw(self, canv, doc):
        self.slide += 1
        canv.saveState()
        canv.setFillColor(ORANGE)
        canv.rect(0, 0, 6*mm, H, fill=1, stroke=0)
        canv.setFillColor(AFD_BLUE)
        canv.rect(6*mm, 0, W - 6*mm, 10*mm, fill=1, stroke=0)
        canv.setFillColor(WHITE)
        canv.setFont("Helvetica", 6)
        canv.drawString(12*mm, 3.5*mm, "KTZ Emploi — Pitch Deck FUZE / Digital Africa — Confidentiel — Mai 2026")
        canv.drawRightString(W - 8*mm, 3.5*mm, f"{self.slide} / {self.total}")
        canv.setFillColor(AFD_BLUE)
        canv.rect(6*mm, H - 9*mm, W - 6*mm, 9*mm, fill=1, stroke=0)
        canv.setFillColor(ORANGE)
        canv.setFont("Helvetica-Bold", 6.5)
        canv.drawString(12*mm, H - 6*mm, "KTZ EMPLOI")
        canv.setFont("Helvetica", 6)
        canv.setFillColor(WHITE)
        canv.drawRightString(W - 8*mm, H - 6*mm, "ktzemploi.com  |  kitzdon37@gmail.com  |  +33 6 25 34 51 75")
        canv.restoreState()

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def slide_header(titre, couleur=AFD_BLUE):
    t = Table([[P(titre, S("SH", fontName="Helvetica-Bold", fontSize=18,
                            textColor=WHITE, alignment=TA_LEFT))]], colWidths=[USABLE_W])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), couleur),
        ("TOPPADDING",    (0,0),(-1,-1), 10),
        ("BOTTOMPADDING", (0,0),(-1,-1), 10),
        ("LEFTPADDING",   (0,0),(-1,-1), 16),
        ("ROUNDEDCORNERS",[6]),
    ]))
    return t

def kpi_cells(items, bg=AFD_LIGHT, border=AFD_BLUE):
    n = len(items)
    cw = USABLE_W / n
    cells = []
    for val, label, sub in items:
        inner = Table([
            [P(val,   S("KV"+val[:3], fontName="Helvetica-Bold", fontSize=22, textColor=ORANGE, alignment=TA_CENTER))],
            [P(label, S("KL"+val[:3], fontName="Helvetica-Bold", fontSize=8,  textColor=AFD_BLUE, alignment=TA_CENTER))],
            [P(sub,   S("KS"+val[:3], fontName="Helvetica",      fontSize=7,  textColor=MED_GRAY, alignment=TA_CENTER))],
        ], colWidths=[cw - 6])
        inner.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), bg),
            ("BOX",(0,0),(-1,-1), 0.5, border),
            ("TOPPADDING",(0,0),(-1,-1), 10),
            ("BOTTOMPADDING",(0,0),(-1,-1), 10),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[cw]*n)
    t.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3)]))
    return t

def two_col(left_content, right_content, left_w=0.5):
    lw = USABLE_W * left_w - 3
    rw = USABLE_W * (1-left_w) - 3
    t = Table([[left_content, right_content]], colWidths=[lw, rw])
    t.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
    ]))
    return t

def bullet_table(items, icon_color=ORANGE, bg=AFD_LIGHT, width=None):
    w = width or USABLE_W
    rows = []
    for icon, txt in items:
        rows.append([
            P(icon, S("IC"+txt[:4], fontName="Helvetica-Bold", fontSize=13,
                       textColor=icon_color, alignment=TA_CENTER)),
            P(txt,  S("BT"+txt[:4], fontName="Helvetica", fontSize=9,
                       textColor=HexColor("#1F2937"), leading=13)),
        ])
    t = Table(rows, colWidths=[0.8*cm, w - 0.8*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[bg, WHITE]),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),6),
        ("GRID",(0,0),(-1,-1),0.2,MED_GRAY),
    ]))
    return t

def data_tbl(headers, rows, col_widths=None):
    cw = col_widths or [USABLE_W/len(headers)]*len(headers)
    data = [[P(h, S("TH"+h[:3], fontName="Helvetica-Bold", fontSize=8,
                     textColor=WHITE, alignment=TA_CENTER)) for h in headers]]
    for row in rows:
        data.append([P(str(c), S("TC"+str(c)[:3], fontName="Helvetica", fontSize=8,
                                  textColor=HexColor("#1F2937"), leading=11)) for c in row])
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), AFD_BLUE),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[WHITE, LIGHT_GRAY]),
        ("GRID",(0,0),(-1,-1),0.3, MED_GRAY),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),6),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    return t

# ─── BUILD ────────────────────────────────────────────────────────────────────

def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=landscape(A4),
        leftMargin=MARGIN+6*mm, rightMargin=MARGIN,
        topMargin=MARGIN+9*mm, bottomMargin=MARGIN+10*mm,
        title="KTZ Emploi — Pitch Deck FUZE Digital Africa",
        author="Donald Chrysostome KITEZE",
    )
    st = SlideTemplate()
    story = []

    # SLIDE 1 — COVER
    cover = Table([
        [P("KTZ Emploi", S("CT", fontName="Helvetica-Bold", fontSize=48, textColor=ORANGE, alignment=TA_CENTER))],
        [P("La premiere plateforme digitale d'emploi en RCA", S("CS", fontName="Helvetica-Bold", fontSize=18, textColor=AFD_BLUE, alignment=TA_CENTER))],
        [SP(0.2)],
        [P("Candidature FUZE by Digital Africa — Pre-seed 50 000 - 100 000 EUR", S("CSS", fontName="Helvetica", fontSize=12, textColor=MED_GRAY, alignment=TA_CENTER))],
        [SP(0.5)],
        [P("Donald Chrysostome KITEZE  |  kitzdon37@gmail.com  |  +33 6 25 34 51 75  |  ktzemploi.com",
           S("CTC", fontName="Helvetica", fontSize=9, textColor=WHITE, alignment=TA_CENTER))],
    ], colWidths=[USABLE_W])
    cover.setStyle(TableStyle([
        ("BACKGROUND",(0,5),(0,5), AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),10),
        ("BOTTOMPADDING",(0,0),(-1,-1),10),
    ]))
    story.append(cover)
    story.append(PageBreak())

    # SLIDE 2 — PROBLEME
    story.append(slide_header("Le Probleme — Un marche de l'emploi 100% informel"))
    story.append(SP(0.3))
    story.append(kpi_cells([
        ("> 60%", "Taux chomage jeunes", "en Republique Centrafricaine"),
        ("0",     "Plateforme emploi",   "digitale existante en RCA"),
        ("> 80%", "Secteur informel",    "de l'economie centrafricaine"),
        ("5,5M",  "Habitants",          "marche primaire non adresse"),
    ]))
    story.append(SP(0.3))
    story.append(bullet_table([
        ("!", "Aucune plateforme nationale de recrutement en ligne — marche 100% informel"),
        ("!", "Les offres circulent uniquement par bouche-a-oreille ou groupes WhatsApp"),
        ("!", "Les entreprises et ONG peinent a trouver des profils locaux qualifies"),
        ("!", "Les zones hors Bangui totalement exclues du marche de l'emploi formel"),
        ("!", "Les jeunes diplomes n'ont aucun outil pour valoriser leurs competences"),
    ], icon_color=HexColor("#DC2626"), bg=HexColor("#FEF2F2")))
    story.append(PageBreak())

    # SLIDE 3 — SOLUTION
    story.append(slide_header("La Solution — Un ecosysteme complet en 3 piliers"))
    story.append(SP(0.3))
    pillars = Table([
        ["PILIER 1\nPLATEFORME NUMERIQUE", "PILIER 2\nAGENCE BANGUI", "PILIER 3\nFORMATION PROFESSIONNELLE"],
        [
            P("Site web ktzemploi.com + App Android\nMise en relation employeurs/candidats\nCVtheque + candidatures en ligne\nOptimise faible bande passante",
              S("P1", fontName="Helvetica", fontSize=8, textColor=HexColor("#1F2937"), leading=13)),
            P("Bureau 80m2 centre-ville Bangui\nAccompagnement personnalise\nPreselection pour ONG/entreprises\nAccueil candidats non-connectes",
              S("P2", fontName="Helvetica", fontSize=8, textColor=HexColor("#1F2937"), leading=13)),
            P("6 modules certifiants An 1\nInformatique, gestion, entrepreneuriat\n50 apprenants 1ere promotion\nPartenariat ACFPE + Univ. Bangui",
              S("P3", fontName="Helvetica", fontSize=8, textColor=HexColor("#1F2937"), leading=13)),
        ]
    ], colWidths=[USABLE_W/3]*3)
    pillars.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(0,0), ORANGE),
        ("BACKGROUND",(1,0),(1,0), AFD_BLUE),
        ("BACKGROUND",(2,0),(2,0), GREEN),
        ("BACKGROUND",(0,1),(0,1), LIGHT_AMBER),
        ("BACKGROUND",(1,1),(1,1), AFD_LIGHT),
        ("BACKGROUND",(2,1),(2,1), LIGHT_GREEN),
        ("FONTNAME",(0,0),(-1,0), "Helvetica-Bold"),
        ("FONTSIZE",(0,0),(-1,0), 9),
        ("TEXTCOLOR",(0,0),(-1,0), WHITE),
        ("ALIGN",(0,0),(-1,0), "CENTER"),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LEFTPADDING",(0,0),(-1,-1),8),
        ("GRID",(0,0),(-1,-1),0.5, WHITE),
    ]))
    story.append(pillars)
    story.append(SP(0.2))
    ag = Table([[P("+ Projets agro-industriels : huile d'arachide + aviculture — emplois ruraux + securite alimentaire",
                    S("AG", fontName="Helvetica-Bold", fontSize=8, textColor=WHITE, alignment=TA_CENTER))]],
               colWidths=[USABLE_W])
    ag.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),GREEN),
                             ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.append(ag)
    story.append(PageBreak())

    # SLIDE 4 — PRODUIT
    story.append(slide_header("Le Produit — Deja deploye et operationnel"))
    story.append(SP(0.3))
    left4 = Table([
        [P("<b>ktzemploi.com — LIVE</b>", S("L1", fontName="Helvetica-Bold", fontSize=11, textColor=AFD_BLUE))],
        [bullet_table([
            ("OK", "Site web Next.js 15 deploye sur Vercel (CDN USA)"),
            ("OK", "Backend API REST complet — auth JWT"),
            ("OK", "CVtheque candidats — filtres secteur/lieu/contrat"),
            ("OK", "Gestion candidatures en ligne"),
            ("OK", "Tableau de bord entreprises recrutantes"),
            ("OK", "Application Android (Expo SDK 54) testee"),
            ("OK", "Notifications push + alertes WhatsApp/SMS"),
        ], icon_color=GREEN, bg=LIGHT_GREEN, width=USABLE_W*0.54)],
    ], colWidths=[USABLE_W*0.55])
    left4.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))

    right4 = Table([
        [P("<b>Stack — Open Source MIT</b>", S("R1", fontName="Helvetica-Bold", fontSize=11, textColor=AFD_BLUE))],
        [data_tbl(["Composant", "Tech"],
                  [["Frontend web","Next.js 15"],["Mobile","Expo / RN"],
                   ["BDD","Prisma + Neon"],["Auth","NextAuth JWT"],
                   ["UI Mobile","RN Paper"],["Hosting","Vercel USA"],["Store","Google Play"]],
                  [USABLE_W*0.2, USABLE_W*0.22])],
    ], colWidths=[USABLE_W*0.43])
    right4.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))
    story.append(two_col(left4, right4, left_w=0.55))
    story.append(PageBreak())

    # SLIDE 5 — TRACTION
    story.append(slide_header("Traction — Ce qui est deja fait (sur fonds propres)"))
    story.append(SP(0.3))
    story.append(kpi_cells([
        ("3 000+","EUR investis",     "Fonds propres fondateur"),
        ("42 pgs","Doc. technique",   "Budget, projections, risques"),
        ("12",    "Courriers envoyes","PNUD, OIT, FAO, OIM, GIZ..."),
        ("2",     "Partenariats",     "IECD Bangui + ACFPE en cours"),
    ]))
    story.append(SP(0.25))
    story.append(data_tbl(
        ["Realisation", "Statut", "Detail"],
        [
            ["Plateforme web ktzemploi.com",       "LIVE",            "Visible depuis la RCA"],
            ["Application Android Expo SDK 54",    "Teste",           "Google Play en cours"],
            ["API REST (8 endpoints)",              "Operationnelle",  "Login, offres, candidatures, profil"],
            ["Dossier PNUD / YouthConnekt",        "Soumis",          "30-50K USD en cours d'evaluation"],
            ["IECD Bangui (Mme Pauline)",           "Discussion avancee","Partenariat recrutement ONG"],
            ["ACFPE",                               "Contact etabli",  "Partenariat formation"],
            ["Association APT fondee en France",   "Operationnelle",  "Bras legal formation"],
        ],
        [USABLE_W*0.37, USABLE_W*0.2, USABLE_W*0.43]
    ))
    story.append(PageBreak())

    # SLIDE 6 — MARCHE
    story.append(slide_header("Taille du marche — Blue ocean en Afrique centrale"))
    story.append(SP(0.3))
    story.append(kpi_cells([
        ("5,5M", "Habitants RCA",     "Marche primaire"),
        ("0",    "Concurrent direct", "Premier entrant"),
        ("200+", "ONG recrutantes",   "Segment premium paye"),
        ("40M+", "Potentiel regional","RCA + Tchad + Congo + Cam."),
    ]))
    story.append(SP(0.25))
    lm = Table([
        [P("<b>Segments prioritaires RCA</b>", S("SM1", fontName="Helvetica-Bold", fontSize=10, textColor=AFD_BLUE))],
        [bullet_table([
            (">>", "500+ employeurs formels cibles An 1"),
            (">>", "ONG : PNUD, UNICEF, CICR, MSF, Oxfam, IRC..."),
            (">>", "Telecoms : Orange RCA, Telecel, Moov Africa"),
            (">>", "Secteur prive : BTP, commerce, sante, banque"),
            (">>", "Institutions publiques et ministeres"),
        ], width=USABLE_W*0.47)],
    ], colWidths=[USABLE_W*0.48])
    lm.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))
    rm = Table([
        [P("<b>Expansion regionale (An 3-5)</b>", S("SM2", fontName="Helvetica-Bold", fontSize=10, textColor=AFD_BLUE))],
        [data_tbl(["Pays", "Population", "Annee"],
                  [["RCA","5,5M","An 1-2"],["Tchad","17M","An 3"],
                   ["Congo-Brazza","6M","An 4"],["Cameroun","27M","An 5"]],
                  [USABLE_W*0.18, USABLE_W*0.14, USABLE_W*0.14])],
    ], colWidths=[USABLE_W*0.48])
    rm.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))
    story.append(two_col(lm, rm, left_w=0.52))
    story.append(PageBreak())

    # SLIDE 7 — MODELE ECO
    story.append(slide_header("Modele economique — 8 sources de revenus complementaires"))
    story.append(SP(0.25))
    story.append(data_tbl(
        ["Source de revenus", "Prix/mois XAF", "Cible M6", "Revenu M6 XAF"],
        [
            ["Abonnement Basique",        "15 000",   "20 ent.",   "300 000"],
            ["Abonnement Pro",            "40 000",   "10 ent.",   "400 000"],
            ["Abonnement Premium",        "80 000",   "5 ent.",    "400 000"],
            ["Offre a la une (featured)", "30 000",   "20 offres", "600 000"],
            ["Recrutement executif",      "15% sal.", "3 placem.", "1 500 000"],
            ["Acces CVtheque recruteurs", "25 000",   "15 rec.",   "375 000"],
            ["Formations candidats",      "15 000",   "20 appr.",  "300 000"],
            ["Publicite bannières site",  "forfait",  "Local",     "150 000"],
        ],
        [USABLE_W*0.32, USABLE_W*0.18, USABLE_W*0.18, USABLE_W*0.32]
    ))
    story.append(SP(0.2))
    tot = Table([[
        P("TOTAL REVENUS MOIS 6", S("TR1", fontName="Helvetica-Bold", fontSize=10, textColor=WHITE)),
        P("Charges : 3 700 628 XAF", S("TR2", fontName="Helvetica", fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        P("BENEFICE NET : +324 372 XAF (+495 EUR)", S("TR3", fontName="Helvetica-Bold", fontSize=10, textColor=ORANGE, alignment=TA_RIGHT)),
    ]], colWidths=[USABLE_W*0.35, USABLE_W*0.3, USABLE_W*0.35])
    tot.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("LEFTPADDING",(0,0),(-1,-1),10),
    ]))
    story.append(tot)
    story.append(PageBreak())

    # SLIDE 8 — FINANCIALS
    story.append(slide_header("Projections financieres — Break-even Mois 6"))
    story.append(SP(0.3))
    story.append(kpi_cells([
        ("M6",     "Break-even",      "+324 372 XAF net"),
        ("67 800", "EUR investis",    "44,5M XAF — chiffre"),
        ("1,68M",  "EUR ROI 5 ans",  "800M+ XAF cumules"),
        ("24-30m", "Retour invest.",  "Initial 67 800 EUR"),
    ]))
    story.append(SP(0.25))
    story.append(data_tbl(
        ["Periode", "Revenus/mois", "Charges/mois", "Resultat net"],
        [
            ["M1-M3  Lancement",     "0 - 600K XAF",    "3 701K XAF", "Deficit — fonds de roulement"],
            ["M4-M5  Demarrage",     "1,5M - 2,8M XAF", "3 701K XAF", "Deficit decroissant"],
            ["M6     Seuil",         "4 025 000 XAF",   "3 701K XAF", "+324 372 XAF"],
            ["M7-M12 Croissance",    "5M - 6,5M XAF",   "3 900K XAF", "+1,1M - 2,6M XAF"],
            ["An 2   Consolidation", "8M - 10M XAF",    "4 500K XAF", "+3,5M - 5,5M XAF"],
            ["An 3-5 Hub regional",  "15M - 25M XAF",   "8 000K XAF", "+7M - 17M XAF"],
        ],
        [USABLE_W*0.2, USABLE_W*0.23, USABLE_W*0.22, USABLE_W*0.35]
    ))
    story.append(PageBreak())

    # SLIDE 9 — BUDGET FUZE
    story.append(slide_header("Utilisation des fonds FUZE — 90 000 EUR"))
    story.append(SP(0.3))
    story.append(data_tbl(
        ["Poste", "Montant EUR", "% budget", "Justification"],
        [
            ["Materiel IT + vehicule Toyota HiLux", "30 000", "33%", "Infrastructure critique terrain"],
            ["Bureau Bangui 6 mois + amenagement",  "12 000", "13%", "Acces marche physique local"],
            ["Equipe 7 personnes (6 mois salaires)","15 000", "17%", "RH cle pour la croissance"],
            ["Marketing & acquisition clients",     " 8 000", " 9%", "Radio, SMS, reseaux sociaux"],
            ["Centre de formation (1ere promo)",    "10 000", "11%", "6 modules, 50 apprenants"],
            ["Reserve tresorerie (3 mois)",         "10 000", "11%", "Securite operationnelle"],
            ["Formalites legales + divers",         " 5 000", " 6%", "SARL, RCCM, NIF, agrements"],
        ],
        [USABLE_W*0.35, USABLE_W*0.13, USABLE_W*0.09, USABLE_W*0.43]
    ))
    story.append(SP(0.2))
    tot2 = Table([[
        P("TOTAL DEMANDE FUZE", S("TF1", fontName="Helvetica-Bold", fontSize=10, textColor=WHITE)),
        P("90 000 EUR", S("TF2", fontName="Helvetica-Bold", fontSize=13, textColor=ORANGE, alignment=TA_CENTER)),
        P("Equity — objectif fondateur > 60% apres FUZE", S("TF3", fontName="Helvetica", fontSize=9, textColor=WHITE)),
    ]], colWidths=[USABLE_W*0.35, USABLE_W*0.2, USABLE_W*0.45])
    tot2.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("LEFTPADDING",(0,0),(-1,-1),10),
    ]))
    story.append(tot2)
    story.append(PageBreak())

    # SLIDE 10 — EQUIPE
    story.append(slide_header("L'Equipe — Fondateur technique + equipe locale a recruter"))
    story.append(SP(0.3))
    le = Table([
        [P("<b>Donald Chrysostome KITEZE</b>", S("E1", fontName="Helvetica-Bold", fontSize=12, textColor=AFD_BLUE))],
        [P("Fondateur & CEO — Developpeur Full-Stack", S("E2", fontName="Helvetica", fontSize=9, textColor=ORANGE))],
        [SP(0.1)],
        [bullet_table([
            (">>", "Ingenieur Microelectronique, Telecom & Reseaux"),
            (">>", "Universite Cote d'Azur / IUT Nice, France"),
            (">>", "Centrafricain, 29 ans, resident Nice"),
            (">>", "Developpe seul la plateforme + app mobile"),
            (">>", "President — Association APT (France)"),
        ], width=USABLE_W*0.47)],
    ], colWidths=[USABLE_W*0.48])
    le.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))

    re = Table([
        [P("<b>Equipe locale Bangui (avec FUZE)</b>", S("E3", fontName="Helvetica-Bold", fontSize=12, textColor=AFD_BLUE))],
        [P("7 postes a recruter", S("E4", fontName="Helvetica", fontSize=9, textColor=ORANGE))],
        [SP(0.1)],
        [data_tbl(["Poste", "Lieu", "Sal./mois"],
                  [["Directeur agence","Bangui","200K XAF"],["Agent recrutement x2","Bangui","150K XAF"],
                   ["Resp. formation","Bangui","180K XAF"],["Chargee comm.","Bangui","150K XAF"],
                   ["Technicien support","Bangui","130K XAF"],["Chauffeur/logist.","Bangui","120K XAF"]],
                  [USABLE_W*0.22, USABLE_W*0.1, USABLE_W*0.14])],
    ], colWidths=[USABLE_W*0.48])
    re.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP")]))
    story.append(two_col(le, re, left_w=0.52))
    story.append(PageBreak())

    # SLIDE 11 — IMPACT
    story.append(slide_header("Impact social & Objectifs de Developpement Durable"))
    story.append(SP(0.3))
    story.append(kpi_cells([
        ("5 000", "Candidats An 1",    "Plateforme + agence"),
        ("200",   "Entreprises An 1",  "ONG, PME, institutions"),
        ("500",   "Jeunes formes An 1","Centre de formation"),
        ("50",    "Emplois directs",   "Agence + projets agro"),
    ]))
    story.append(SP(0.25))
    story.append(data_tbl(
        ["ODD", "Action concrete KTZ Emploi"],
        [
            ["ODD 8 — Emploi decent",   "Plateforme + agence : acces a l'emploi formel pour les 18-35 ans"],
            ["ODD 4 — Education",       "Centre certifiant : 6 modules, 500 jeunes formes An 1"],
            ["ODD 10 — Inegalites",     "Application mobile accessible dans les zones secondaires hors Bangui"],
            ["ODD 2 — Securite alim.",  "Huile d'arachide + aviculture : emplois ruraux et nutrition locale"],
            ["ODD 9 — Infrastructure",  "1ere plateforme emploi RCA — API open data marche du travail"],
            ["ODD 17 — Partenariats",   "PNUD, UNICEF, OIT, FAO, GIZ, ACFPE, Universite Bangui"],
        ],
        [USABLE_W*0.25, USABLE_W*0.75]
    ))
    story.append(PageBreak())

    # SLIDE 12 — CALL TO ACTION
    story.append(slide_header("Ce que nous demandons a FUZE / Digital Africa"))
    story.append(SP(0.3))
    asks = [
        ("90K EUR", "Investissement equity", "Pour materiel, bureau Bangui, equipe et lancement"),
        ("Reseau",  "Ecosysteme Digital Africa", "Orange Ventures, Proparco, Partech, institutionnels"),
        ("Mentorat","Accompagnement expert", "Go-to-market, equity, conformite, Series A"),
        ("Label AFD","Credibilite institutionnelle", "Cle pour convaincre les grands recruteurs ONU/ONG"),
    ]
    cells_ask = []
    for val, label, desc in asks:
        inner = Table([
            [P(val, S("AV"+val[:3], fontName="Helvetica-Bold", fontSize=15, textColor=ORANGE, alignment=TA_CENTER))],
            [P(label, S("AL"+val[:3], fontName="Helvetica-Bold", fontSize=9, textColor=AFD_BLUE, alignment=TA_CENTER))],
            [P(desc, S("AD"+val[:3], fontName="Helvetica", fontSize=7.5, textColor=MED_GRAY, alignment=TA_CENTER, leading=11))],
        ], colWidths=[USABLE_W/4 - 6])
        inner.setStyle(TableStyle([
            ("BACKGROUND",(0,0),(-1,-1), AFD_LIGHT),
            ("BOX",(0,0),(-1,-1), 1, AFD_BLUE),
            ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ]))
        cells_ask.append(inner)
    ta = Table([cells_ask], colWidths=[USABLE_W/4]*4)
    ta.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),3),("RIGHTPADDING",(0,0),(-1,-1),3)]))
    story.append(ta)
    story.append(SP(0.4))
    final = Table([[P(
        "KTZ Emploi est le PREMIER ENTRANT sur un marche de 5,5 millions d'habitants "
        "sans aucun concurrent digital. Prototype deploye, break-even Mois 6, "
        "ROI 5 ans documente a 1,68M EUR.",
        S("FB", fontName="Helvetica-Bold", fontSize=11, textColor=WHITE, alignment=TA_CENTER, leading=16))
    ]], colWidths=[USABLE_W])
    final.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),14),("BOTTOMPADDING",(0,0),(-1,-1),14),
        ("LEFTPADDING",(0,0),(-1,-1),16),("RIGHTPADDING",(0,0),(-1,-1),16),
        ("ROUNDEDCORNERS",[8]),
    ]))
    story.append(final)
    story.append(SP(0.2))
    sig = Table([[P(
        "Donald Chrysostome KITEZE  |  kitzdon37@gmail.com  |  +33 6 25 34 51 75  |  ktzemploi.com",
        S("SG", fontName="Helvetica-Bold", fontSize=9, textColor=AFD_BLUE, alignment=TA_CENTER))
    ]], colWidths=[USABLE_W])
    sig.setStyle(TableStyle([("LINEABOVE",(0,0),(-1,-1),1,ORANGE),("TOPPADDING",(0,0),(-1,-1),6)]))
    story.append(sig)

    doc.build(story, onFirstPage=st.draw, onLaterPages=st.draw)
    print(f"Pitch deck genere : {OUTPUT}")


if __name__ == "__main__":
    build()
