# -*- coding: utf-8 -*-
import asyncio
from playwright.async_api import async_playwright

EMAIL    = "kitzdon37@gmail.com"
PASSWORD = "Fuze@KTZ2026!"

async def run():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(ignore_https_errors=True)

        await page.goto("https://application.fuze.digital-africa.co/sign-in", timeout=30000)
        await page.wait_for_timeout(4000)
        await page.fill("input[name=email]", EMAIL)
        await page.fill("input[name=password]", PASSWORD)
        for b in await page.query_selector_all("button"):
            if "login" in (await b.inner_text()).lower():
                await b.click(); break
        await page.wait_for_timeout(7000)
        print(f"URL: {page.url}")

        # Explore all div[role=combobox] (MUI Select)
        div_combos = await page.query_selector_all('div[role=combobox]')
        print(f"\n=== div[role=combobox] ({len(div_combos)}) ===")
        for i, c in enumerate(div_combos):
            txt  = (await c.inner_text()).strip()
            aria = await c.get_attribute('aria-controls') or ''
            bb   = await c.bounding_box()
            y    = int(bb['y']) if bb else -1
            print(f"  [{i}] y={y} aria-controls={aria!r} text={txt[:40]!r}")

        # Explore all input[role=combobox] (Autocomplete)
        inp_combos = await page.query_selector_all('input[role=combobox]')
        print(f"\n=== input[role=combobox] ({len(inp_combos)}) ===")
        for i, c in enumerate(inp_combos):
            id_  = await c.get_attribute('id') or ''
            ph   = await c.get_attribute('placeholder') or ''
            val  = await c.input_value() or ''
            bb   = await c.bounding_box()
            y    = int(bb['y']) if bb else -1
            print(f"  [{i}] y={y} id={id_!r} ph={ph!r} val={val[:30]!r}")

        # Try to click the first non-language div[role=combobox]
        # and see what options appear
        print("\n=== Test click country based ===")
        if len(div_combos) > 1:
            target = div_combos[1]  # skip language selector
            bb = await target.bounding_box()
            print(f"Clic sur combo[1] at y={int(bb['y']) if bb else -1}")
            await target.click()
            await page.wait_for_timeout(2000)

            # Check for options in listbox (MUI portal)
            opts_listbox = await page.query_selector_all('ul[role=listbox] li')
            print(f"ul[role=listbox] li: {len(opts_listbox)}")
            for o in opts_listbox[:10]:
                print(f"  - {(await o.inner_text()).strip()[:60]}")

            opts_option = await page.query_selector_all('[role=option]')
            print(f"[role=option]: {len(opts_option)}")
            for o in opts_option[:5]:
                print(f"  - {(await o.inner_text()).strip()[:60]}")

            await page.screenshot(path="fuze_debug_combo.png", full_page=False)
            print("Screenshot debug pris")

            # Press Escape to close
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(500)

        # Try line_of_business
        print("\n=== Test line_of_business ===")
        inp = page.locator("input#line_of_business")
        try:
            await inp.scroll_into_view_if_needed()
            await inp.click()
            await page.wait_for_timeout(1000)
            opts = await page.query_selector_all('[role=option]')
            print(f"Options: {len(opts)}")
            for o in opts[:20]:
                print(f"  - {(await o.inner_text()).strip()}")
            await page.keyboard.press("Escape")
        except Exception as e:
            print(f"line_of_business: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
