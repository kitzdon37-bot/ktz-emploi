# -*- coding: utf-8 -*-
import asyncio
from playwright.async_api import async_playwright

EMAIL    = "kitzdon37@gmail.com"
PASSWORD = "Fuze@KTZ2026!"
STARTUP_ID = "5146e557-a510-438f-bcbf-0fdc895ba38d"

async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(ignore_https_errors=True)

        # LOGIN
        await page.goto("https://application.fuze.digital-africa.co/sign-in", timeout=30000)
        await page.wait_for_timeout(4000)
        await page.fill("input[name=email]", EMAIL)
        await page.fill("input[name=password]", PASSWORD)
        for b in await page.query_selector_all("button"):
            if "login" in (await b.inner_text()).lower():
                await b.click(); break
        await page.wait_for_timeout(7000)
        print(f"URL apres login: {page.url}")

        # ── ETAPE: Support ───────────────────────────────────────────────────
        support_url = f"https://application.fuze.digital-africa.co/add-support/{STARTUP_ID}"
        await page.goto(support_url, timeout=30000)
        await page.wait_for_timeout(3000)
        print(f"URL: {page.url}")
        await page.screenshot(path="fuze_support.png", full_page=True)

        # "No" devrait etre deja selectionne
        radios = await page.query_selector_all("input[type=radio]")
        print(f"{len(radios)} radios sur cette page")
        for i, r in enumerate(radios):
            checked = await r.is_checked()
            print(f"  radio[{i}] checked={checked}")

        # Verifier que "No" est selectionne
        # Si pas selectionne, le faire
        if len(radios) >= 2:
            if not await radios[1].is_checked():
                await radios[1].click()
                print("No selectionne")
            else:
                print("No deja selectionne")

        # Save + Next
        for b in await page.query_selector_all("button"):
            txt = (await b.inner_text()).strip().lower()
            if txt == "save":
                await b.click()
                print("Save clique")
                await page.wait_for_timeout(3000)
                break

        for b in await page.query_selector_all("button"):
            txt = (await b.inner_text()).strip().lower()
            if "next" in txt:
                await b.click()
                print("Next clique")
                await page.wait_for_timeout(5000)
                break

        print(f"URL apres support: {page.url}")
        await page.screenshot(path="fuze_apres_support.png", full_page=True)

        # ── Boucle sur les pages suivantes ──────────────────────────────────
        max_steps = 10
        for step in range(max_steps):
            current_url = page.url
            print(f"\n=== Etape {step+1}: {current_url} ===")

            # Capturer la page pour analyse
            await page.screenshot(path=f"fuze_step_{step+1}.png", full_page=True)

            # Analyser la page
            title_els = await page.query_selector_all("h4, h3, h2, h5, [class*='title'], [class*='heading']")
            for el in title_els[:5]:
                txt = (await el.inner_text()).strip()
                if txt:
                    print(f"  Titre: {txt[:80]}")

            # Texte des questions
            questions = await page.query_selector_all("p, label, [class*='question']")
            seen = set()
            for q in questions:
                txt = (await q.inner_text()).strip()
                if txt and txt not in seen and 5 < len(txt) < 300:
                    seen.add(txt)
                    print(f"  Question: {txt[:100]}")

            # Champs de saisie
            inputs = await page.query_selector_all("input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea")
            print(f"  {len(inputs)} champs de saisie")

            radios = await page.query_selector_all("input[type=radio]")
            print(f"  {len(radios)} radios")

            # Remplir automatiquement si possible
            await remplir_etape(page)

            # Bouton Submit/Finish si present
            finish_clicked = False
            for b in await page.query_selector_all("button"):
                txt = (await b.inner_text()).strip().lower()
                if any(k in txt for k in ["submit", "finish", "envoyer", "terminer", "complete"]):
                    print(f"  Bouton final trouve: '{txt}'")
                    await b.click()
                    await page.wait_for_timeout(5000)
                    finish_clicked = True
                    break

            # Bouton Next
            next_clicked = False
            if not finish_clicked:
                for b in await page.query_selector_all("button"):
                    txt = (await b.inner_text()).strip().lower()
                    if "next" in txt:
                        await b.click()
                        print(f"  Next clique")
                        await page.wait_for_timeout(5000)
                        next_clicked = True
                        break

            new_url = page.url
            if new_url == current_url and not finish_clicked:
                # Essayer Save d'abord
                for b in await page.query_selector_all("button"):
                    if (await b.inner_text()).strip().lower() == "save":
                        await b.click()
                        print("  Save clique (retry)")
                        await page.wait_for_timeout(3000)
                        break
                # Puis Next
                for b in await page.query_selector_all("button"):
                    if "next" in (await b.inner_text()).strip().lower():
                        await b.click()
                        print("  Next clique (retry)")
                        await page.wait_for_timeout(5000)
                        break
                new_url = page.url

            if new_url == current_url:
                print("  URL inchangee - fin ou erreur")
                break

            # Detecter fin du formulaire
            if any(k in new_url for k in ["success", "complete", "confirm", "dashboard", "thank"]):
                print(f"  SUCCES ! URL finale: {new_url}")
                break

        await page.screenshot(path="fuze_final.png", full_page=True)
        print(f"\nURL finale: {page.url}")
        await browser.close()


async def remplir_etape(page):
    """Remplir les champs selon le contexte de la page."""
    url = page.url

    # Page support (deja geree)
    if "add-support" in url:
        return

    # Page team
    if "team" in url or "founder" in url:
        try:
            await page.fill("input[name='team_size']", "1", timeout=2000)
        except:
            pass
        return

    # Pages avec radios: selectionner "No" par defaut si non selectionne
    radios = await page.query_selector_all("input[type=radio]")
    if radios and len(radios) >= 2:
        # Verifier si aucun n'est coche
        any_checked = any([await r.is_checked() for r in radios])
        if not any_checked:
            # Selectionner "No" (generalement index 1)
            await radios[1].click()
            print(f"  Radio 'No' selectionne par defaut")

    # Remplir champs vides avec valeur par defaut
    inputs = await page.query_selector_all("input[type=text]:not([name*=founder]):not([name*=first]):not([name*=last])")
    for inp in inputs:
        try:
            val = await inp.input_value()
            nm  = await inp.get_attribute("name") or ""
            ph  = await inp.get_attribute("placeholder") or ""
            if not val:
                print(f"  Champ vide: name={nm!r} ph={ph!r}")
        except:
            pass


if __name__ == "__main__":
    asyncio.run(run())
