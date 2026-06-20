# -*- coding: utf-8 -*-
"""
Generateur PDF — Dossier de candidature PNUD / YouthConnekt RCA
KTZ Emploi — Mai 2026
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import BalancedColumns
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import os

# ─── COULEURS ─────────────────────────────────────────────────────────────────
ORANGE      = HexColor("#F97316")
DARK_BLUE   = HexColor("#1E3A5F")
LIGHT_BLUE  = HexColor("#EFF6FF")
LIGHT_GRAY  = HexColor("#F8FAFC")
MED_GRAY    = HexColor("#94A3B8")
WHITE       = colors.white
BLACK       = colors.black
GREEN       = HexColor("#16A34A")
LIGHT_GREEN = HexColor("#F0FDF4")
AMBER       = HexColor("#D97706")
LIGHT_AMBER = HexColor("#FFFBEB")

OUTPUT = "C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_PNUD_YOUTHCONNEKT.pdf"
W, H = A4

# ─── STYLES ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def style(name="Normal", **kw):
    return ParagraphStyle(name, parent=styles["Normal"], **kw)

S_TITLE    = style("T1", fontName="Helvetica-Bold",   fontSize=22, textColor=WHITE,    spaceAfter=4,  leading=26)
S_SUBTITLE = style("T2", fontName="Helvetica",        fontSize=11, textColor=WHITE,    spaceAfter=2,  leading=14)
S_H1       = style("H1", fontName="Helvetica-Bold",   fontSize=13, textColor=WHITE,    spaceAfter=3,  leading=16)
S_H2       = style("H2", fontName="Helvetica-Bold",   fontSize=11, textColor=DARK_BLUE,spaceBefore=8, spaceAfter=4, leading=14)
S_H3       = style("H3", fontName="Helvetica-Bold",   fontSize=9,  textColor=DARK_BLUE,spaceBefore=4, spaceAfter=2, leading=12)
S_BODY     = style("BD", fontName="Helvetica",        fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, spaceAfter=3)
S_BODY_J   = style("BJ", fontName="Helvetica",        fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, spaceAfter=3, alignment=TA_JUSTIFY)
S_SMALL    = style("SM", fontName="Helvetica",        fontSize=7.5,textColor=MED_GRAY,  leading=11)
S_BULLET   = style("BU", fontName="Helvetica",        fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, leftIndent=10, spaceAfter=2, bulletIndent=2)
S_TABLE_H  = style("TH", fontName="Helvetica-Bold",   fontSize=8,  textColor=WHITE,    alignment=TA_CENTER, leading=11)
S_TABLE_C  = style("TC", fontName="Helvetica",        fontSize=8,  textColor=HexColor("#1F2937"), leading=11)
S_TABLE_CL = style("TCL",fontName="Helvetica",        fontSize=8,  textColor=HexColor("#1F2937"), leading=11, alignment=TA_LEFT)
S_TABLE_B  = style("TB", fontName="Helvetica-Bold",   fontSize=8,  textColor=HexColor("#1F2937"), leading=11)
S_HIGHLIGHT= style("HL", fontName="Helvetica-Bold",   fontSize=9,  textColor=DARK_BLUE, leading=13)
S_LABEL    = style("LB", fontName="Helvetica-Bold",   fontSize=7.5,textColor=ORANGE,   leading=11, spaceAfter=1)
S_FOOTER   = style("FT", fontName="Helvetica",        fontSize=7,  textColor=MED_GRAY,  alignment=TA_CENTER)
S_TOC      = style("TOC",fontName="Helvetica",        fontSize=9,  textColor=DARK_BLUE, leading=16, leftIndent=8)
S_TOC_T    = style("TOCT",fontName="Helvetica-Bold",  fontSize=10, textColor=DARK_BLUE, leading=18)

def P(txt, s=None): return Paragraph(txt, s or S_BODY)
def SP(h=0.3):      return Spacer(1, h*cm)
def HR(c=ORANGE, w=0.5): return HRFlowable(width="100%", thickness=w, color=c, spaceAfter=4, spaceBefore=4)

def section_header(titre, icon=""):
    t = Table([[Paragraph(f"{icon}  {titre}" if icon else titre, S_H1)]],
              colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), DARK_BLUE),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
    ]))
    return [SP(0.2), t, SP(0.3)]

def info_box(label, value, bg=LIGHT_BLUE, border=DARK_BLUE):
    t = Table([[Paragraph(label, S_LABEL), Paragraph(value, S_BODY)]],
              colWidths=[3.5*cm, W - 7.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("BOX",           (0,0), (-1,-1), 0.5, border),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
    ]))
    return t

def kpi_row(items):
    cells = []
    for label, val, sub in items:
        inner = Table([[Paragraph(val, ParagraphStyle("KV", fontName="Helvetica-Bold",
                                  fontSize=16, textColor=ORANGE, alignment=TA_CENTER))],
                       [Paragraph(label, ParagraphStyle("KL", fontName="Helvetica-Bold",
                                  fontSize=7.5, textColor=DARK_BLUE, alignment=TA_CENTER))],
                       [Paragraph(sub, ParagraphStyle("KS", fontName="Helvetica",
                                  fontSize=6.5, textColor=MED_GRAY, alignment=TA_CENTER))]],
                      colWidths=[(W - 4*cm)/len(items)])
        inner.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), LIGHT_BLUE),
            ("BOX",           (0,0), (-1,-1), 0.5, DARK_BLUE),
            ("ROUNDEDCORNERS",[4]),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[(W - 4*cm)/len(items)] * len(items),
              hAlign="LEFT")
    t.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),3),
                            ("RIGHTPADDING",(0,0),(-1,-1),3)]))
    return t

def pillar_table(pillars):
    rows = []
    for icon, titre, desc in pillars:
        rows.append([
            Paragraph(icon, ParagraphStyle("IC", fontName="Helvetica-Bold",
                       fontSize=18, textColor=ORANGE, alignment=TA_CENTER)),
            Paragraph(titre, ParagraphStyle("PT", fontName="Helvetica-Bold",
                       fontSize=9, textColor=DARK_BLUE)),
            Paragraph(desc, S_BODY),
        ])
    t = Table(rows, colWidths=[1.2*cm, 4*cm, W - 4*cm - 5.7*cm])
    t.setStyle(TableStyle([
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [LIGHT_BLUE, LIGHT_GRAY]),
        ("BOX",           (0,0), (-1,-1), 0.5, MED_GRAY),
        ("LINEBELOW",     (0,0), (-1,-1), 0.3, MED_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ]))
    return t

def data_table(headers, rows, col_widths=None):
    usable = W - 4*cm
    cw = col_widths or [usable/len(headers)]*len(headers)
    data = [[Paragraph(h, S_TABLE_H) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), S_TABLE_C) if isinstance(c, str)
                     else Paragraph(str(c), S_TABLE_C) for c in row])
    t = Table(data, colWidths=cw, repeatRows=1)
    style_cmds = [
        ("BACKGROUND",    (0,0),  (-1,0),   DARK_BLUE),
        ("ROWBACKGROUNDS",(0,1),  (-1,-1),  [WHITE, LIGHT_GRAY]),
        ("GRID",          (0,0),  (-1,-1),  0.3, MED_GRAY),
        ("TOPPADDING",    (0,0),  (-1,-1),  5),
        ("BOTTOMPADDING", (0,0),  (-1,-1),  5),
        ("LEFTPADDING",   (0,0),  (-1,-1),  6),
        ("VALIGN",        (0,0),  (-1,-1),  "MIDDLE"),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t

# ─── PAGE EVENTS ──────────────────────────────────────────────────────────────

class PageTemplate:
    def __init__(self, title):
        self.title = title
        self.page = 0

    def on_page(self, canv, doc):
        self.page += 1
        canv.saveState()
        # Bande orange en bas
        canv.setFillColor(DARK_BLUE)
        canv.rect(0, 0, W, 18*mm, fill=1, stroke=0)
        canv.setFillColor(ORANGE)
        canv.rect(0, 18*mm, W, 2*mm, fill=1, stroke=0)
        # Footer text
        canv.setFillColor(WHITE)
        canv.setFont("Helvetica", 6.5)
        canv.drawString(1.5*cm, 6*mm, "KTZ Emploi — Dossier de candidature PNUD / YouthConnekt RCA — Confidentiel")
        canv.drawRightString(W - 1.5*cm, 6*mm, f"Page {self.page}")
        # Ligne orange en haut (sauf cover)
        if self.page > 1:
            canv.setFillColor(ORANGE)
            canv.rect(0, H - 8*mm, W, 4*mm, fill=1, stroke=0)
            canv.setFillColor(DARK_BLUE)
            canv.setFont("Helvetica-Bold", 7)
            canv.drawString(1.5*cm, H - 5.5*mm, "KTZ Emploi")
            canv.setFont("Helvetica", 7)
            canv.setFillColor(WHITE)
            canv.drawRightString(W - 1.5*cm, H - 5.5*mm, self.title)
        canv.restoreState()

# ─── CONTENU ──────────────────────────────────────────────────────────────────

def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.8*cm, bottomMargin=2.8*cm,
        title="Dossier PNUD YouthConnekt — KTZ Emploi",
        author="Donald Chrysostome KITEZE",
    )
    pt = PageTemplate("Dossier PNUD / YouthConnekt RCA — Mai 2026")
    story = []
    usable = W - 4*cm

    # ════════════════════════════════════════════════════════
    # PAGE DE COUVERTURE
    # ════════════════════════════════════════════════════════
    cover = Table([[""]], colWidths=[usable], rowHeights=[3*cm])
    cover.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),WHITE)]))
    story.append(cover)

    # Bloc orange titre
    cover_title = Table(
        [[Paragraph("KTZ Emploi", ParagraphStyle("CT", fontName="Helvetica-Bold",
                    fontSize=36, textColor=WHITE, alignment=TA_CENTER))],
         [Paragraph("La premiere plateforme digitale d'emploi", ParagraphStyle("CS",
                    fontName="Helvetica", fontSize=13, textColor=WHITE, alignment=TA_CENTER))],
         [Paragraph("de la Republique Centrafricaine", ParagraphStyle("CS2",
                    fontName="Helvetica", fontSize=13, textColor=WHITE, alignment=TA_CENTER))]],
        colWidths=[usable]
    )
    cover_title.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), ORANGE),
        ("TOPPADDING",    (0,0), (-1,-1), 18),
        ("BOTTOMPADDING", (0,0), (-1,-1), 18),
        ("ROUNDEDCORNERS",[8]),
    ]))
    story.append(cover_title)
    story.append(SP(0.5))

    # Sous-titre dossier
    sub_box = Table(
        [[Paragraph("DOSSIER DE CANDIDATURE", ParagraphStyle("DB", fontName="Helvetica-Bold",
                    fontSize=14, textColor=DARK_BLUE, alignment=TA_CENTER))],
         [Paragraph("PNUD / YouthConnekt RCA", ParagraphStyle("DB2", fontName="Helvetica-Bold",
                    fontSize=18, textColor=DARK_BLUE, alignment=TA_CENTER))],
         [Paragraph("Programme Entrepreneuriat & Innovation Jeunes", ParagraphStyle("DB3",
                    fontName="Helvetica", fontSize=10, textColor=MED_GRAY, alignment=TA_CENTER))]],
        colWidths=[usable]
    )
    sub_box.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), LIGHT_BLUE),
        ("BOX",           (0,0), (-1,-1), 1.5, DARK_BLUE),
        ("TOPPADDING",    (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("ROUNDEDCORNERS",[6]),
    ]))
    story.append(sub_box)
    story.append(SP(0.5))

    # KPIs couverture
    story.append(kpi_row([
        ("Investissement initial",  "67 800 EUR",  "44,5M XAF — dossier chiffre"),
        ("Rentabilite",             "Mois 6",       "Seuil atteint des le 6e mois"),
        ("ROI 5 ans",               "1,68M EUR",    "Revenus cumules An 1 - An 5"),
        ("Equipe cible",            "8 employes",   "Bangui + fondateur diaspora"),
    ]))
    story.append(SP(0.5))

    # Infos contact cover
    contact_data = [
        ["Porteur de projet", "Donald Chrysostome KITEZE — Fondateur KTZ Emploi"],
        ["Formation",         "Ingenieur Microelectronique, Telecommunications et Reseaux"],
        ["Residence",         "Nice, France (diaspora centrafricaine)"],
        ["Email",             "kitzdon37@gmail.com  |  Tel : +33 6 25 34 51 75"],
        ["Site web",          "https://ktzemploi.com"],
        ["Soumis a",          "PNUD Centrafrique (registry.cf@undp.org) & YouthConnekt RCA"],
        ["Date",              "Mai 2026"],
    ]
    t = Table([[Paragraph(r[0], S_LABEL), Paragraph(r[1], S_BODY)] for r in contact_data],
              colWidths=[4*cm, usable-4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), LIGHT_GRAY),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [WHITE, LIGHT_GRAY]),
        ("BOX",           (0,0), (-1,-1), 0.5, MED_GRAY),
        ("LINEBELOW",     (0,0), (-1,-1), 0.2, MED_GRAY),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(t)
    story.append(SP(0.5))

    # Mention confidentiel
    conf = Table([[Paragraph("DOCUMENT CONFIDENTIEL — Diffusion restreinte — Mai 2026",
                  ParagraphStyle("CF", fontName="Helvetica-Bold", fontSize=7.5,
                  textColor=WHITE, alignment=TA_CENTER))]],
                 colWidths=[usable])
    conf.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),DARK_BLUE),
                               ("TOPPADDING",(0,0),(-1,-1),5),
                               ("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.append(conf)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SOMMAIRE
    # ════════════════════════════════════════════════════════
    story += section_header("TABLE DES MATIERES")
    toc_items = [
        ("01", "Identite du porteur de projet", "Profil, formation, engagement"),
        ("02", "Presentation du projet KTZ Emploi", "3 piliers : numerique, agence, formation"),
        ("03", "Contexte & probleme identifie", "Marche emploi RCA 100% informel"),
        ("04", "Solution proposee", "Ecosysteme digital + physique"),
        ("05", "Alignement avec YouthConnekt RCA", "4 axes strategiques"),
        ("06", "Impact attendu", "Chiffres, beneficiaires, impact systemique"),
        ("07", "Etat d'avancement", "Realise, en cours, prochaines etapes"),
        ("08", "Budget & plan de financement", "Chiffres detailles du dossier technique"),
        ("09", "Projections financieres", "Rentabilite M6 — ROI 5 ans"),
        ("10", "Plan d'action 12 mois", "Avec soutien PNUD / YouthConnekt"),
        ("11", "Ce que nous demandons", "Financement, reseau, accompagnement"),
        ("12", "Analyse des risques", "Risques identifies et solutions"),
        ("13", "Conclusion", "Pourquoi KTZ Emploi est un fit parfait"),
    ]
    for num, titre, sous in toc_items:
        story.append(Table([[
            Paragraph(f"<b>{num}</b>", ParagraphStyle("TN", fontName="Helvetica-Bold",
                       fontSize=10, textColor=ORANGE, alignment=TA_CENTER)),
            Paragraph(f"<b>{titre}</b><br/><font color='#94A3B8' size='7'>{sous}</font>", S_TOC),
        ]], colWidths=[1.2*cm, usable-1.2*cm]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 01 — IDENTITE
    # ════════════════════════════════════════════════════════
    story += section_header("01  —  IDENTITE DU PORTEUR DE PROJET")
    story.append(P("Donald Chrysostome KITEZE NGOUYOMBO est un jeune ingenieur centrafricain "
                   "de 29 ans, membre actif de la diaspora centrafricaine en France. Titulaire "
                   "d'un diplome d'ingenieur en Microelectronique, Telecommunications et Reseaux "
                   "obtenu a l'Universite Cote d'Azur (Nice), il consacre son expertise technique "
                   "au developpement economique et social de la Republique Centrafricaine.", S_BODY_J))
    story.append(SP(0.2))
    fields = [
        ("Nom complet",    "KITEZE NGOUYOMBO Donald Chrysostome"),
        ("Age",            "29 ans"),
        ("Nationalite",    "Centrafricaine"),
        ("Residence",      "Nice, France"),
        ("Email",          "kitzdon37@gmail.com"),
        ("Telephone",      "+33 6 25 34 51 75"),
        ("Formation",      "Ingenieur Microelectronique, Telecommunications & Reseaux — Universite Cote d'Azur"),
        ("Role",           "Fondateur & Developpeur Full-Stack — KTZ Emploi"),
        ("Autre role",     "President — Association Avenir Pour Tous (A.P.T) — France"),
    ]
    for label, val in fields:
        story.append(info_box(label, val))
        story.append(SP(0.1))
    story.append(SP(0.3))
    story.append(P("<b>Motivation :</b> En tant que jeune Centrafricain de la diaspora, Donald a constate "
                   "le vide numerique profond sur le marche de l'emploi en RCA. Fort de ses competences "
                   "techniques, il a decide de developper lui-meme la premiere plateforme digitale "
                   "de recrutement centrafricaine — investissant ses economies personnelles dans ce projet "
                   "a fort impact social.", S_BODY_J))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 02 — PRESENTATION
    # ════════════════════════════════════════════════════════
    story += section_header("02  —  PRESENTATION DU PROJET KTZ EMPLOI")
    story.append(P("<b>KTZ Emploi</b> est un ecosysteme complet dedie a l'emploi en Republique "
                   "Centrafricaine. C'est la <b>premiere plateforme digitale de recrutement</b> "
                   "du pays, articulee autour de trois piliers complementaires :", S_BODY_J))
    story.append(SP(0.2))
    story.append(pillar_table([
        ("1", "PLATEFORME NUMERIQUE",
         "Site web (ktzemploi.com) + Application mobile Android (Expo SDK 54, React Native). "
         "Mise en relation directe employeurs/candidats, CVtheque locale, gestion des candidatures, "
         "notifications WhatsApp et SMS. Interface optimisee faible bande passante."),
        ("2", "AGENCE DE RECRUTEMENT PHYSIQUE A BANGUI",
         "Accompagnement personnalise des candidats. Selection et preselection pour les entreprises. "
         "Pont entre le numerique et les realites terrain. Accueil physique pour les candidats sans "
         "acces internet. 8 collaborateurs. Bureau centre-ville Bangui (80m2)."),
        ("3", "CENTRE DE FORMATION PROFESSIONNELLE",
         "Formations certifiantes adaptees au marche centrafricain : informatique, gestion, "
         "entrepreneuriat, metiers techniques, langues. Objectif : renforcer l'employabilite "
         "des jeunes 16-35 ans. Partenariat prevu avec l'ACFPE et l'Universite de Bangui."),
    ]))
    story.append(SP(0.3))
    story.append(P("<b>Projets agro-industriels associes :</b>", S_H3))
    story.append(P("• <b>Production locale d'huile d'arachide :</b> valorisation des cultures locales, "
                   "creation d'emplois ruraux, filiere agro-industrielle durable en RCA.", S_BULLET))
    story.append(P("• <b>Production de poulets de chair :</b> renforcement de la securite alimentaire "
                   "et opportunites economiques pour les communautes locales.", S_BULLET))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 03 — CONTEXTE & PROBLEME
    # ════════════════════════════════════════════════════════
    story += section_header("03  —  CONTEXTE & PROBLEME IDENTIFIE")
    prob_data = [
        ["Indicateur", "Chiffre", "Source"],
        ["Taux de chomage des jeunes", "> 60%", "Estimation marche local RCA"],
        ["Part du secteur informel dans l'economie", "> 80%", "Documentation KTZ Emploi v2.0"],
        ["Plateformes digitales d'emploi dediees a la RCA", "0", "Recherche terrain"],
        ["Acces internet en RCA", "< 10% de la population", "UIT 2024"],
        ["Principal canal de recrutement", "Bouche-a-oreille / WhatsApp", "Terrain Bangui"],
    ]
    story.append(data_table(prob_data[0], prob_data[1:],
                            col_widths=[8*cm, 4*cm, usable-12*cm]))
    story.append(SP(0.3))
    story.append(P("<b>Consequences directes pour les jeunes centrafricains :</b>", S_H3))
    for pb in [
        "Aucune plateforme nationale de recrutement en ligne — marche 100% informel",
        "Les jeunes diplomes n'ont aucun outil pour valoriser leurs competences aupres des employeurs formels",
        "Les entreprises et ONG peinent a trouver des profils locaux qualifies",
        "Les zones secondaires hors Bangui sont totalement exclues du marche de l'emploi formel",
        "Perpetuation de la pauvrete et de la vulnerabilite sociale des jeunes",
    ]:
        story.append(P(f"• {pb}", S_BULLET))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 04 — SOLUTION
    # ════════════════════════════════════════════════════════
    story += section_header("04  —  SOLUTION PROPOSEE")
    story.append(P("KTZ Emploi repond a chacun des problemes identifies avec une solution concrete :", S_BODY))
    sol_data = [
        ["Probleme identifie", "Solution KTZ Emploi"],
        ["Aucune plateforme d'emploi digitale en RCA", "Site web + app Android disponibles 24h/24"],
        ["Recruteurs sans acces a une CVtheque", "CVtheque centralisee et filtrable par secteur/lieu"],
        ["Candidats sans visibilite aupres des employeurs", "Profil candidat en ligne, alertes offres par WA/SMS"],
        ["Zones secondaires hors Bangui non couvertes", "Application mobile accessible sur smartphone basique"],
        ["Personnes non connectees exclues", "Agence physique Bangui avec accueil, impression CV"],
        ["Manque de formation professionnelle adaptee", "Centre de formation certifiant (6 modules an 1)"],
        ["Securite alimentaire fragile en zones rurales", "Projets agro-industriels (huile d'arachide, aviculture)"],
    ]
    story.append(data_table(sol_data[0], sol_data[1:],
                            col_widths=[usable*0.45, usable*0.55]))
    story.append(SP(0.3))
    story.append(P("<b>Avantages concurrentiels :</b>", S_H3))
    adv = [
        ("Premier entrant", "Aucun concurrent digital direct en RCA. Fenetre d'opportunite ouverte maintenant."),
        ("Prix adaptes RCA", "Abonnements des 15 000 XAF/mois — accessibles aux PME centrafricaines."),
        ("Reseau ONG/PNUD", "Partenariats cibles : CICR, MSF, PNUD, UNICEF — marches humanitaires a fort volume."),
        ("App offline partiel", "Fonctionne sur 3G/4G bas debit. Concu pour la connectivite centrafricaine."),
        ("Double canal", "Digital ET physique — touche les non-connectes via l'agence de Bangui."),
    ]
    t = Table([[Paragraph(f"<b>{a}</b>", ParagraphStyle("AK", fontName="Helvetica-Bold",
                           fontSize=8, textColor=ORANGE)),
                Paragraph(v, S_BODY)] for a, v in adv],
              colWidths=[3.5*cm, usable-3.5*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[LIGHT_BLUE, WHITE]),
        ("GRID",(0,0),(-1,-1),0.2,MED_GRAY),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),8),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 05 — ALIGNEMENT YOUTHCONNEKT
    # ════════════════════════════════════════════════════════
    story += section_header("05  —  ALIGNEMENT AVEC YOUTHCONNEKT RCA")
    axes = [
        ("AXE 1", "EMPLOYABILITE",
         "KTZ Emploi est un outil concret d'acces a l'emploi. La plateforme numerique + l'agence "
         "physique constituent un parcours complet d'insertion : formation → candidature → emploi. "
         "Chaque jeune inscrit sur la plateforme est un candidat a l'emploi formel."),
        ("AXE 2", "ENTREPRENEURIAT",
         "Le projet lui-meme est une startup entrepreneuriale fondee par un jeune de la diaspora "
         "centrafricaine. Le centre de formation inclut un module dedie a l'entrepreneuriat et a la "
         "creation d'entreprise en RCA. Les projets agro-industriels ciblent les jeunes ruraux."),
        ("AXE 3", "INNOVATION NUMERIQUE",
         "Premiere plateforme digitale d'emploi en RCA — innovation dans un marche 100% informel. "
         "Stack technique moderne (Next.js, React Native, Expo SDK 54). Application mobile legere "
         "optimisee pour smartphones d'entree de gamme et faible connectivite."),
        ("AXE 4", "AUTONOMISATION ECONOMIQUE",
         "Projets agro-industriels (huile d'arachide, aviculture) creent des emplois directs en zones "
         "rurales. Association Avenir Pour Tous (APT) forme et insere les jeunes. Intervention dans "
         "les memes villes que YouthConnekt RCA : Bangui, Berberati, Bossangoa."),
    ]
    for axe, titre, desc in axes:
        t = Table([[
            Paragraph(axe, ParagraphStyle("AX", fontName="Helvetica-Bold",
                       fontSize=7, textColor=WHITE, alignment=TA_CENTER)),
            Paragraph(f"<b>{titre}</b>", ParagraphStyle("AT", fontName="Helvetica-Bold",
                       fontSize=9, textColor=DARK_BLUE)),
            Paragraph(desc, S_BODY),
        ]], colWidths=[1.5*cm, 3.5*cm, usable-5*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (0,0),  ORANGE),
            ("BACKGROUND",    (1,0), (-1,-1),LIGHT_BLUE),
            ("VALIGN",        (0,0), (-1,-1),"TOP"),
            ("TOPPADDING",    (0,0), (-1,-1),8),
            ("BOTTOMPADDING", (0,0), (-1,-1),8),
            ("LEFTPADDING",   (0,0), (-1,-1),8),
            ("BOX",           (0,0), (-1,-1),0.5,MED_GRAY),
        ]))
        story.append(t)
        story.append(SP(0.15))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 06 — IMPACT
    # ════════════════════════════════════════════════════════
    story += section_header("06  —  IMPACT ATTENDU")
    story.append(P("<b>Impact a court terme (12 mois) :</b>", S_H3))
    story.append(kpi_row([
        ("Candidats inscrits",    "5 000",  "Plateforme web + app"),
        ("Entreprises recrutantes","200",   "ONG, PME, institutions"),
        ("Jeunes formes",         "500",    "Centre de formation"),
        ("Emplois directs crees", "50",     "Agence + projets agro"),
    ]))
    story.append(SP(0.3))
    story.append(P("<b>Impact a moyen terme (3 ans) :</b>", S_H3))
    story.append(kpi_row([
        ("Utilisateurs actifs",   "30 000", "Plateforme"),
        ("Villes couvertes",      "5",      "Dont zones secondaires"),
        ("Jeunes certifies",      "2 000",  "Centre de formation"),
        ("Pays couverts (An 4)",  "3",      "RCA, Tchad, Congo"),
    ]))
    story.append(SP(0.3))
    story.append(P("<b>Impact systemique :</b>", S_H3))
    for imp in [
        "Premieres donnees fiables sur le marche du travail en RCA (open data)",
        "Reduction de l'informel dans le secteur de l'emploi centrafricain",
        "Modele de reference pour la diaspora africaine investissant dans son pays d'origine",
        "Renforcement de l'ecosysteme numerique centrafricain",
        "Potentiel de replication au Tchad, Congo-Brazzaville, Cameroun des l'An 3-4",
    ]:
        story.append(P(f"• {imp}", S_BULLET))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 07 — ETAT D'AVANCEMENT
    # ════════════════════════════════════════════════════════
    story += section_header("07  —  ETAT D'AVANCEMENT")
    story.append(P("<b>Realise a ce jour :</b>", S_H3))
    done = [
        "Plateforme web complete developpee et deployee : ktzemploi.com",
        "Application mobile Android developpee et testee (Expo SDK 54, React Native Paper)",
        "Backend complet : API REST, auth JWT, gestion candidatures, CVtheque, favoris, stats",
        "Routes API mobiles : login, offres, candidatures, profil, saved-jobs, companies",
        "Association Avenir Pour Tous (A.P.T) fondee en France",
        "Discussions avec l'IECD Bangui (Mme Pauline) — partenariat recrutement en cours",
        "Contact etabli avec l'ACFPE — partenariat institutionnel en discussion",
        "Mails envoyes a 12 partenaires institutionnels (PNUD, OIT, FAO, OIM, Proparco, GIZ, Orange RCA...)",
        "Documentation technique complete (42 pages) : budget, projections, calendrier",
    ]
    for d in done:
        t = Table([[
            Paragraph("OK", ParagraphStyle("OK", fontName="Helvetica-Bold",
                       fontSize=7, textColor=WHITE, alignment=TA_CENTER)),
            Paragraph(d, S_BODY),
        ]], colWidths=[0.8*cm, usable-0.8*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(0,0),  GREEN),
            ("BACKGROUND",    (1,0),(-1,-1),LIGHT_GREEN),
            ("TOPPADDING",    (0,0),(-1,-1),4),
            ("BOTTOMPADDING", (0,0),(-1,-1),4),
            ("LEFTPADDING",   (0,0),(-1,-1),6),
            ("VALIGN",        (0,0),(-1,-1),"MIDDLE"),
            ("BOX",           (0,0),(-1,-1),0.3,MED_GRAY),
        ]))
        story.append(t)
        story.append(SP(0.08))
    story.append(SP(0.2))
    story.append(P("<b>En cours :</b>", S_H3))
    todo = [
        "Publication application sur Google Play Store",
        "Enregistrement legal de l'entreprise (SARL) en RCA",
        "Migration base de donnees SQLite vers PostgreSQL (Neon)",
        "Recherche et signature bail bureau centre-ville Bangui (80m2, ~300 000 XAF/mois)",
        "Commande materiel informatique (Douala ou Bangui)",
    ]
    for td in todo:
        story.append(P(f"→ {td}", S_BULLET))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 08 — BUDGET (depuis documentation PDF)
    # ════════════════════════════════════════════════════════
    story += section_header("08  —  BUDGET & PLAN DE FINANCEMENT")
    story.append(P("Source : Documentation technique KTZ Emploi v2.0 (42 pages) — chiffres reels "
                   "bases sur le marche de Bangui, avec couts d'importation depuis Douala.", S_SMALL))
    story.append(SP(0.2))

    story.append(P("<b>Investissement initial (demarrage) :</b>", S_H3))
    inv_data = [
        ["Poste", "Montant (XAF)", "Montant (EUR)"],
        ["Materiel informatique (IT + periphe + reseau + clim + securite)", "9 790 000", "14 947 EUR"],
        ["Vehicule de service (Toyota HiLux 4x4 + immat. + assurance)", "10 000 000", "15 245 EUR"],
        ["Mobilier & amenagement bureau", "5 725 000", "8 740 EUR"],
        ["Formalites legales + assurances (SARL, RCCM, NIF, agrement)", "1 935 000", "2 954 EUR"],
        ["Marketing initial + signaletique", "1 120 000", "1 710 EUR"],
        ["Formation equipe (initiale)", "330 000", "504 EUR"],
        ["Site web (setup + 1er mois)", "166 195", "254 EUR"],
        ["Application mobile (Google Play)", "15 125", "23 EUR"],
        ["Fournitures initiales", "250 000", "382 EUR"],
        ["Fonds de roulement (3 mois charges)", "11 101 884", "16 949 EUR"],
        ["Imprevus (10%)", "4 043 320", "6 165 EUR"],
        ["TOTAL INVESTISSEMENT INITIAL", "44 476 524 XAF", "67 801 EUR"],
    ]
    t = data_table(inv_data[0], inv_data[1:-1], [usable*0.55, usable*0.23, usable*0.22])
    story.append(t)
    # Ligne total
    total_row = Table([[
        Paragraph("TOTAL INVESTISSEMENT INITIAL", ParagraphStyle("TR", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE)),
        Paragraph("44 476 524 XAF", ParagraphStyle("TV", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph("67 801 EUR", ParagraphStyle("TE", fontName="Helvetica-Bold",
                   fontSize=9, textColor=ORANGE, alignment=TA_CENTER)),
    ]], colWidths=[usable*0.55, usable*0.23, usable*0.22])
    total_row.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1),DARK_BLUE),
        ("TOPPADDING",    (0,0),(-1,-1),7),
        ("BOTTOMPADDING", (0,0),(-1,-1),7),
        ("LEFTPADDING",   (0,0),(-1,-1),8),
    ]))
    story.append(total_row)
    story.append(SP(0.3))

    story.append(P("<b>Charges mensuelles recurrentes :</b>", S_H3))
    charges = [
        ["Poste", "Montant (XAF)", "Montant (EUR)"],
        ["Personnel (8 employes + charges CNSS)", "1 824 000", "2 784 EUR"],
        ["Loyer + energie (electricite + groupe + eau)", "560 000", "855 EUR"],
        ["Internet (connexion principale + backup 4G)", "230 000", "351 EUR"],
        ["Site web + application mobile", "178 295", "272 EUR"],
        ["Maintenance + fournitures + nettoyage", "250 000", "382 EUR"],
        ["Gardiennage / securite", "100 000", "153 EUR"],
        ["Publicite mensuelle (radio, Facebook, affichage)", "320 000", "489 EUR"],
        ["Assurances (mensualise)", "58 333", "89 EUR"],
        ["Vehicule (carburant + assurance + entretien)", "180 000", "275 EUR"],
        ["TOTAL MENSUEL", "3 700 628 XAF", "5 649 EUR"],
    ]
    t2 = data_table(charges[0], charges[1:-1], [usable*0.55, usable*0.23, usable*0.22])
    story.append(t2)
    total2 = Table([[
        Paragraph("TOTAL MENSUEL", ParagraphStyle("TR2", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE)),
        Paragraph("3 700 628 XAF", ParagraphStyle("TV2", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph("5 649 EUR", ParagraphStyle("TE2", fontName="Helvetica-Bold",
                   fontSize=9, textColor=ORANGE, alignment=TA_CENTER)),
    ]], colWidths=[usable*0.55, usable*0.23, usable*0.22])
    total2.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),DARK_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    story.append(total2)
    story.append(SP(0.2))
    story.append(P("<i>Taux de reference : 1 EUR = 655 XAF | 1 USD = 605 XAF (XAF arrime a l'EUR "
                   "depuis 1945 — parité fixe, risque de change quasi nul)</i>", S_SMALL))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 09 — PROJECTIONS FINANCIERES
    # ════════════════════════════════════════════════════════
    story += section_header("09  —  PROJECTIONS FINANCIERES")
    story.append(P("<b>Sources de revenus :</b>", S_H3))
    rev_data = [
        ["Source de revenus", "Modele", "Objectif / mois (XAF)"],
        ["Abonnement employeurs Basique", "15 000 XAF x 20 entreprises", "300 000"],
        ["Abonnement employeurs Pro",     "40 000 XAF x 10 entreprises", "400 000"],
        ["Abonnement employeurs Premium", "80 000 XAF x 5 entreprises",  "400 000"],
        ["Offres a la une (featured)",    "30 000 XAF x 20 offres",      "600 000"],
        ["Recrutement executif (agence)", "15% salaire annuel x 3",      "1 500 000"],
        ["CVtheque — acces recruteurs",   "25 000 XAF x 15 recruteurs",  "375 000"],
        ["Formations candidats",          "15 000 XAF x 20 apprenants",  "300 000"],
        ["Publicite bannières site",      "Entreprises locales",          "150 000"],
        ["TOTAL REVENUS / mois (M6)",     "35 entreprises abonnees",     "4 025 000"],
    ]
    story.append(data_table(rev_data[0], rev_data[1:],
                            [usable*0.35, usable*0.38, usable*0.27]))
    story.append(SP(0.3))

    story.append(P("<b>Phases de croissance :</b>", S_H3))
    growth = [
        ["Periode", "Objectifs cles", "Revenus / mois", "Resultat"],
        ["M1-M3\n(Lancement)", "Creation societe, amenagement bureau,\nrecrutement equipe", "0 - 600K XAF", "Deficit (fonds de roulement)"],
        ["M4-M5\n(Demarrage)", "Inauguration officielle, 10 puis 20 entreprises", "1.5M - 2.8M XAF", "Deficit decroissant"],
        ["M6\n(Seuil)", "35 entreprises, 3 recrutements exec", "4 025 000 XAF", "+324 372 XAF"],
        ["M7-M12\n(Croissance)", "50-70 entreprises, 1 000-2 000 candidats", "5M - 6.5M XAF", "+1.3M - 2.8M XAF/mois"],
        ["An 2\n(Consolidation)", "100-150 entreprises, formations, public", "8M - 10M XAF", "+4.3M - 6.3M XAF/mois"],
        ["An 3-5\n(Expansion)", "3 pays (RCA, Tchad, Congo), hub regional", "12M - 25M+ XAF", "ROI 1,68M EUR cumule"],
    ]
    story.append(data_table(growth[0], growth[1:],
                            [usable*0.15, usable*0.37, usable*0.25, usable*0.23]))
    story.append(SP(0.2))

    # KPI rentabilite
    story.append(kpi_row([
        ("Seuil de rentabilite",  "Mois 6",       "Exce dent +324 372 XAF"),
        ("ROI investissement",    "24-30 mois",    "Retour sur invest. initial"),
        ("Revenus cumules 5 ans", "1,68M EUR",     "800M+ XAF cumules"),
        ("Emplois An 5",          "30-40",         "Equipe hub regional"),
    ]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 10 — PLAN D'ACTION
    # ════════════════════════════════════════════════════════
    story += section_header("10  —  PLAN D'ACTION 12 MOIS AVEC SOUTIEN PNUD")
    plan = [
        ["Phase", "Periode", "Actions cles"],
        ["FONDATIONS",     "Mois 1-3",  "Integration YouthConnekt RCA. Creation SARL + RCCM + NIF Bangui. "
                                        "Publication app Android sur Google Play. Signature bail bureau. "
                                        "Commande materiel informatique. Recrutement 8 collaborateurs."],
        ["LANCEMENT",      "Mois 4-6",  "Inauguration officielle agence Bangui. Lancement campagne radio "
                                        "(Ndeke Luka, RFI RCA) + reseaux sociaux. Premieres offres d'emploi. "
                                        "Partenariats ACFPE et Universite de Bangui. 35 entreprises abonnees. "
                                        "Seuil de rentabilite atteint (M6)."],
        ["CROISSANCE",     "Mois 7-9",  "Lancement centre de formation (6 modules certifiants). "
                                        "1ere promotion 50 apprenants. Extension a Berberati et Bossangoa. "
                                        "50 entreprises abonnees. 1 000 candidats inscrits."],
        ["CONSOLIDATION",  "Mois 10-12","70 entreprises. Partenariats ONG (PNUD, UNICEF, CICR, MSF). "
                                        "Publication API open data emploi RCA. 2 000 candidats. "
                                        "Demarrage projets agro-industriels. Preparation expansion Tchad."],
    ]
    story.append(data_table(plan[0], plan[1:], [usable*0.18, usable*0.12, usable*0.70]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 11 — CE QUE NOUS DEMANDONS
    # ════════════════════════════════════════════════════════
    story += section_header("11  —  CE QUE NOUS DEMANDONS AU PNUD")
    demands = [
        ("1.", "Integration officielle YouthConnekt RCA",
         "Integration de KTZ Emploi dans le programme YouthConnekt RCA comme startup partenaire "
         "dans la categorie Innovation Numerique & Emploi. Cela ouvre les portes des recruteurs "
         "institutionnels et renforce la credibilite du projet aupres des partenaires locaux."),
        ("2.", "Subvention d'amorcage (30 000 - 50 000 USD)",
         "Pour financer l'ouverture de l'agence physique a Bangui, l'achat du materiel informatique, "
         "le recrutement de l'equipe locale et le lancement du centre de formation "
         "(Investissement initial total : 67 800 EUR — contribution demandee : ~30%)."),
        ("3.", "Acces au reseau YouthConnekt RCA",
         "Promotion de KTZ Emploi aupres des jeunes beneficiaires YouthConnekt, des partenaires "
         "institutionnels (MINUSCA, OIT, FAO, OIM) et des entreprises et ONG recrutantes en RCA."),
        ("4.", "Mentorat & accompagnement PNUD",
         "Acces aux experts PNUD en entrepreneuriat numerique, developpement economique et marches "
         "africains pour affiner le modele, eviter les ecueils et maximiser l'impact social."),
        ("5.", "Appui a la visibilite institutionnelle",
         "Communication conjointe PNUD/KTZ Emploi pour legitimer la plateforme aupres du "
         "gouvernement centrafricain, des bailleurs de fonds et des grandes entreprises en RCA."),
    ]
    for num, titre, desc in demands:
        t = Table([[
            Paragraph(num, ParagraphStyle("DN", fontName="Helvetica-Bold",
                       fontSize=14, textColor=ORANGE, alignment=TA_CENTER)),
            Paragraph(f"<b>{titre}</b><br/>{desc}", S_BODY),
        ]], colWidths=[0.8*cm, usable-0.8*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(0,0), LIGHT_AMBER),
            ("BACKGROUND",    (1,0),(-1,-1),LIGHT_GRAY),
            ("VALIGN",        (0,0),(-1,-1),"TOP"),
            ("TOPPADDING",    (0,0),(-1,-1),8),
            ("BOTTOMPADDING", (0,0),(-1,-1),8),
            ("LEFTPADDING",   (0,0),(-1,-1),8),
            ("BOX",           (0,0),(-1,-1),0.5,MED_GRAY),
        ]))
        story.append(t)
        story.append(SP(0.15))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 12 — RISQUES
    # ════════════════════════════════════════════════════════
    story += section_header("12  —  ANALYSE DES RISQUES & SOLUTIONS")
    risks = [
        ["Risque", "Impact", "Probabilite", "Solution mise en place"],
        ["Internet instable (Orange, Telecel)", "Eleve", "Tres probable",
         "Double connexion 4G (2 operateurs). Hebergement Vercel US independant du reseau local. App offline partiel."],
        ["Coupures electricite ENERCA (4-8h/j)", "Eleve", "Certaine",
         "Groupe electrogene 3,5 kVA + reserve carburant. UPS sur tous les postes. Site heberge hors RCA."],
        ["Faible adoption digitale des candidats", "Eleve", "Certaine",
         "Agence physique pour les non-connectes. Inscription en agence possible. Notifs SMS sans internet."],
        ["Paiement en ligne quasi-inexistant", "Eleve", "Certaine",
         "Paiement en agence (especes + virement). Integration Orange Money / Airtel Money."],
        ["Instabilite politique / securitaire", "Eleve", "Possible",
         "Site heberge hors RCA (Vercel US). Travail a distance possible. Pas de dependance infra locale."],
        ["Concurrence informelle (WhatsApp)", "Moyen", "Certaine",
         "Valeur ajoutee : profils verifies, filtres, tableau de bord. Prix bas. Partenariat avec ces groupes."],
        ["Recrutement talents locaux qualifies", "Moyen", "Probable",
         "Salaires competitifs. Formation interne. Recrutement teletravail partiel."],
    ]
    story.append(data_table(risks[0], risks[1:],
                            [usable*0.25, usable*0.1, usable*0.13, usable*0.52]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 13 — CONCLUSION
    # ════════════════════════════════════════════════════════
    story += section_header("13  —  CONCLUSION & POURQUOI KTZ EMPLOI EST UN FIT PARFAIT")
    story.append(P(
        "KTZ Emploi repond a un besoin reel, non couvert et urgent en RCA. Aucune plateforme "
        "digitale d'emploi dediee au marche centrafricain n'existe aujourd'hui. Le projet beneficie "
        "d'une fenetre d'opportunite unique : etre le premier entrant sur un marche vierge, avec "
        "une technologie moderne, une equipe locale motivee, et un modele hybride (digital + physique) "
        "adapte aux realites du terrain.", S_BODY_J))
    story.append(SP(0.3))

    fit_items = [
        ("Profil fondateur", "Jeune Centrafricain de la diaspora (29 ans) — profil cible YouthConnekt"),
        ("Impact emploi jeunes", "Outil concret de mise en relation candidats/emploi en RCA"),
        ("Innovation numerique", "1ere plateforme digitale emploi en RCA — marche entierement vierge"),
        ("Complementarite PNUD", "Memes villes d'intervention : Bangui, Berberati, Bossangoa"),
        ("Projets agro", "Huile d'arachide + aviculture — axe agro-alimentaire YouthConnekt RCA"),
        ("Modele hybride", "Digital + physique — touche les non-connectes et les zones rurales"),
        ("Chiffres reels", "Dossier technique complet de 42 pages avec budget, projections, risques"),
        ("Viabilite financiere", "Seuil de rentabilite atteint des le 6e mois — ROI 24-30 mois"),
    ]
    for label, val in fit_items:
        t = Table([[
            Paragraph("OK", ParagraphStyle("F1", fontName="Helvetica-Bold",
                       fontSize=7, textColor=WHITE, alignment=TA_CENTER)),
            Paragraph(f"<b>{label} :</b> {val}", S_BODY),
        ]], colWidths=[0.8*cm, usable-0.8*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(0,0), ORANGE),
            ("BACKGROUND",    (1,0),(-1,-1),LIGHT_AMBER),
            ("VALIGN",        (0,0),(-1,-1),"MIDDLE"),
            ("TOPPADDING",    (0,0),(-1,-1),5),
            ("BOTTOMPADDING", (0,0),(-1,-1),5),
            ("LEFTPADDING",   (0,0),(-1,-1),8),
            ("BOX",           (0,0),(-1,-1),0.3,MED_GRAY),
        ]))
        story.append(t)
        story.append(SP(0.1))

    story.append(SP(0.4))
    final_box = Table([[Paragraph(
        "Avec un investissement initial de 44,5M XAF (67 800 EUR), une equipe de 8 personnes, "
        "un vehicule de terrain et une plateforme technologique complete (web + app + WhatsApp), "
        "<b>KTZ Emploi a tous les atouts pour devenir la reference N°1 du recrutement en RCA</b> "
        "et s'etendre a toute l'Afrique centrale d'ici 5 ans.",
        ParagraphStyle("FB", fontName="Helvetica-Bold", fontSize=9.5,
                       textColor=WHITE, alignment=TA_CENTER, leading=14)
    )]], colWidths=[usable])
    final_box.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1),DARK_BLUE),
        ("TOPPADDING",    (0,0),(-1,-1),16),
        ("BOTTOMPADDING", (0,0),(-1,-1),16),
        ("LEFTPADDING",   (0,0),(-1,-1),16),
        ("RIGHTPADDING",  (0,0),(-1,-1),16),
        ("ROUNDEDCORNERS",[8]),
    ]))
    story.append(final_box)
    story.append(SP(0.3))

    # Signature
    sig = Table([[
        Paragraph("Donald Chrysostome KITEZE<br/>"
                  "<font size='7' color='#94A3B8'>Ingenieur Microelectronique, Telecom & Reseaux</font><br/>"
                  "<font size='7' color='#F97316'>Fondateur KTZ Emploi | President APT</font>",
                  ParagraphStyle("SG", fontName="Helvetica-Bold", fontSize=9,
                                 textColor=DARK_BLUE, leading=14)),
        Paragraph("kitzdon37@gmail.com<br/>+33 6 25 34 51 75<br/>https://ktzemploi.com",
                  ParagraphStyle("SC", fontName="Helvetica", fontSize=8,
                                 textColor=HexColor("#1F2937"), leading=13, alignment=TA_RIGHT)),
    ]], colWidths=[usable*0.6, usable*0.4])
    sig.setStyle(TableStyle([
        ("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),8),
        ("LINEABOVE",(0,0),(-1,-1),1,ORANGE),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    story.append(sig)

    # ─── BUILD ────────────────────────────────────────────────────────────────
    doc.build(story, onFirstPage=pt.on_page, onLaterPages=pt.on_page)
    print(f"PDF genere : {OUTPUT}")


if __name__ == "__main__":
    build()
