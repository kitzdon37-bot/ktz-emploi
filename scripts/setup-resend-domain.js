const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

async function main() {
  // Réutiliser le profil Chrome existant pour avoir les sessions sauvegardées
  const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');

  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 600,
    channel: 'chrome',
    args: ['--no-first-run', '--no-default-browser-check'],
  });

  const page = await browser.newPage();

  console.log('Ouverture de Resend avec profil Chrome...');
  await page.goto('https://resend.com/overview', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  console.log('URL actuelle:', currentUrl);

  // Si pas connecté, aller sur login
  if (currentUrl.includes('login') || currentUrl.includes('signin')) {
    console.log('Non connecté, tentative connexion...');
    await page.goto('https://resend.com/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Essayer le bouton Google
    const googleBtn = page.locator('button, a').filter({ hasText: /google/i }).first();
    if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await googleBtn.click();
      console.log('Veuillez vous connecter manuellement dans le navigateur...');
      await page.waitForURL(/resend\.com\/(overview|emails|domains|api-keys)/, { timeout: 120000 });
    }
  }

  console.log('Connecté! URL:', page.url());

  // === ÉTAPE 1: Créer une clé API complète ===
  console.log('\n--- Clé API ---');
  await page.goto('https://resend.com/api-keys', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/step1-apikeys.png' });

  const createBtn = page.locator('button').filter({ hasText: /create api key|add api key/i }).first();
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1500);

    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('ktz-emploi-full');
      await page.waitForTimeout(300);
    }

    // Full access
    const fullAccess = page.locator('button, label, div').filter({ hasText: /full access/i }).first();
    if (await fullAccess.isVisible({ timeout: 2000 }).catch(() => false)) await fullAccess.click();

    const addBtn = page.locator('button[type="submit"]').first();
    await addBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: 'scripts/step1-newkey.png' });

    // Récupérer la clé
    const keyEl = await page.locator('code, input[readonly]').first();
    const keyVal = await keyEl.inputValue().catch(() => null) || await keyEl.textContent().catch(() => null);
    if (keyVal && keyVal.startsWith('re_')) {
      console.log('NOUVELLE_CLE_API=' + keyVal.trim());
    }
  }

  // === ÉTAPE 2: Ajouter le domaine ===
  console.log('\n--- Domaine ktzemploi.com ---');
  await page.goto('https://resend.com/domains', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'scripts/step2-domains.png' });

  const alreadyExists = await page.locator('text=ktzemploi.com').isVisible({ timeout: 3000 }).catch(() => false);

  if (!alreadyExists) {
    const addBtn = page.locator('button').filter({ hasText: /add domain/i }).first();
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1500);

      const domInput = page.locator('input').first();
      await domInput.fill('ktzemploi.com');
      await page.waitForTimeout(300);

      const submitBtn = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /^add$/i })).first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'scripts/step2-added.png' });
    }
  } else {
    console.log('Domaine déjà existant, clic pour voir les DNS...');
    await page.locator('text=ktzemploi.com').first().click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'scripts/step2-dns.png', fullPage: true });

  // Extraire les DNS records
  const rows = await page.locator('tr').all();
  const dnsRecords = [];
  for (const row of rows) {
    const text = await row.textContent().catch(() => '');
    if (text && (text.includes('TXT') || text.includes('MX') || text.includes('CNAME') || text.includes('resend') || text.includes('spf'))) {
      dnsRecords.push(text.trim().replace(/\s+/g, '|'));
      console.log('DNS:', text.trim().replace(/\s+/g, ' ').slice(0, 300));
    }
  }

  // Sauvegarder les DNS records dans un fichier
  require('fs').writeFileSync('scripts/dns-records.json', JSON.stringify(dnsRecords, null, 2));
  console.log('DNS records sauvegardés dans scripts/dns-records.json');

  console.log('\nFermeture dans 5s...');
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(async e => {
  console.error('ERREUR:', e.message);
  process.exit(1);
});
