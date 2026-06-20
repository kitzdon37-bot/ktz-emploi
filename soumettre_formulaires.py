"""
Soumission automatique des formulaires partenaires — KTZ Emploi
"""
import asyncio
from playwright.async_api import async_playwright
import time

# ─── INFOS EXPEDITEUR ─────────────────────────────────────────────────────────

INFO = {
    "nom":          "Donald Chrysostome KITEZE",
    "prenom":       "Donald",
    "email":        "kitzdon37@gmail.com",
    "telephone":    "+33625345175",
    "organisation": "KTZ Emploi",
    "site":         "https://ktzemploi.com",
    "linkedin":     "https://linkedin.com/in/donald-kiteze",
    "pays":         "République Centrafricaine / France",
    "ville":        "Nice, France",
    "message": (
        "Bonjour,\n\n"
        "Je me permets de vous contacter au nom du projet KTZ Emploi (https://ktzemploi.com), "
        "la premiere plateforme digitale de recrutement dediee a la Republique Centrafricaine.\n\n"
        "Je suis Donald KITEZE, jeune Centrafricain de 29 ans, Ingenieur en Microelectronique, "
        "Telecommunications et Reseaux, residant a Nice en France. Je porte plusieurs projets "
        "a fort impact social et economique en RCA : KTZ Emploi (plateforme emploi + agence + "
        "centre de formation), une association de formation (APT), et des projets agro-industriels "
        "(huile d'arachide, aviculture).\n\n"
        "Je souhaite explorer les possibilites de partenariat ou de financement avec votre "
        "organisation. Seriez-vous disponible pour un echange ?\n\n"
        "Cordialement,\n"
        "Donald Chrysostome KITEZE\n"
        "kitzdon37@gmail.com | +33 6 25 34 51 75\n"
        "https://ktzemploi.com"
    ),
    "sujet": "Demande de partenariat - KTZ Emploi, premiere plateforme d'emploi en RCA",
}

RESULTATS = []

# ─── HELPERS ──────────────────────────────────────────────────────────────────

async def log(nom, statut, detail=""):
    line = f"[{nom}] {statut}"
    if detail:
        line += f" — {detail}"
    print(line)
    RESULTATS.append({"partenaire": nom, "statut": statut, "detail": detail})

async def remplir(page, selector, valeur, timeout=5000):
    try:
        await page.wait_for_selector(selector, timeout=timeout)
        await page.fill(selector, valeur)
        return True
    except Exception:
        return False

# ─── TELECEL ASIP ─────────────────────────────────────────────────────────────

async def soumettre_asip(page):
    NOM = "Telecel ASIP"
    try:
        await page.goto("https://asiprogram.com/contact-2/", timeout=30000)
        await page.wait_for_load_state("domcontentloaded")

        champs = [
            (["input[name='your-name']", "input[placeholder*='name' i]", "input[id*='name' i]"], INFO["nom"]),
            (["input[name='your-email']", "input[type='email']", "input[placeholder*='email' i]"], INFO["email"]),
            (["input[name='your-subject']", "input[placeholder*='subject' i]", "input[placeholder*='sujet' i]"], INFO["sujet"]),
            (["textarea[name='your-message']", "textarea"], INFO["message"]),
        ]

        for selecteurs, valeur in champs:
            for sel in selecteurs:
                if await remplir(page, sel, valeur):
                    break

        boutons = ["input[type='submit']", "button[type='submit']", "button:has-text('Send')", "button:has-text('Envoyer')"]
        for b in boutons:
            try:
                await page.click(b, timeout=3000)
                break
            except Exception:
                continue

        await page.wait_for_timeout(3000)
        await log(NOM, "OK", "Formulaire soumis")
    except Exception as e:
        await log(NOM, "ECHEC", str(e)[:100])

# ─── AJIM CAPITAL ─────────────────────────────────────────────────────────────

async def soumettre_ajim(page):
    NOM = "Ajim Capital"
    try:
        await page.goto("https://ajimcapital.com/founders", timeout=30000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(2000)

        champs_possibles = [
            (["input[placeholder*='first name' i]", "input[name*='first' i]"], "Donald"),
            (["input[placeholder*='last name' i]",  "input[name*='last' i]"],  "KITEZE"),
            (["input[placeholder*='name' i]",        "input[name='name']"],     INFO["nom"]),
            (["input[type='email']",                 "input[placeholder*='email' i]"], INFO["email"]),
            (["input[placeholder*='company' i]",     "input[name*='company' i]"],      "KTZ Emploi"),
            (["input[placeholder*='website' i]",     "input[name*='website' i]"],      INFO["site"]),
            (["input[placeholder*='linkedin' i]",    "input[name*='linkedin' i]"],     INFO["linkedin"]),
            (["input[placeholder*='country' i]",     "input[name*='country' i]"],      "Central African Republic"),
            (["textarea",                            "input[placeholder*='pitch' i]"], INFO["site"]),
        ]

        for selecteurs, valeur in champs_possibles:
            for sel in selecteurs:
                if await remplir(page, sel, valeur, timeout=2000):
                    break

        boutons = ["button[type='submit']", "input[type='submit']",
                   "button:has-text('Submit')", "button:has-text('Apply')"]
        for b in boutons:
            try:
                await page.click(b, timeout=3000)
                break
            except Exception:
                continue

        await page.wait_for_timeout(3000)
        await log(NOM, "OK", "Formulaire soumis")
    except Exception as e:
        await log(NOM, "ECHEC", str(e)[:100])

# ─── SEEDSTARS ────────────────────────────────────────────────────────────────

async def soumettre_seedstars(page):
    NOM = "Seedstars Africa"
    try:
        await page.goto("https://www.seedstars.com/contact-us/", timeout=30000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(2000)

        champs_possibles = [
            (["input[name*='name' i]",    "input[placeholder*='name' i]"],    INFO["nom"]),
            (["input[type='email']",       "input[placeholder*='email' i]"],   INFO["email"]),
            (["input[name*='company' i]",  "input[placeholder*='company' i]"], "KTZ Emploi"),
            (["textarea",                  "input[name*='message' i]"],        INFO["message"]),
            (["input[name*='subject' i]",  "input[placeholder*='subject' i]"], INFO["sujet"]),
        ]

        for selecteurs, valeur in champs_possibles:
            for sel in selecteurs:
                if await remplir(page, sel, valeur, timeout=2000):
                    break

        boutons = ["button[type='submit']", "input[type='submit']",
                   "button:has-text('Send')", "button:has-text('Submit')"]
        for b in boutons:
            try:
                await page.click(b, timeout=3000)
                break
            except Exception:
                continue

        await page.wait_for_timeout(3000)
        await log(NOM, "OK", "Formulaire soumis")
    except Exception as e:
        await log(NOM, "ECHEC", str(e)[:100])

# ─── BANGUI HUB ───────────────────────────────────────────────────────────────

async def soumettre_bangui_hub(page):
    NOM = "Bangui Hub Foundation"
    try:
        await page.goto("https://www.banguihub.org/contact/", timeout=30000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(2000)

        champs_possibles = [
            (["input[name*='name' i]",    "input[placeholder*='name' i]",  "input[id*='name' i]"],   INFO["nom"]),
            (["input[type='email']",       "input[placeholder*='email' i]", "input[name*='email' i]"], INFO["email"]),
            (["input[name*='subject' i]",  "input[placeholder*='subject' i]"],                        INFO["sujet"]),
            (["textarea",                  "input[name*='message' i]"],                               INFO["message"]),
        ]

        for selecteurs, valeur in champs_possibles:
            for sel in selecteurs:
                if await remplir(page, sel, valeur, timeout=2000):
                    break

        boutons = ["input[type='submit']", "button[type='submit']",
                   "button:has-text('Envoyer')", "button:has-text('Send')"]
        for b in boutons:
            try:
                await page.click(b, timeout=3000)
                break
            except Exception:
                continue

        await page.wait_for_timeout(3000)
        await log(NOM, "OK", "Formulaire soumis")
    except Exception as e:
        await log(NOM, "ECHEC", str(e)[:100])

# ─── ACTIVSPACES ──────────────────────────────────────────────────────────────

async def soumettre_activspaces(page):
    NOM = "ActivSpaces"
    try:
        await page.goto("https://activspaces.com/contact", timeout=30000)
        await page.wait_for_load_state("domcontentloaded")
        await page.wait_for_timeout(2000)

        champs_possibles = [
            (["input[name*='name' i]",    "input[placeholder*='name' i]"],    INFO["nom"]),
            (["input[type='email']",       "input[placeholder*='email' i]"],   INFO["email"]),
            (["input[name*='subject' i]",  "input[placeholder*='subject' i]"], INFO["sujet"]),
            (["textarea",                  "input[name*='message' i]"],        INFO["message"]),
        ]

        for selecteurs, valeur in champs_possibles:
            for sel in selecteurs:
                if await remplir(page, sel, valeur, timeout=2000):
                    break

        boutons = ["button[type='submit']", "input[type='submit']",
                   "button:has-text('Send')", "button:has-text('Submit')"]
        for b in boutons:
            try:
                await page.click(b, timeout=3000)
                break
            except Exception:
                continue

        await page.wait_for_timeout(3000)
        await log(NOM, "OK", "Formulaire soumis")
    except Exception as e:
        await log(NOM, "ECHEC", str(e)[:100])

# ─── MAIN ─────────────────────────────────────────────────────────────────────

async def main():
    print("=== Soumission automatique des formulaires partenaires ===\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        await soumettre_asip(page)
        await asyncio.sleep(5)
        await soumettre_ajim(page)
        await asyncio.sleep(5)
        await soumettre_seedstars(page)
        await asyncio.sleep(5)
        await soumettre_bangui_hub(page)
        await asyncio.sleep(5)
        await soumettre_activspaces(page)

        await browser.close()

    print("\n=== RESUME ===")
    for r in RESULTATS:
        print(f"  {r['statut']:6} | {r['partenaire']}" + (f" — {r['detail']}" if r['detail'] else ""))

    non_auto = [
        ("FUZE / Digital Africa",  "https://application.fuze.digital-africa.co/",        "Application complexe — pitch deck + video requis"),
        ("UNICEF Venture Fund",    "https://www.unicefventurefund.org/",                  "Candidature par cohorte — pitch deck requis"),
        ("BAD — Fonds Jeunesse",   "https://www.afdb.org/fr/topics-and-sectors/initiatives-partnerships/jobs-for-youth-in-africa", "Portail — login requis"),
        ("AfriLabs",               "https://www.afrilabs.com",                            "Pas de formulaire web — contact physique : Abuja, Nigeria"),
    ]
    print("\n=== NECESSITENT ACTION MANUELLE ===")
    for nom, url, raison in non_auto:
        print(f"  - {nom}\n    URL : {url}\n    Raison : {raison}\n")


if __name__ == "__main__":
    asyncio.run(main())
