# -*- coding: utf-8 -*-
import asyncio
from playwright.async_api import async_playwright

EMAIL    = "kitzdon37@gmail.com"
PASSWORD = "Fuze@KTZ2026!"
PITCH    = "C:/Users/donald-chrysostome.k/rca-jobs/PITCH_DECK_FUZE_KTZ_EMPLOI.pdf"
DOSSIER  = "C:/Users/donald-chrysostome.k/rca-jobs/DOSSIER_FUZE_DIGITAL_AFRICA.pdf"
PV       = "C:/Users/donald-chrysostome.k/Desktop/PV- KTZ Association.pdf"

async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(ignore_https_errors=True)

        # LOGIN
        await page.goto("https://application.fuze.digital-africa.co/sign-in", timeout=30000)
        await page.wait_for_timeout(4000)
        await page.fill("input[name=email]",    EMAIL)
        await page.fill("input[name=password]", PASSWORD)
        for b in await page.query_selector_all("button"):
            if "login" in (await b.inner_text()).lower():
                await b.click(); break
        await page.wait_for_timeout(7000)
        print(f"URL apres login: {page.url}")

        # ── Champs texte par name ────────────────────────────────────────────
        await page.fill("input[name=name]", "KTZ Emploi")
        await page.fill("input[name=website]", "https://ktzemploi.com")
        await page.fill("textarea[name=project_description]",
            "KTZ Emploi est la premiere plateforme digitale de recrutement de la Republique "
            "Centrafricaine (RCA). Ecosysteme 3 piliers : site web ktzemploi.com + application "
            "mobile Android (Expo SDK 54 / React Native) + agence de recrutement physique a Bangui "
            "+ centre de formation professionnelle certifiant. Secteur : Numerique / Emploi / "
            "Formation. Stade : prototype fonctionnel deploye. Break-even prevu Mois 6 "
            "(+324 372 XAF). ROI cumule 5 ans : 1,68M EUR.")
        await page.fill("textarea[name=problem_description]",
            "La RCA a un taux de chomage des jeunes superieur a 60% dans un marche 100% informel. "
            "Aucune plateforme digitale d emploi n existe dans le pays. Les offres circulent "
            "uniquement par bouche-a-oreille ou WhatsApp. Les entreprises et ONG peinent a trouver "
            "des profils locaux qualifies. Les zones hors Bangui sont totalement exclues du marche "
            "de l emploi formel. Ce vide prive des milliers de jeunes d opportunites chaque annee.")
        await page.fill("textarea[name=innovation_description]",
            "KTZ Emploi est le PREMIER ENTRANT sur un marche vierge de 5,5 millions d habitants "
            "avec zero concurrent digital. Stack moderne (Next.js 15, React Native / Expo SDK 54) "
            "optimisee faible connectivite et smartphones d entree de gamme. "
            "Modele hybride unique : digital + agence physique + formation professionnelle. "
            "API open data marche emploi centrafricain. Code open source MIT. "
            "Premier contact partenariats : PNUD, IECD Bangui, ACFPE, OIT, FAO.")
        await page.fill("input[name='founder.0.linkedin_cofounder']",
            "https://linkedin.com/in/donald-kiteze")
        await page.fill("input[name=Quels_sont_vos_revenus_des_6_derniers_mois]", "0")
        await page.fill("input[name=quel_est_votre_customer_engagement]", "B2B + B2C")
        await page.fill("textarea[name=description_of_the_current_status_of_your_project]",
            "Prototype fonctionnel deploye : ktzemploi.com en ligne (Next.js, Vercel), "
            "application Android developpee et testee (Google Play en cours), "
            "backend API REST complet (auth JWT, CVtheque, candidatures, favoris, stats). "
            "Partenariats en cours : IECD Bangui, ACFPE, PNUD. "
            "12 courriers envoyes : PNUD, OIT, FAO, OIM, GIZ, Proparco. "
            "Investissement fonds propres : 3 000 a 5 000 EUR. "
            "Documentation technique 42 pages (budget, projections, risques, calendrier).")
        await page.fill("input[name=youtube_link_of_your_pitch]", "https://ktzemploi.com")
        await page.fill("textarea[name=what_awards_have_you_received_for_your_startup]",
            "Candidature PNUD YouthConnekt RCA en cours. "
            "Contacts etablis avec IECD Bangui, ACFPE, OIT, FAO, GIZ, Proparco. "
            "Association Avenir Pour Tous (APT) fondee en France.")
        await page.fill("input[name=comment_avez_vous_connu_fuse]",
            "Recherche internet et reseau AFD / Digital Africa")
        print("Champs texte remplis")

        # ── Radios ───────────────────────────────────────────────────────────
        radios = await page.query_selector_all("input[type=radio]")
        print(f"{len(radios)} radios")
        if len(radios) >= 2:
            await radios[1].click()   # Not incorporated
        if len(radios) >= 4:
            await radios[3].click()   # No income
        if len(radios) >= 6:
            await radios[5].click()   # No raised funds

        # ── Founding date ────────────────────────────────────────────────────
        try:
            await page.fill("input[type=tel]", "01/01/2025")
            print("Founding date remplie")
        except Exception as e:
            print(f"founding date: {e}")

        # ── Country BU ───────────────────────────────────────────────────────
        try:
            all_text = await page.query_selector_all("input[type=text]:not([name])")
            for el in all_text:
                val = await el.input_value()
                if val == "":
                    await el.fill("Central African Republic / France")
                    print("Country BU rempli")
                    break
        except Exception as e:
            print(f"country BU: {e}")

        # ── MUI Select: country based ─────────────────────────────────────────
        # div[role=combobox] index: 0=English, 1=country based, 2=nationality, 3=genre
        try:
            div_combos = await page.query_selector_all('div[role=combobox]')
            print(f"{len(div_combos)} div combobox trouves")
            if len(div_combos) >= 2:
                await div_combos[1].scroll_into_view_if_needed()
                await div_combos[1].click()
                await page.wait_for_timeout(2000)
                opts = await page.query_selector_all('ul[role=listbox] li')
                print(f"Listbox options: {len(opts)}")
                for o in opts:
                    txt = (await o.inner_text()).lower()
                    if "central african" in txt:
                        await o.click()
                        print("Central African Republic selectionne")
                        break
                else:
                    print("CAR not found in listbox")
                    await page.keyboard.press("Escape")
        except Exception as e:
            print(f"country based: {e}")
        await page.wait_for_timeout(500)

        # ── Autocomplete: operations country (id=operations_country) ─────────
        try:
            inp = page.locator("input#operations_country")
            await inp.scroll_into_view_if_needed()
            await inp.click()
            await inp.fill("Central African")
            await page.wait_for_timeout(1500)
            opts = await page.query_selector_all('[role=option]')
            print(f"Op country options: {len(opts)}")
            for o in opts:
                txt = (await o.inner_text()).lower()
                if "central" in txt:
                    await o.click()
                    print("Op country selectionne")
                    break
        except Exception as e:
            print(f"op country: {e}")
        await page.wait_for_timeout(500)

        # ── Autocomplete: industry (id=line_of_business) ─────────────────────
        # Options: AdTech, AgriTech, ArtTech, Big Data, Biotech, CleanTech, EdTech,
        #          E-Gov/CivicTech, FashionTech, FinTech, FoodTech, GreenTech, HealthTech,
        #          IoT, InsurTech, LegalTech, RetailTech, Smart City, Autre
        # → EdTech car KTZ Emploi a un centre de formation professionnelle
        try:
            inp = page.locator("input#line_of_business")
            await inp.scroll_into_view_if_needed()
            await inp.click()
            await page.wait_for_timeout(1000)
            opts = await page.query_selector_all('[role=option]')
            print(f"Industry options: {len(opts)}")
            chosen = False
            for o in opts:
                txt = (await o.inner_text()).strip()
                if txt.lower() == "edtech":
                    await o.click()
                    print(f"Industry selectionne: {txt}")
                    chosen = True
                    break
            if not chosen and opts:
                await opts[0].click()
                print(f"Industry fallback: {await opts[0].inner_text()}")
        except Exception as e:
            print(f"industry: {e}")
        await page.wait_for_timeout(500)

        # ── Screenshot pour verifier ─────────────────────────────────────────
        await page.screenshot(path="fuze_before_save.png", full_page=True)
        print("Screenshot avant save pris")

        # ── File uploads ─────────────────────────────────────────────────────
        file_inputs = await page.query_selector_all("input[type=file]")
        print(f"{len(file_inputs)} file inputs")
        try:
            if len(file_inputs) >= 2:
                await file_inputs[1].set_input_files(PV)
                print("K-bis/PV uploade")
        except Exception as e:
            print(f"PV upload: {e}")
        try:
            if len(file_inputs) >= 3:
                await file_inputs[2].set_input_files(PITCH)
                print("Pitch deck uploade")
        except Exception as e:
            print(f"Pitch upload: {e}")
        try:
            if len(file_inputs) >= 4:
                await file_inputs[3].set_input_files(DOSSIER)
                print("Dossier uploade")
        except Exception as e:
            print(f"Dossier upload: {e}")

        await page.wait_for_timeout(2000)
        await page.screenshot(path="fuze_final_filled.png", full_page=True)
        print("Screenshot final pris")

        # ── Save ─────────────────────────────────────────────────────────────
        for b in await page.query_selector_all("button"):
            if (await b.inner_text()).strip().lower() == "save":
                await b.click()
                print("Save clique")
                await page.wait_for_timeout(5000)
                break

        await page.screenshot(path="fuze_after_save.png", full_page=True)

        # ── Next ─────────────────────────────────────────────────────────────
        for b in await page.query_selector_all("button"):
            if "next" in (await b.inner_text()).strip().lower():
                await b.click()
                print("Next clique")
                await page.wait_for_timeout(6000)
                break

        print(f"URL finale: {page.url}")
        await page.screenshot(path="fuze_resultat.png", full_page=True)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
