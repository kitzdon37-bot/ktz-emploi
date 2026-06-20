const { chromium } = require('playwright');

// Utilise Guerrilla Mail API pour créer un email temporaire
async function getTempEmail() {
  const res = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
  const data = await res.json();
  return { email: data.email_addr, token: data.sid_token };
}

async function checkInbox(token, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${token}`);
    const data = await res.json();
    if (data.list && data.list.length > 0) return data.list[0];
    await new Promise(r => setTimeout(r, 3000));
  }
  return null;
}

async function getEmailContent(token, mailId) {
  const res = await fetch(`https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mailId}&sid_token=${token}`);
  return res.json();
}

async function main() {
  console.log('Création email temporaire...');
  const { email, token } = await getTempEmail();
  console.log('Email temp:', email);

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  // Inscription Resend
  console.log('\nInscription sur Resend...');
  await page.goto('https://resend.com/signup', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  // Remplir le formulaire d'inscription
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
  const passInput = page.locator('input[type="password"], input[name="password"]').first();

  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill(email);
    await page.waitForTimeout(300);

    if (await passInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await passInput.fill('KtzEmploi2026!');
      await page.waitForTimeout(300);
    }

    // Chercher un champ nom si présent
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('KTZ Emploi');
    }

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/signup.png' });
    console.log('Formulaire soumis. URL:', page.url());
  } else {
    console.log('Formulaire non trouvé. URL:', page.url());
    await page.screenshot({ path: 'scripts/signup-debug.png' });
  }

  // Attendre l'email de vérification
  console.log('En attente du mail de vérification...');
  const mail = await checkInbox(token, 90000);
  if (!mail) { console.log('Mail non reçu'); await browser.close(); return; }

  console.log('Mail reçu:', mail.mail_subject);
  const mailContent = await getEmailContent(token, mail.mail_id);

  // Extraire le lien de vérification
  const verifyLink = (mailContent.mail_body || '').match(/https?:\/\/[^\s"<>]+verify[^\s"<>]*/i)?.[0]
    || (mailContent.mail_body || '').match(/https?:\/\/[^\s"<>]+confirm[^\s"<>]*/i)?.[0];

  if (verifyLink) {
    console.log('Lien vérification trouvé, clic...');
    await page.goto(verifyLink, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    console.log('URL après vérif:', page.url());
  }

  // Attendre d'être connecté
  await page.waitForURL(/resend\.com\/(overview|emails|domains|api-keys|dashboard)/, { timeout: 30000 }).catch(() => {});

  // Créer clé API
  console.log('\n--- Clé API ---');
  await page.goto('https://resend.com/api-keys', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const createBtn = page.locator('button').filter({ hasText: /create api key|add api key/i }).first();
  if (await createBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await createBtn.click();
    await page.waitForTimeout(1500);

    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill('ktz-emploi-production');
    }

    const fullAccess = page.locator('button, label, div').filter({ hasText: /full access/i }).first();
    if (await fullAccess.isVisible({ timeout: 2000 }).catch(() => false)) await fullAccess.click();

    const addBtn = page.locator('button[type="submit"]').first();
    await addBtn.click();
    await page.waitForTimeout(2500);

    const keyEl = page.locator('code, input[readonly]').first();
    const newKey = await keyEl.inputValue().catch(() => null) || await keyEl.textContent().catch(() => null);
    if (newKey && newKey.startsWith('re_')) {
      console.log('NOUVELLE_CLE_API=' + newKey.trim());
      require('fs').writeFileSync('scripts/new-api-key.txt', newKey.trim());
    }
    await page.screenshot({ path: 'scripts/api-key-created.png' });
  }

  // Ajouter domaine
  console.log('\n--- Domaine ---');
  await page.goto('https://resend.com/domains', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const addDomBtn = page.locator('button').filter({ hasText: /add domain/i }).first();
  if (await addDomBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await addDomBtn.click();
    await page.waitForTimeout(1500);

    const domInput = page.locator('input').first();
    await domInput.fill('ktzemploi.com');
    await page.waitForTimeout(300);

    const submitDom = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /^add$/i })).first();
    await submitDom.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/domain-added.png', fullPage: true });
    console.log('URL après ajout domaine:', page.url());
  }

  // Extraire les DNS records
  await page.waitForTimeout(2000);
  const rows = await page.locator('tr').all();
  const dnsData = [];
  for (const row of rows) {
    const cells = await row.locator('td').allTextContents();
    if (cells.length >= 2 && (cells.join(' ').includes('TXT') || cells.join(' ').includes('MX') || cells.join(' ').includes('CNAME'))) {
      dnsData.push(cells.map(c => c.trim()));
      console.log('DNS:', cells.map(c => c.trim()).join(' | '));
    }
  }

  require('fs').writeFileSync('scripts/dns-records.json', JSON.stringify(dnsData, null, 2));
  await page.screenshot({ path: 'scripts/dns-records.png', fullPage: true });

  console.log('\nTerminé!');
  await page.waitForTimeout(5000);
  await browser.close();
}

main().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
