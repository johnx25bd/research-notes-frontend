/**
 * Export a reveal.js deck to PDF at true slide size.
 *
 *   node scripts/export-deck-pdf.mjs <url> <out.pdf> [widthPx] [heightPx]
 *
 * Chrome ignores the CSS page size reveal sets, so a plain headless print comes
 * out US Letter portrait with the slides reflowed across it. This sets the
 * paper size explicitly from the deck's slide dimensions instead.
 *
 * Browser handling follows scripts/research-pdf/render.ts: puppeteer-core plus
 * a browser already on the machine, so `pnpm install` on Vercel never downloads
 * Chromium.
 *
 * The deck must already be served over HTTP — a `<base href>` means file://
 * will not resolve its assets — and the URL should carry ?print-pdf.
 *
 *   python3 -m http.server 8771          # from public/
 *   node scripts/export-deck-pdf.mjs \
 *     "http://localhost:8771/presentations/message-house/?print-pdf" \
 *     ~/Desktop/message-house.pdf
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

// Same locator as scripts/research-pdf/render.ts.
async function findChrome() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // keep looking
    }
  }
  throw new Error(
    'No Chrome/Chromium found for PDF rendering. Install Google Chrome or set ' +
      'PUPPETEER_EXECUTABLE_PATH to a browser binary.'
  );
}

const [url, out, width = '1280', height = '720'] = process.argv.slice(2);
if (!url || !out) {
  console.error(
    'usage: node scripts/export-deck-pdf.mjs <url> <out.pdf> [widthPx] [heightPx]'
  );
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath: await findChrome(),
  headless: true,
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(width), height: Number(height) });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });

  // Decks built by public/presentations/message-house/build.js raise this once
  // reveal's print pages exist, webfonts have loaded, and the room fitter has
  // settled. Any other deck just gets the load event plus a short grace.
  await page
    .waitForSelector('html[data-print-ready="1"]', { timeout: 30_000 })
    .catch(() => new Promise((r) => setTimeout(r, 3000)));

  await fs.mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await page.pdf({
    path: out,
    printBackground: true,
    preferCSSPageSize: false,
    width: `${Number(width) / 96}in`,
    height: `${Number(height) / 96}in`,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  console.log(`wrote ${out}`);
} finally {
  await browser.close();
}
