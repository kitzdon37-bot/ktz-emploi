# -*- coding: utf-8 -*-
import asyncio, sys
from playwright.async_api import async_playwright

async def explorer():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page = await browser.new_page(ignore_https_errors=True)
        await page.goto("https://application.fuze.digital-africa.co/sign-in", timeout=30000)
        await page.wait_for_timeout(4000)
        await page.fill("input[name=email]",    "kitzdon37@gmail.com")
        await page.fill("input[name=password]", "Fuze@KTZ2026!")
        for b in await page.query_selector_all("button"):
            if "login" in (await b.inner_text()).lower():
                await b.click(); break
        await page.wait_for_timeout(7000)

        # Recup tous les champs
        inputs = await page.query_selector_all("input:not([type=hidden]), textarea")
        lines = [f"=== {len(inputs)} champs ==="]
        for el in inputs:
            t   = await el.get_attribute("type") or "textarea"
            ph  = await el.get_attribute("placeholder") or ""
            nm  = await el.get_attribute("name") or ""
            val = await el.input_value() or ""
            aria= await el.get_attribute("aria-label") or ""
            lines.append(f"  [{t}] name={nm!r} ph={ph!r} aria={aria!r} val={val[:20]!r}")

        # Recup tous les labels visibles
        labels = await page.query_selector_all("label, p, h4, h3, h2, h6, [class*='label'], [class*='title'], [class*='question']")
        lines.append(f"\n=== Labels ({len(labels)}) ===")
        seen = set()
        for lb in labels:
            txt = (await lb.inner_text()).strip()
            if txt and txt not in seen and 2 < len(txt) < 200:
                seen.add(txt)
                lines.append(f"  {txt[:120]}")

        sys.stdout.buffer.write(("\n".join(lines) + "\n").encode("utf-8", "replace"))
        await page.screenshot(path="fuze_form_inspect.png", full_page=True)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(explorer())
