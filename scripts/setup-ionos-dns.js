const { chromium } = require('playwright');

const DNS_RECORDS = [
  { type: 'TXT', host: 'resend._domainkey', value: 'p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDRAEu85WW6wTbeWO2WkGVr3sBYoUA6+z0XpWmqa1aM9R38zZyGUrQmAXYpKtZ+BhXd4gbxr1JCPxuheNN/ZS74j1LpMjMKtlcUOPIVrk4B6ORYt9snoi0vzd8I5b8JT5PuxL4+z+3g2YVaaOaTQ7dl2eTfTgP0Pih1OKDvDQI80QIDAQAB', ttl: 3600 },
  { type: 'MX',  host: 'send',              value: 'feedback-smtp.us-east-1.amazonses.com', priority: 10, ttl: 3600 },
  { type: 'TXT', host: 'send',              value: 'v=spf1 include:amazonses.com ~all', ttl: 3600 },
];

async function addRecord(page, record) {
  console.log(`\nAjout ${record.type}: ${record.host} ...`);

  // Chercher le bouton d'ajout
  const addSelectors = [
    'button:has-text("Ajouter un enregistrement")',
    'button:has-text("Add record")',
    'button:has-text("Ajouter")',
    'button:has-text("Add")',
    '[data-testid*="add"]',
    'a:has-text("Ajouter")',
  ];

  let addBtn = null;
  for (const sel of addSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) { addBtn = btn; break; }
  }

  if (!addBtn) {
    console.log('  Bouton ajout non trouvé, screenshot...');
    await page.screenshot({ path: `scripts/ionos-no-add-btn.png`, fullPage: true });
    return false;
  }

  await addBtn.click();
  await page.waitForTimeout(1500);

  // Sélectionner le type d'enregistrement
  const typeSelectors = ['select', '[role="combobox"]', '[role="listbox"]'];
  for (const sel of typeSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
      await el.selectOption({ value: record.type }).catch(() => el.selectOption({ label: record.type }));
      break;
    }
  }
  await page.waitForTimeout(500);

  // Remplir les champs
  const inputs = await page.locator('input:visible, textarea:visible').all();
  for (const input of inputs) {
    const name = await input.getAttribute('name') || await input.getAttribute('placeholder') || '';
    const label = name.toLowerCase();
    if (label.includes('host') || label.includes('préfixe') || label.includes('prefix') || label.includes('subdomain')) {
      await input.fill(record.host);
    } else if (label.includes('value') || label.includes('valeur') || label.includes('content')) {
      await input.fill(record.value);
    } else if (label.includes('prio') || label.includes('priority')) {
      await input.fill(String(record.priority || 10));
    } else if (label.includes('ttl')) {
      await input.fill(String(record.ttl || 3600));
    }
  }

  await page.screenshot({ path: `scripts/ionos-form-${record.type}-${record.host.replace(/\./g,'_')}.png` });

  // Valider
  const saveSelectors = ['button[type="submit"]', 'button:has-text("Sauvegarder")', 'button:has-text("Save")', 'button:has-text("OK")', 'button:has-text("Confirmer")'];
  for (const sel of saveSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) { await btn.click(); break; }
  }

  await page.waitForTimeout(2000);
  console.log(`  ✓ ${record.type} ajouté`);
  return true;
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 700 });
  const page = await browser.newPage();

  // Essayer plusieurs URLs IONOS
  const ionosUrls = [
    'https://my.ionos.fr/domains',
    'https://my.ionos.com/domains',
    'https://account.ionos.fr',
  ];

  let logged = false;
  for (const url of ionosUrls) {
    console.log('Essai:', url);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('URL actuelle:', currentUrl);
    if (!currentUrl.includes('login') && !currentUrl.includes('signin') && !currentUrl.includes('404')) {
      logged = true;
      break;
    }
  }

  if (!logged) {
    console.log('\nNon connecté. En attente de connexion manuelle (120s)...');
    console.log('Connectez-vous à votre compte IONOS dans la fenêtre du navigateur.');
    await page.waitForURL(/my\.ionos\.(fr|com)\/(?!.*login)/, { timeout: 120000 }).catch(() => {});
  }

  await page.screenshot({ path: 'scripts/ionos-logged.png', fullPage: true });
  console.log('URL connecté:', page.url());

  // Chercher ktzemploi.com dans la liste des domaines
  const domainLink = page.locator('text=ktzemploi.com').first();
  if (await domainLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Domaine trouvé, clic...');
    await domainLink.click();
    await page.waitForTimeout(2000);
  }

  // Chercher l'onglet DNS
  const dnsTab = page.locator('a:has-text("DNS"), button:has-text("DNS"), [href*="dns"]').first();
  if (await dnsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await dnsTab.click();
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'scripts/ionos-dns.png', fullPage: true });
  console.log('Page DNS:', page.url());

  // Ajouter les 3 enregistrements
  for (const record of DNS_RECORDS) {
    const ok = await addRecord(page, record);
    if (!ok) {
      console.log('Arrêt - impossible de continuer sans le bouton Ajouter');
      break;
    }
  }

  await page.screenshot({ path: 'scripts/ionos-done.png', fullPage: true });
  console.log('\nFermeture dans 5s...');
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
