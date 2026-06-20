const { chromium } = require('playwright');

const DNS_RECORDS = [
  { type: 'TXT', host: 'resend._domainkey', value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRAEu85WW6wTbeWO2WkGVr3sBYoUA6+z0XpWmqa1aM9R38zZyGUrQmAXYpKtZ+BhXd4gbxr1JCPxuheNN/ZS74j1LpMjMKtlcUOPIVrk4B6ORYt9snoi0vzd8I5b8JT5PuxL4+z+3g2YVaaOaTQ7dl2eTfTgP0Pih1OKDvDQI80QIDAQAB' },
  { type: 'MX',  host: 'send', value: 'feedback-smtp.us-east-1.amazonses.com', priority: 10 },
  { type: 'TXT', host: 'send', value: 'v=spf1 include:amazonses.com ~all' },
];

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const page = await browser.newPage();

  // Connexion IONOS
  console.log('Connexion à IONOS...');
  await page.goto('https://login.ionos.fr/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'scripts/ionos-1-login.png' });

  // Accepter les cookies via JavaScript pour contourner l'interception du modal
  const cookieDismissed = await page.evaluate(() => {
    // Chercher tous les boutons dans le modal de cookies
    const modal = document.querySelector('.privacy-consent--modal, [class*="privacy-consent"]');
    if (modal) {
      const buttons = modal.querySelectorAll('button');
      for (const btn of buttons) {
        // Cliquer sur le premier bouton visible (Accepter)
        if (btn.offsetParent !== null) {
          btn.click();
          return true;
        }
      }
    }
    // Fallback: chercher globalement les boutons d'acceptation de cookies
    const allBtns = document.querySelectorAll('button');
    for (const btn of allBtns) {
      const txt = btn.textContent.trim().toLowerCase();
      if (txt === 'accepter' || txt === 'accept' || txt === 'tout accepter' || txt === 'agree') {
        btn.click();
        return true;
      }
    }
    return false;
  });
  if (cookieDismissed) {
    await page.waitForTimeout(2000);
    console.log('Cookie modal fermé via JS');
  } else {
    console.log('Pas de modal de cookies détecté');
  }
  // Attendre que le modal disparaisse
  await page.waitForSelector('.privacy-consent--modal', { state: 'hidden', timeout: 5000 }).catch(() => {});

  // Remplir identifiant
  const userInput = page.locator('input[name="username"], input[name="login"], input[type="text"], input[type="email"]').first();
  await userInput.fill('ktzemploi.com');
  await page.waitForTimeout(500);

  // Cliquer sur Suivant si nécessaire
  const nextBtn = page.locator('button:has-text("Suivant"), button:has-text("Next"), button:has-text("Continuer")').first();
  if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nextBtn.click({ force: true });
    await page.waitForTimeout(1500);
  }

  // Remplir mot de passe - attendre que le champ visible apparaisse
  const passInput = page.locator('input[type="password"]:visible, input[type="password"]:not(.hidden)').first();
  await passInput.waitFor({ state: 'visible', timeout: 15000 });
  await passInput.fill('Don@ld26081996!!!###');
  await page.waitForTimeout(500);

  // Soumettre
  const loginBtn = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Login"), button:has-text("Se connecter")').first();
  await loginBtn.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'scripts/ionos-2-after-login.png' });
  console.log('URL après login:', page.url());

  // Naviguer vers domaines
  await page.goto('https://my.ionos.fr/domains', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/ionos-3-domains.png', fullPage: true });
  console.log('Page domaines:', page.url());

  // Chercher ktzemploi.com et cliquer sur DNS
  const domainRow = page.locator('tr:has-text("ktzemploi.com"), li:has-text("ktzemploi.com"), div:has-text("ktzemploi.com")').first();
  if (await domainRow.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Domaine trouvé');

    // Chercher bouton/lien DNS
    const dnsBtn = page.locator('a[href*="dns"]:near(:text("ktzemploi.com")), button:has-text("DNS")').first();
    if (await dnsBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dnsBtn.click();
    } else {
      // Cliquer sur le domaine lui-même
      await domainRow.click();
      await page.waitForTimeout(1500);
      const dnsTab = page.locator('a:has-text("DNS"), button:has-text("DNS"), [href*="dns"]').first();
      if (await dnsTab.isVisible({ timeout: 3000 }).catch(() => false)) await dnsTab.click();
    }
  } else {
    // Essai URL directe DNS
    await page.goto('https://my.ionos.fr/dns-settings', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/ionos-4-dns.png', fullPage: true });
  console.log('Page DNS:', page.url());

  // Ajouter les 3 enregistrements
  for (const record of DNS_RECORDS) {
    console.log(`\nAjout ${record.type} - ${record.host}...`);

    // Chercher bouton Ajouter
    const addBtn = page.locator([
      'button:has-text("Ajouter un enregistrement")',
      'button:has-text("Ajouter")',
      'button:has-text("Add record")',
      'button:has-text("Add")',
      'a:has-text("Ajouter")',
    ].join(', ')).first();

    if (!await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  ❌ Bouton Ajouter non trouvé');
      await page.screenshot({ path: `scripts/ionos-no-add.png`, fullPage: true });
      break;
    }

    await addBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `scripts/ionos-5-form-${record.type}.png` });

    // Type d'enregistrement
    const typeSelect = page.locator('select').first();
    if (await typeSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeSelect.selectOption(record.type);
    } else {
      const typeDropdown = page.locator('[role="combobox"], [role="button"]').first();
      if (await typeDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await typeDropdown.click();
        await page.waitForTimeout(500);
        await page.locator(`[role="option"]:has-text("${record.type}")`).first().click();
      }
    }
    await page.waitForTimeout(500);

    // Remplir les champs
    const inputs = await page.locator('input:visible, textarea:visible').all();
    for (const inp of inputs) {
      const attrs = [
        await inp.getAttribute('name') || '',
        await inp.getAttribute('placeholder') || '',
        await inp.getAttribute('id') || '',
        await inp.getAttribute('aria-label') || '',
      ].join(' ').toLowerCase();

      if (attrs.match(/host|préfixe|prefix|sous-domaine|subdomain|nom/)) {
        await inp.fill(record.host);
      } else if (attrs.match(/value|valeur|content|données|destination|cible|target|adresse/)) {
        await inp.fill(record.value);
      } else if (attrs.match(/prio|priority/)) {
        await inp.fill(String(record.priority || 10));
      }
    }

    await page.screenshot({ path: `scripts/ionos-6-filled-${record.type}.png` });

    // Sauvegarder
    const saveBtn = page.locator([
      'button[type="submit"]',
      'button:has-text("Sauvegarder")',
      'button:has-text("Save")',
      'button:has-text("Enregistrer")',
      'button:has-text("OK")',
    ].join(', ')).first();
    await saveBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `scripts/ionos-7-saved-${record.type}.png` });
    console.log(`  ✅ ${record.type} ${record.host} ajouté`);
  }

  await page.screenshot({ path: 'scripts/ionos-8-final.png', fullPage: true });
  console.log('\n✅ Terminé ! Fermeture dans 5s...');
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
