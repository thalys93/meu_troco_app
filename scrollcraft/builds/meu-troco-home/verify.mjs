import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, 'lab');
mkdirSync(out, { recursive: true });

const url = process.env.MT_URL || 'http://127.0.0.1:8080/';
const edge =
  process.env.SCROLLCRAFT_CHROME ||
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function shot(page, name) {
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: false });
}

async function run({ width, height, reduced, label }) {
  const browser = await chromium.launch({
    executablePath: edge,
    headless: true,
    args: ['--disable-pointer-lock'],
  });
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);

  const hasStyle = await page.evaluate(() => Boolean(document.getElementById('mt-scrollcraft-style')));
  const hasReceipt = await page.locator('.mt-receipt').count();
  const hasHero = await page.locator('#hero').count();
  const cta = page.getByRole('button', { name: /Criar conta grátis|Create free account|Crear cuenta gratis/i }).first();
  await cta.waitFor({ state: 'visible', timeout: 10000 });

  await shot(page, `${label}-01-hero`);

  for (const id of ['problema', 'virada', 'produto', 'faq']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, `${label}-02-${id}`);
  }

  // stamp check after scrolling peak
  const stamped = await page.evaluate(() =>
    [...document.querySelectorAll('.mt-receipt__row[data-stamped="true"]')].map((el) =>
      el.textContent?.trim()
    )
  );

  // navigate CTA
  await Promise.all([
    page.waitForURL(/oauth\/register/, { timeout: 15000 }).catch(() => null),
    cta.click(),
  ]);
  const onRegister = page.url().includes('oauth/register');

  // CSS leak check: leave landing
  await page.goto(url.replace(/\/$/, '') + '/oauth/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const leaked = await page.evaluate(() => Boolean(document.getElementById('mt-scrollcraft-style')));

  await browser.close();
  return {
    label,
    hasStyle,
    hasReceipt,
    hasHero,
    stampedCount: stamped.length,
    onRegister,
    leaked,
    errors,
  };
}

const results = [];
results.push(await run({ width: 1440, height: 900, reduced: false, label: 'desktop' }));
results.push(await run({ width: 390, height: 844, reduced: false, label: 'mobile' }));
results.push(await run({ width: 1440, height: 900, reduced: true, label: 'reduced' }));

console.log(JSON.stringify(results, null, 2));
const bad = results.some((r) => !r.hasStyle || !r.hasReceipt || !r.hasHero || r.leaked || r.errors.length);
process.exit(bad ? 1 : 0);
