# -*- coding: utf-8 -*-
"""
Generateur PDF — Dossier de candidature FUZE / Digital Africa (AFD)
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
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import os

# ─── COULEURS ─────────────────────────────────────────────────────────────────
ORANGE      = HexColor("#F97316")
DARK_BLUE   = HexColor("#1E3A5F")
AFD_BLUE    = HexColor("#003189")      # Bleu Digital Africa / AFD
AFD_LIGHT   = HexColor("#E8EEFF")
LIGHT_BLUE  = HexColor("#EFF6FF")
LIGHT_GRAY  = HexColor("#F8FAFC")
MED_GRAY    = HexColor("#94A3B8")
WHITE       = colors.white
BLACK       = colors.black
GREEN       = HexColor("#16A34A")
LIGHT_GREEN = HexColor("#F0FDF4")
AMBER       = HexColor("#D97706")
LIGHT_AMBER = HexColor("#FFFBEB")

OUTPUT = "C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_FUZE_DIGITAL_AFRICA.pdf"
W, H = A4

# ─── STYLES ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def style(name="Normal", **kw):
    return ParagraphStyle(name, parent=styles["Normal"], **kw)

S_H1       = style("H1",  fontName="Helvetica-Bold",  fontSize=13, textColor=WHITE,     spaceAfter=3,  leading=16)
S_H2       = style("H2",  fontName="Helvetica-Bold",  fontSize=11, textColor=AFD_BLUE,  spaceBefore=8, spaceAfter=4, leading=14)
S_H3       = style("H3",  fontName="Helvetica-Bold",  fontSize=9,  textColor=AFD_BLUE,  spaceBefore=4, spaceAfter=2, leading=12)
S_BODY     = style("BD",  fontName="Helvetica",       fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, spaceAfter=3)
S_BODY_J   = style("BJ",  fontName="Helvetica",       fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, spaceAfter=3, alignment=TA_JUSTIFY)
S_SMALL    = style("SM",  fontName="Helvetica",       fontSize=7.5,textColor=MED_GRAY,  leading=11)
S_BULLET   = style("BU",  fontName="Helvetica",       fontSize=8.5,textColor=HexColor("#1F2937"), leading=13, leftIndent=10, spaceAfter=2)
S_TABLE_H  = style("TH",  fontName="Helvetica-Bold",  fontSize=8,  textColor=WHITE,     alignment=TA_CENTER, leading=11)
S_TABLE_C  = style("TC",  fontName="Helvetica",       fontSize=8,  textColor=HexColor("#1F2937"), leading=11)
S_LABEL    = style("LB",  fontName="Helvetica-Bold",  fontSize=7.5,textColor=ORANGE,    leading=11, spaceAfter=1)
S_FOOTER   = style("FT",  fontName="Helvetica",       fontSize=7,  textColor=MED_GRAY,  alignment=TA_CENTER)
S_TOC      = style("TOC", fontName="Helvetica",       fontSize=9,  textColor=AFD_BLUE,  leading=16, leftIndent=8)

def P(txt, s=None):  return Paragraph(txt, s or S_BODY)
def SP(h=0.3):       return Spacer(1, h*cm)
def HR(c=ORANGE, w=0.5): return HRFlowable(width="100%", thickness=w, color=c, spaceAfter=4, spaceBefore=4)

def section_header(titre):
    t = Table([[Paragraph(titre, S_H1)]], colWidths=[W - 4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), AFD_BLUE),
        ("ROUNDEDCORNERS",[6]),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
    ]))
    return [SP(0.2), t, SP(0.3)]

def info_box(label, value, bg=AFD_LIGHT, border=AFD_BLUE):
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
    usable = W - 4*cm
    cells = []
    for label, val, sub in items:
        inner = Table([
            [Paragraph(val, ParagraphStyle("KV", fontName="Helvetica-Bold",
                       fontSize=15, textColor=ORANGE, alignment=TA_CENTER))],
            [Paragraph(label, ParagraphStyle("KL", fontName="Helvetica-Bold",
                       fontSize=7.5, textColor=AFD_BLUE, alignment=TA_CENTER))],
            [Paragraph(sub, ParagraphStyle("KS", fontName="Helvetica",
                       fontSize=6.5, textColor=MED_GRAY, alignment=TA_CENTER))],
        ], colWidths=[usable/len(items)])
        inner.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), AFD_LIGHT),
            ("BOX",           (0,0), (-1,-1), 0.5, AFD_BLUE),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ]))
        cells.append(inner)
    t = Table([cells], colWidths=[usable/len(items)]*len(items), hAlign="LEFT")
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0,0),(-1,-1),3),
        ("RIGHTPADDING",(0,0),(-1,-1),3),
    ]))
    return t

def data_table(headers, rows, col_widths=None):
    usable = W - 4*cm
    cw = col_widths or [usable/len(headers)]*len(headers)
    data = [[Paragraph(h, S_TABLE_H) for h in headers]]
    for row in rows:
        data.append([Paragraph(str(c), S_TABLE_C) for c in row])
    t = Table(data, colWidths=cw, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),  (-1,0),  AFD_BLUE),
        ("ROWBACKGROUNDS",(0,1),  (-1,-1), [WHITE, LIGHT_GRAY]),
        ("GRID",          (0,0),  (-1,-1), 0.3, MED_GRAY),
        ("TOPPADDING",    (0,0),  (-1,-1), 5),
        ("BOTTOMPADDING", (0,0),  (-1,-1), 5),
        ("LEFTPADDING",   (0,0),  (-1,-1), 6),
        ("VALIGN",        (0,0),  (-1,-1), "MIDDLE"),
    ]))
    return t

# ─── PAGE EVENTS ──────────────────────────────────────────────────────────────

class PageTemplate:
    def __init__(self, title):
        self.title = title
        self.page = 0

    def on_page(self, canv, doc):
        self.page += 1
        canv.saveState()
        # Footer
        canv.setFillColor(AFD_BLUE)
        canv.rect(0, 0, W, 18*mm, fill=1, stroke=0)
        canv.setFillColor(ORANGE)
        canv.rect(0, 18*mm, W, 2*mm, fill=1, stroke=0)
        canv.setFillColor(WHITE)
        canv.setFont("Helvetica", 6.5)
        canv.drawString(1.5*cm, 6*mm, "KTZ Emploi — Dossier de candidature FUZE / Digital Africa (AFD) — Confidentiel")
        canv.drawRightString(W - 1.5*cm, 6*mm, f"Page {self.page}")
        # Header (sauf cover)
        if self.page > 1:
            canv.setFillColor(ORANGE)
            canv.rect(0, H - 8*mm, W, 4*mm, fill=1, stroke=0)
            canv.setFillColor(AFD_BLUE)
            canv.setFont("Helvetica-Bold", 7)
            canv.drawString(1.5*cm, H - 5.5*mm, "KTZ Emploi")
            canv.setFont("Helvetica", 7)
            canv.setFillColor(WHITE)
            canv.drawRightString(W - 1.5*cm, H - 5.5*mm, self.title)
        canv.restoreState()

# ─── BUILD ────────────────────────────────────────────────────────────────────

def build():
    doc = SimpleDocTemplate(
        OUTPUT, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.8*cm, bottomMargin=2.8*cm,
        title="Dossier FUZE Digital Africa — KTZ Emploi",
        author="Donald Chrysostome KITEZE",
    )
    pt = PageTemplate("Dossier FUZE / Digital Africa — Mai 2026")
    story = []
    usable = W - 4*cm

    # ════════════════════════════════════════════════════════
    # PAGE DE COUVERTURE
    # ════════════════════════════════════════════════════════
    story.append(Table([[""]], colWidths=[usable], rowHeights=[2.5*cm]))

    cover_title = Table([
        [Paragraph("KTZ Emploi", ParagraphStyle("CT", fontName="Helvetica-Bold",
                   fontSize=36, textColor=WHITE, alignment=TA_CENTER))],
        [Paragraph("La premiere plateforme digitale d'emploi", ParagraphStyle("CS",
                   fontName="Helvetica", fontSize=13, textColor=WHITE, alignment=TA_CENTER))],
        [Paragraph("de la Republique Centrafricaine", ParagraphStyle("CS2",
                   fontName="Helvetica", fontSize=13, textColor=WHITE, alignment=TA_CENTER))],
    ], colWidths=[usable])
    cover_title.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), ORANGE),
        ("TOPPADDING",    (0,0), (-1,-1), 18),
        ("BOTTOMPADDING", (0,0), (-1,-1), 18),
        ("ROUNDEDCORNERS",[8]),
    ]))
    story.append(cover_title)
    story.append(SP(0.5))

    sub_box = Table([
        [Paragraph("DOSSIER DE CANDIDATURE", ParagraphStyle("DB", fontName="Helvetica-Bold",
                   fontSize=13, textColor=AFD_BLUE, alignment=TA_CENTER))],
        [Paragraph("FUZE by Digital Africa (AFD)", ParagraphStyle("DB2", fontName="Helvetica-Bold",
                   fontSize=20, textColor=AFD_BLUE, alignment=TA_CENTER))],
        [Paragraph("Programme Pre-Seed — Innovation Numerique en Afrique", ParagraphStyle("DB3",
                   fontName="Helvetica", fontSize=10, textColor=MED_GRAY, alignment=TA_CENTER))],
        [Paragraph("Financement vise : 50 000 a 100 000 EUR (equity)", ParagraphStyle("DB4",
                   fontName="Helvetica-Bold", fontSize=9, textColor=ORANGE, alignment=TA_CENTER))],
    ], colWidths=[usable])
    sub_box.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), AFD_LIGHT),
        ("BOX",           (0,0), (-1,-1), 1.5, AFD_BLUE),
        ("TOPPADDING",    (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("ROUNDEDCORNERS",[6]),
    ]))
    story.append(sub_box)
    story.append(SP(0.5))

    story.append(kpi_row([
        ("Marche adressable",    "0 concurrent", "1er entrant digital en RCA"),
        ("Investissement total", "67 800 EUR",   "44,5M XAF — chiffre documente"),
        ("Break-even",          "Mois 6",        "+324 372 XAF des M6"),
        ("ROI cumule 5 ans",    "1,68M EUR",     "800M+ XAF cumules"),
    ]))
    story.append(SP(0.5))

    contact_data = [
        ["Startup",         "KTZ Emploi — https://ktzemploi.com"],
        ["Fondateur",       "Donald Chrysostome KITEZE NGOUYOMBO — 29 ans"],
        ["Formation",       "Ingenieur Microelectronique, Telecommunications et Reseaux — Univ. Cote d'Azur"],
        ["Nationalite",     "Centrafricaine — Resident en France (Nice)"],
        ["Email",           "kitzdon37@gmail.com  |  Tel : +33 6 25 34 51 75"],
        ["Stade",           "Prototype fonctionnel avec premiers pilotes (plateforme web deployee)"],
        ["Technologie",     "Next.js 15, React Native / Expo SDK 54, Prisma, SQLite/PostgreSQL — Open Source MIT"],
        ["Pays cible",      "Republique Centrafricaine (marche primaire) — extension Tchad, Congo (An 3)"],
        ["Date soumission", "Mai 2026"],
    ]
    t = Table([[Paragraph(r[0], S_LABEL), Paragraph(r[1], S_BODY)] for r in contact_data],
              colWidths=[4*cm, usable-4*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[WHITE, LIGHT_GRAY]),
        ("BOX",          (0,0),(-1,-1),0.5,MED_GRAY),
        ("LINEBELOW",    (0,0),(-1,-1),0.2,MED_GRAY),
        ("TOPPADDING",   (0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",  (0,0),(-1,-1),8),
        ("VALIGN",       (0,0),(-1,-1),"MIDDLE"),
    ]))
    story.append(t)
    story.append(SP(0.4))

    conf = Table([[Paragraph("DOCUMENT CONFIDENTIEL — Diffusion restreinte — FUZE / Digital Africa — Mai 2026",
                  ParagraphStyle("CF", fontName="Helvetica-Bold", fontSize=7.5,
                  textColor=WHITE, alignment=TA_CENTER))]],
                 colWidths=[usable])
    conf.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
                               ("TOPPADDING",(0,0),(-1,-1),5),
                               ("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    story.append(conf)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SOMMAIRE
    # ════════════════════════════════════════════════════════
    story += section_header("TABLE DES MATIERES")
    toc = [
        ("01", "Equipe fondatrice",             "Profil, formation, expertise technique"),
        ("02", "Opportunite de marche",          "Marche emploi RCA vierge — 1er entrant"),
        ("03", "Solution & produit",             "Plateforme web + app Android + agence + formation"),
        ("04", "Traction & preuves",             "Prototype deploye, partenariats, pipeline"),
        ("05", "Modele economique",              "Sources de revenus, tarifs, marge"),
        ("06", "Projections financieres",        "Break-even M6 — ROI 5 ans — 1,68M EUR"),
        ("07", "Budget & utilisation des fonds", "Detail investissement — 44 476 524 XAF"),
        ("08", "Strategie de croissance",        "RCA → Tchad → Congo — hub Afrique centrale"),
        ("09", "Technologie & open source",      "Stack technique, architecture, engagement MIT"),
        ("10", "Impact social & developpement",  "Emploi jeunes, formation, agro-industrie"),
        ("11", "Analyse des risques",            "Risques identifies et solutions concretes"),
        ("12", "Ce que nous demandons a FUZE",   "Equity, reseau, mentorat Digital Africa"),
    ]
    for num, titre, sous in toc:
        story.append(Table([[
            Paragraph(f"<b>{num}</b>", ParagraphStyle("TN", fontName="Helvetica-Bold",
                       fontSize=10, textColor=ORANGE, alignment=TA_CENTER)),
            Paragraph(f"<b>{titre}</b><br/><font color='#94A3B8' size='7'>{sous}</font>", S_TOC),
        ]], colWidths=[1.2*cm, usable-1.2*cm]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 01 — EQUIPE
    # ════════════════════════════════════════════════════════
    story += section_header("01  —  EQUIPE FONDATRICE")
    story.append(P(
        "Donald Chrysostome KITEZE NGOUYOMBO est le fondateur et developpeur full-stack de KTZ Emploi. "
        "Ingenieur en Microelectronique, Telecommunications et Reseaux (Universite Cote d'Azur, Nice), "
        "il a developpe seul — sur fonds propres — la totalite de la plateforme web et de l'application "
        "mobile Android. Il incarne le profil du fondateur technique africain de la diaspora : "
        "competences mondiales, ancrage local fort.", S_BODY_J))
    story.append(SP(0.2))
    fields = [
        ("Nom",         "KITEZE NGOUYOMBO Donald Chrysostome"),
        ("Age",         "29 ans"),
        ("Nationalite", "Centrafricaine"),
        ("Residence",   "Nice, France (diaspora centrafricaine)"),
        ("Formation",   "Ingenieur Microelectronique, Telecom & Reseaux — Universite Cote d'Azur / IUT Nice"),
        ("Role",        "Fondateur, CEO, developpeur full-stack (front + back + mobile)"),
        ("Autre role",  "President — Association Avenir Pour Tous (A.P.T) — France"),
        ("Email",       "kitzdon37@gmail.com  |  +33 6 25 34 51 75"),
    ]
    for label, val in fields:
        story.append(info_box(label, val))
        story.append(SP(0.08))
    story.append(SP(0.3))
    story.append(P("<b>Competences cles du fondateur :</b>", S_H3))
    competences = [
        ("Developpement full-stack", "Next.js 15, Prisma, SQLite/PostgreSQL, NextAuth, REST API"),
        ("Developpement mobile",    "React Native, Expo SDK 54, React Native Paper, TanStack Query"),
        ("Architecture systeme",    "Authentification JWT, CVtheque, gestion candidatures, notifications"),
        ("Gestion de projet",       "Dossiers techniques, partenariats institutionnels, pitching"),
        ("Connaissance terrain",    "Marche de l'emploi RCA, reseau Bangui (IECD, ACFPE, PNUD)"),
    ]
    t = Table([[Paragraph(f"<b>{k}</b>", ParagraphStyle("CK", fontName="Helvetica-Bold",
                           fontSize=8, textColor=ORANGE)),
                Paragraph(v, S_BODY)] for k, v in competences],
              colWidths=[4.5*cm, usable-4.5*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[AFD_LIGHT, WHITE]),
        ("GRID",(0,0),(-1,-1),0.2,MED_GRAY),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
        ("LEFTPADDING",(0,0),(-1,-1),8),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    story.append(t)
    story.append(SP(0.2))
    story.append(P(
        "<b>Recrutements prevus avec financement FUZE :</b> 2 agents recrutement (Bangui), "
        "1 responsable formation, 1 chargee de communication, 1 technicien support, "
        "1 chauffeur/logisticien, 1 agent terrain (total : 7 employes locaux + fondateur = 8).", S_BODY))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 02 — OPPORTUNITE DE MARCHE
    # ════════════════════════════════════════════════════════
    story += section_header("02  —  OPPORTUNITE DE MARCHE")
    story.append(P(
        "La Republique Centrafricaine represente une opportunite unique et non exploitee : "
        "un marche de l'emploi de 5 millions d'habitants avec un taux de chomage des jeunes "
        "superieur a 60%, un secteur informel a plus de 80%, et <b>zero plateforme digitale "
        "de recrutement existante</b>. KTZ Emploi est le premier entrant sur un marche vierge.", S_BODY_J))
    story.append(SP(0.3))
    mkt_data = [
        ["Indicateur", "Valeur", "Implications pour KTZ Emploi"],
        ["Population RCA", "5,5 millions hab.", "Marche primaire captif"],
        ["Taux chomage jeunes", "> 60%", "Demande massive cote candidats"],
        ["Plateformes emploi digitales en RCA", "0", "Zero concurrence directe"],
        ["Employeurs formels (ONG + entreprises)", "200-500 actifs", "Cible abonnements payants M1"],
        ["Smartphones en RCA (Android)", "~30% de la pop.", "Base d'utilisateurs app mobile"],
        ["Marche emploi ONG (PNUD, UNICEF, CICR, MSF)", "200-300 recrutements/an", "Segment premium tres rentable"],
        ["Extension possible (Tchad, Congo, Cameroun)", "+40 millions hab.", "Marche regional Afrique centrale"],
    ]
    story.append(data_table(mkt_data[0], mkt_data[1:],
                            [usable*0.28, usable*0.2, usable*0.52]))
    story.append(SP(0.3))
    story.append(P("<b>Positionnement concurrentiel :</b>", S_H3))
    story.append(P(
        "Il n'existe aucun concurrent direct en RCA. Les seules alternatives actuelles sont les "
        "groupes WhatsApp informels et le bouche-a-oreille. Sur les marches africains comparables "
        "(Jobberman Nigeria, BrighterMonday Kenya, Emploi.cm Cameroun), les plateformes de ce "
        "type ont atteint des centaines de milliers d'utilisateurs en 3 a 5 ans. "
        "KTZ Emploi est positionne pour repliquer ce modele en Afrique centrale.", S_BODY_J))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 03 — SOLUTION & PRODUIT
    # ════════════════════════════════════════════════════════
    story += section_header("03  —  SOLUTION & PRODUIT")
    pilliers = [
        ("P1", "PLATEFORME NUMERIQUE (web + mobile)",
         "Site web ktzemploi.com (Next.js 15) + Application Android (Expo SDK 54). "
         "Mise en relation directe employeurs/candidats, CVtheque locale filtrable, "
         "gestion des candidatures en ligne, notifications WhatsApp/SMS. "
         "Interface optimisee faible bande passante. Fonctionne sur smartphones d'entree de gamme."),
        ("P2", "AGENCE DE RECRUTEMENT PHYSIQUE — BANGUI",
         "Bureau 80m2 centre-ville Bangui. Accompagnement personnalise, preselection pour ONG/entreprises, "
         "accueil pour les candidats non-connectes, impression CV et depot physique. "
         "8 collaborateurs. Toyota HiLux 4x4 pour les interventions terrain."),
        ("P3", "CENTRE DE FORMATION PROFESSIONNELLE",
         "6 modules certifiants An 1 : informatique, gestion, entrepreneuriat, metiers techniques, langues, "
         "agriculture. Premiere promotion 50 apprenants. Partenariat ACFPE + Universite de Bangui."),
        ("P4", "PROJETS AGRO-INDUSTRIELS (impact rural)",
         "Production locale d'huile d'arachide + elevage poulets de chair. "
         "Emplois directs en zones rurales, securite alimentaire, diversification des revenus."),
    ]
    for icon, titre, desc in pilliers:
        t = Table([[
            Paragraph(icon, ParagraphStyle("IC", fontName="Helvetica-Bold",
                       fontSize=11, textColor=WHITE, alignment=TA_CENTER)),
            Paragraph(f"<b>{titre}</b><br/>{desc}", S_BODY),
        ]], colWidths=[1.2*cm, usable-1.2*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(0,0),  ORANGE),
            ("BACKGROUND",    (1,0),(-1,-1),AFD_LIGHT),
            ("VALIGN",        (0,0),(-1,-1),"TOP"),
            ("TOPPADDING",    (0,0),(-1,-1),8),
            ("BOTTOMPADDING", (0,0),(-1,-1),8),
            ("LEFTPADDING",   (0,0),(-1,-1),8),
            ("BOX",           (0,0),(-1,-1),0.5,MED_GRAY),
        ]))
        story.append(t)
        story.append(SP(0.12))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 04 — TRACTION & PREUVES
    # ════════════════════════════════════════════════════════
    story += section_header("04  —  TRACTION & PREUVES")
    story.append(P("<b>Realise a ce jour (sur fonds propres — 3 000 a 5 000 EUR) :</b>", S_H3))
    done = [
        "Plateforme web deployee et operationnelle : https://ktzemploi.com",
        "Application mobile Android developpee et testee (Expo SDK 54, React Native Paper)",
        "Backend complet : API REST, JWT, CVtheque, candidatures, favoris, stats",
        "Routes API mobiles : login, offres, candidatures, profil, saved-jobs, companies",
        "Documentation technique de 42 pages : budget, projections, risques, calendrier",
        "Discussions avancees avec IECD Bangui (Mme Pauline) — partenariat recrutement",
        "Contact etabli avec l'ACFPE — partenariat formation professionnelle",
        "12 courriers envoyes aux partenaires institutionnels : PNUD, OIT, FAO, OIM, GIZ...",
        "Association Avenir Pour Tous (A.P.T) fondee en France",
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
        story.append(SP(0.07))
    story.append(SP(0.3))
    story.append(P("<b>Pipeline commercial (a activer avec financement) :</b>", S_H3))
    pipeline = [
        ["Prospect", "Type", "Volume estime", "Statut"],
        ["PNUD, UNICEF, OIM, FAO, CICR, MSF", "ONG int.", "50-80 recrutements/an", "Contacts etablis"],
        ["Orange RCA, Telecel, Moov", "Telecom", "20-30 recrutements/an", "Courriers envoyes"],
        ["IECD Bangui", "ONG fr.", "20-40 recrutements/an", "Discussions avancees"],
        ["PME Bangui (commerce, BTP, sante)", "Prives", "100-200 entreprises cibles", "A prospecter M1-M2"],
        ["Ministeres & institutions RCA", "Public", "Offres fonction publique", "A prospecter M3"],
    ]
    story.append(data_table(pipeline[0], pipeline[1:],
                            [usable*0.33, usable*0.13, usable*0.25, usable*0.29]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 05 — MODELE ECONOMIQUE
    # ════════════════════════════════════════════════════════
    story += section_header("05  —  MODELE ECONOMIQUE")
    story.append(P(
        "KTZ Emploi monetise via 8 sources de revenus complementaires, toutes testees et "
        "validees sur des marches africains comparables (Jobberman, BrighterMonday, Emploi.cm) :", S_BODY_J))
    story.append(SP(0.2))
    rev_data = [
        ["Source de revenus", "Prix unitaire (XAF)", "Volume cible M6", "Revenu M6 (XAF)"],
        ["Abonnement employeur Basique",   "15 000 / mois",  "20 entreprises",  "300 000"],
        ["Abonnement employeur Pro",       "40 000 / mois",  "10 entreprises",  "400 000"],
        ["Abonnement employeur Premium",   "80 000 / mois",  "5 entreprises",   "400 000"],
        ["Offres a la une (featured job)", "30 000 / offre", "20 offres",       "600 000"],
        ["Recrutement executif (agence)",  "15% sal. annuel","3 placements",    "1 500 000"],
        ["Acces CVtheque (recruteurs)",    "25 000 / mois",  "15 recruteurs",   "375 000"],
        ["Formations candidats",           "15 000 / module","20 apprenants",   "300 000"],
        ["Publicite bannières site",       "Forfait mensuel","Entreprises loc.", "150 000"],
        ["TOTAL REVENUS / MOIS (M6)", "", "35 entreprises", "4 025 000 XAF"],
    ]
    t = data_table(rev_data[0], rev_data[1:-1],
                   [usable*0.33, usable*0.2, usable*0.22, usable*0.25])
    story.append(t)
    total_rev = Table([[
        Paragraph("TOTAL REVENUS / MOIS — MOIS 6", ParagraphStyle("TR", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE)),
        Paragraph("", S_BODY),
        Paragraph("35 entreprises", ParagraphStyle("TV", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph("4 025 000 XAF", ParagraphStyle("TE", fontName="Helvetica-Bold",
                   fontSize=9, textColor=ORANGE, alignment=TA_CENTER)),
    ]], colWidths=[usable*0.33, usable*0.2, usable*0.22, usable*0.25])
    total_rev.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    story.append(total_rev)
    story.append(SP(0.2))
    story.append(P(
        "<i>Charges mensuelles : 3 700 628 XAF/mois (5 649 EUR). "
        "Excedent mensuel des M6 : +324 372 XAF (+495 EUR). "
        "Taux : 1 EUR = 655 XAF (parité fixe XAF/EUR depuis 1945).</i>", S_SMALL))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 06 — PROJECTIONS FINANCIERES
    # ════════════════════════════════════════════════════════
    story += section_header("06  —  PROJECTIONS FINANCIERES")
    story.append(kpi_row([
        ("Break-even",          "Mois 6",     "+324 372 XAF d'excedent"),
        ("ROI investissement",  "24-30 mois", "Retour invest. initial"),
        ("Revenus cumules 5a",  "1,68M EUR",  "800M+ XAF sur 5 ans"),
        ("Marge brute cible",   "> 70%",      "Model SaaS + agence"),
    ]))
    story.append(SP(0.3))
    growth = [
        ["Periode", "Revenus / mois", "Charges / mois", "Resultat net"],
        ["M1-M3  Lancement",    "0 — 600K XAF",     "3 700 628 XAF", "Deficit (fonds de roulement)"],
        ["M4-M5  Demarrage",    "1,5M — 2,8M XAF",  "3 700 628 XAF", "Deficit decroissant"],
        ["M6     Seuil",        "4 025 000 XAF",     "3 700 628 XAF", "+324 372 XAF"],
        ["M7-M12 Croissance",   "5M — 6,5M XAF",    "3 900K XAF",    "+1,1M — 2,6M XAF / mois"],
        ["An 2   Consolidation","8M — 10M XAF",      "4 500K XAF",    "+3,5M — 5,5M XAF / mois"],
        ["An 3   Expansion RCA","12M — 15M XAF",     "5 500K XAF",    "+6,5M — 9,5M XAF / mois"],
        ["An 4-5 Hub regional", "18M — 25M+ XAF",   "8 000K XAF",    "+10M — 17M XAF / mois"],
    ]
    story.append(data_table(growth[0], growth[1:],
                            [usable*0.2, usable*0.23, usable*0.23, usable*0.34]))
    story.append(SP(0.2))
    story.append(P(
        "<b>ROI pour FUZE / Digital Africa :</b> pour une prise de participation de 50 000 a 100 000 EUR, "
        "les revenus cumules sur 5 ans sont estimes a 1,68M EUR, avec une valorisation cible "
        "de 3 a 5M EUR en An 3 (base : 2x les revenus annuels recurrents). "
        "Potentiel de sortie via acquisition regionale ou fonds de capital-risque africain.", S_BODY_J))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 07 — BUDGET & UTILISATION DES FONDS
    # ════════════════════════════════════════════════════════
    story += section_header("07  —  BUDGET & UTILISATION DES FONDS FUZE")
    story.append(P(
        "Source : Documentation technique KTZ Emploi v4 (42 pages) — "
        "couts bases sur le marche de Bangui et l'importation depuis Douala.", S_SMALL))
    story.append(SP(0.2))
    story.append(P("<b>Investissement initial total : 44 476 524 XAF (67 801 EUR)</b>", S_H3))
    inv_data = [
        ["Poste de depense", "XAF", "EUR", "% total"],
        ["Materiel informatique (IT, reseau, clim, securite)", "9 790 000", "14 947", "22%"],
        ["Vehicule de service (Toyota HiLux 4x4 + immat.)", "10 000 000", "15 245", "22%"],
        ["Mobilier & amenagement bureau (80m2 Bangui)", "5 725 000", "8 740", "13%"],
        ["Formalites legales (SARL, RCCM, NIF, agrement)", "1 935 000", "2 954", "4%"],
        ["Marketing initial + signaletique", "1 120 000", "1 710", "3%"],
        ["Formation initiale equipe", "330 000", "504", "1%"],
        ["Infra technique (site + app — setup)", "181 320", "277", "<1%"],
        ["Fournitures initiales", "250 000", "382", "1%"],
        ["Fonds de roulement (3 mois charges)", "11 101 884", "16 949", "25%"],
        ["Imprevus (10%)", "4 043 320", "6 165", "9%"],
    ]
    story.append(data_table(inv_data[0], inv_data[1:],
                            [usable*0.48, usable*0.2, usable*0.14, usable*0.18]))
    total_inv = Table([[
        Paragraph("TOTAL INVESTISSEMENT INITIAL", ParagraphStyle("TI", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE)),
        Paragraph("44 476 524 XAF", ParagraphStyle("TIX", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph("67 801 EUR", ParagraphStyle("TIE", fontName="Helvetica-Bold",
                   fontSize=9, textColor=ORANGE, alignment=TA_CENTER)),
        Paragraph("100%", ParagraphStyle("TIP", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
    ]], colWidths=[usable*0.48, usable*0.2, usable*0.14, usable*0.18])
    total_inv.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    story.append(total_inv)
    story.append(SP(0.3))

    story.append(P("<b>Repartition de l'apport FUZE (50 000 - 100 000 EUR cible) :</b>", S_H3))
    fuze_use = [
        ["Utilisation", "Montant (EUR)", "Justification"],
        ["Materiel informatique + vehicule", "30 000", "Infrastructure critique — commande Douala"],
        ["Bureau Bangui (6 mois loyer + amenagement)", "12 000", "Acces physique au marche local"],
        ["Recrutement equipe locale (6 mois)", "15 000", "7 employes — RH cle pour la croissance"],
        ["Marketing & acquisition clients", "8 000", "Radio, SMS, reseaux sociaux, partenariats"],
        ["Centre de formation (1ere promotion)", "10 000", "6 modules, 50 apprenants"],
        ["Reserve de tresorerie (3 mois)", "10 000", "Securite operationnelle"],
        ["Formalites legales + divers", "5 000", "SARL, RCCM, NIF, agrement Min. Travail"],
        ["TOTAL", "90 000 EUR", "Apport FUZE cible"],
    ]
    story.append(data_table(fuze_use[0], fuze_use[1:-1],
                            [usable*0.38, usable*0.18, usable*0.44]))
    total_fuze = Table([[
        Paragraph("TOTAL APPORT FUZE CIBLE", ParagraphStyle("TF", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE)),
        Paragraph("90 000 EUR", ParagraphStyle("TFV", fontName="Helvetica-Bold",
                   fontSize=9, textColor=ORANGE, alignment=TA_CENTER)),
        Paragraph("Equity — a negocier", ParagraphStyle("TFF", fontName="Helvetica-Bold",
                   fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
    ]], colWidths=[usable*0.38, usable*0.18, usable*0.44])
    total_fuze.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",(0,0),(-1,-1),7),
        ("BOTTOMPADDING",(0,0),(-1,-1),7),
        ("LEFTPADDING",(0,0),(-1,-1),8),
    ]))
    story.append(total_fuze)
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 08 — STRATEGIE DE CROISSANCE
    # ════════════════════════════════════════════════════════
    story += section_header("08  —  STRATEGIE DE CROISSANCE")
    growth_strat = [
        ["Phase", "Periode", "Geographie", "Objectifs cles"],
        ["Lancement",      "M1 — M6",   "Bangui (RCA)",       "35 entreprises, 500 candidats, break-even M6"],
        ["Consolidation",  "M7 — M12",  "Bangui + 2 villes",  "70 entreprises, 2 000 candidats, 50 formes"],
        ["Expansion RCA",  "An 2",      "5 villes RCA",       "150 entreprises, 10 000 utilisateurs actifs"],
        ["Tchad",          "An 3",      "N'Djamena",          "Replication modele, partenariats locaux"],
        ["Congo + Cam.",   "An 4-5",    "Brazza + Yaounde",   "Hub Afrique centrale, 40M+ hab. adresses"],
    ]
    story.append(data_table(growth_strat[0], growth_strat[1:],
                            [usable*0.17, usable*0.13, usable*0.2, usable*0.5]))
    story.append(SP(0.3))
    story.append(P(
        "La strategie de replication est simple : le code source est open source (MIT), "
        "l'architecture est multi-tenant, et le modele economique est identique d'un pays a l'autre. "
        "L'equipe fondatrice apporte la connaissance des marches francophones d'Afrique centrale "
        "et un reseau institutionnel (PNUD, OIT, FAO, GIZ) activable dans chaque nouveau pays.", S_BODY_J))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 09 — TECHNOLOGIE & OPEN SOURCE
    # ════════════════════════════════════════════════════════
    story += section_header("09  —  TECHNOLOGIE & OPEN SOURCE")
    story.append(P("<b>Stack technique complete :</b>", S_H3))
    tech_data = [
        ["Composant", "Technologie", "Licence", "Pourquoi ce choix"],
        ["Frontend web",    "Next.js 15 (React)",      "MIT",        "SSR, performance, SEO — standard mondial"],
        ["Mobile Android",  "Expo SDK 54 / React Native","MIT",      "Un seul codebase JS pour Android"],
        ["ORM / BDD",       "Prisma + SQLite -> Neon",  "Apache 2.0","Migration facile vers PostgreSQL cloud"],
        ["Auth",            "NextAuth.js (JWT)",         "ISC",       "Securite standard industrie"],
        ["UI Mobile",       "React Native Paper",        "MIT",       "Material Design adapte RCA"],
        ["State management","Zustand + TanStack Query",  "MIT",       "Leger, performant, cache API"],
        ["Hebergement",     "Vercel (CDN USA)",          "SaaS",      "Independant du reseau local RCA"],
        ["App store",       "Google Play Store",         "-",         "Ecosystem Android dominant en RCA"],
    ]
    story.append(data_table(tech_data[0], tech_data[1:],
                            [usable*0.18, usable*0.25, usable*0.12, usable*0.45]))
    story.append(SP(0.3))
    story.append(P("<b>Engagement open source (conformite FUZE / Digital Africa) :</b>", S_H3))
    os_items = [
        "Publication integrale du code source sous licence MIT sur GitHub dans les 90 jours suivant le financement",
        "API REST publique pour les donnees agregees et anonymisees du marche de l'emploi centrafricain",
        "Tableau de bord open data en temps reel : offres actives, secteurs, competences, salaires RCA",
        "Documentation complete (README, API docs, guide de deploiement) pour replication dans d'autres pays",
        "Fork libre autorise : tout pays africain peut adapter la plateforme pour son marche local",
    ]
    for item in os_items:
        story.append(P(f"• {item}", S_BULLET))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 10 — IMPACT SOCIAL
    # ════════════════════════════════════════════════════════
    story += section_header("10  —  IMPACT SOCIAL & DEVELOPPEMENT")
    story.append(kpi_row([
        ("Candidats An 1",     "5 000",   "Inscrits sur la plateforme"),
        ("Entreprises An 1",   "200",     "ONG, PME, institutions"),
        ("Jeunes formes An 1", "500",     "Centre de formation"),
        ("Emplois directs",    "50",      "Agence + projets agro"),
    ]))
    story.append(SP(0.3))
    impact_data = [
        ["Axe d'impact", "Action KTZ Emploi", "ODD associe"],
        ["Emploi des jeunes", "Plateforme + agence : acces a l'emploi formel pour les 18-35 ans", "ODD 8"],
        ["Education & formation", "Centre certifiant : 6 modules, 500 jeunes formes An 1", "ODD 4"],
        ["Reduction des inegalites", "App mobile accessible zones secondaires hors Bangui", "ODD 10"],
        ["Securite alimentaire", "Huile d'arachide + aviculture : emplois ruraux + nutrition", "ODD 2"],
        ["Infrastructure numerique", "1ere plateforme emploi RCA — donnees open data marche travail", "ODD 9"],
        ["Partenariats", "PNUD, UNICEF, OIT, FAO, GIZ, ACFPE, Universite Bangui", "ODD 17"],
    ]
    story.append(data_table(impact_data[0], impact_data[1:],
                            [usable*0.25, usable*0.57, usable*0.18]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 11 — RISQUES
    # ════════════════════════════════════════════════════════
    story += section_header("11  —  ANALYSE DES RISQUES")
    risks = [
        ["Risque", "Niveau", "Solution concrete"],
        ["Internet instable en RCA", "Eleve", "Hebergement Vercel USA. Double 4G (2 operateurs). App offline partiel."],
        ["Coupures electricite ENERCA", "Certain", "Groupe electrogene 3,5 kVA + UPS sur tous les postes."],
        ["Faible adoption digitale", "Eleve", "Agence physique + inscription en agence + notifications SMS."],
        ["Paiement en ligne inexistant", "Eleve", "Paiement en agence. Integ. Orange Money / Airtel Money."],
        ["Instabilite politique RCA", "Possible", "Plateforme cloud hors RCA. Teletravail possible pour l'equipe."],
        ["Concurrence informelle (WA)", "Certain", "Valeur ajoutee claire : profils verifies, filtres, tableau bord."],
        ["Dilution equity fondateur", "Moyen", "Structure equity a negocier — conservation > 60% par fondateur."],
    ]
    story.append(data_table(risks[0], risks[1:],
                            [usable*0.3, usable*0.1, usable*0.6]))
    story.append(PageBreak())

    # ════════════════════════════════════════════════════════
    # SECTION 12 — CE QUE NOUS DEMANDONS
    # ════════════════════════════════════════════════════════
    story += section_header("12  —  CE QUE NOUS DEMANDONS A FUZE / DIGITAL AFRICA")
    demands = [
        ("1.", "Investissement pre-seed : 50 000 a 100 000 EUR (equity)",
         "Pour financer le materiel, le bureau Bangui, l'equipe locale et le lancement commercial. "
         "La prise de participation sera negociee avec le comite d'investissement Digital Africa."),
        ("2.", "Acces au reseau Digital Africa",
         "Mise en relation avec les autres startups du portefeuille, les investisseurs regionaux "
         "(Orange Ventures, Proparco, Partech Africa) et les acheteurs institutionnels en Afrique centrale."),
        ("3.", "Mentorat & accompagnement",
         "Acces aux experts Digital Africa en go-to-market africain, structuration equity, "
         "conformite legale multi-pays et levee de fonds Series A."),
        ("4.", "Visibilite & credibilite AFD",
         "Le label FUZE / AFD ouvre les portes des grands employeurs institutionnels "
         "(agences ONU, ambassades, ONG internationales) presents en RCA — cibles premiums de KTZ Emploi."),
        ("5.", "Accompagnement expansion regionale",
         "Support pour l'extension au Tchad et Congo-Brazzaville a partir de l'An 3, "
         "en lien avec les bureaux AFD de N'Djamena et Brazzaville."),
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
    story.append(SP(0.4))

    final_box = Table([[Paragraph(
        "KTZ Emploi est le premier entrant sur un marche de l'emploi de 5 millions d'habitants "
        "sans aucun concurrent digital. Avec un prototype fonctionnel, une documentation technique "
        "de 42 pages et un break-even prevu des le 6e mois, <b>KTZ Emploi est pret a passer "
        "a l'echelle avec le soutien de FUZE / Digital Africa.</b>",
        ParagraphStyle("FB", fontName="Helvetica-Bold", fontSize=9.5,
                       textColor=WHITE, alignment=TA_CENTER, leading=14)
    )]], colWidths=[usable])
    final_box.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1),AFD_BLUE),
        ("TOPPADDING",    (0,0),(-1,-1),16),
        ("BOTTOMPADDING", (0,0),(-1,-1),16),
        ("LEFTPADDING",   (0,0),(-1,-1),16),
        ("RIGHTPADDING",  (0,0),(-1,-1),16),
        ("ROUNDEDCORNERS",[8]),
    ]))
    story.append(final_box)
    story.append(SP(0.3))

    sig = Table([[
        Paragraph("Donald Chrysostome KITEZE<br/>"
                  "<font size='7' color='#94A3B8'>Ingenieur Microelectronique, Telecom & Reseaux</font><br/>"
                  "<font size='7' color='#F97316'>Fondateur KTZ Emploi | President APT</font>",
                  ParagraphStyle("SG", fontName="Helvetica-Bold", fontSize=9,
                                 textColor=AFD_BLUE, leading=14)),
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

    doc.build(story, onFirstPage=pt.on_page, onLaterPages=pt.on_page)
    print(f"PDF genere : {OUTPUT}")


if __name__ == "__main__":
    build()
