import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import puppeteer from 'puppeteer-core';
import type { Note } from '../../lib/vault';
import { processMarkdown } from '../../lib/markdown';

// Default byline when a note omits `author:` — the site is single-author today.
const DEFAULT_AUTHOR = 'John Robison Hoopes';

const ROOT = process.cwd();
const KATEX_DIST = path.join(ROOT, 'node_modules', 'katex', 'dist');
const KATEX_FONTS = path.join(KATEX_DIST, 'fonts');
const PAGED_POLYFILL = path.join(
  ROOT,
  'node_modules',
  'pagedjs',
  'dist',
  'paged.polyfill.js'
);
const PRINT_CSS = path.join(__dirname, 'print.css');
const PUBLIC_DIR = path.join(ROOT, 'public');

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Locate a Chrome/Chromium executable. puppeteer-core bundles nothing, so the
// PDF build reuses a browser already on the machine — an explicit override, the
// system Chrome, or the puppeteer download cache. Keeping this to puppeteer-core
// means `pnpm install` on Vercel never downloads Chromium and the deploy build
// is untouched (PDFs are generated locally and committed).
async function findChrome(): Promise<string> {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      // Must be an actual executable file, not a directory — a bare cache dir
      // would satisfy access() but fail launch with a confusing error.
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

// Inline KaTeX's stylesheet with its font URLs rewritten to absolute file://
// paths, so math glyphs resolve when the page is loaded via setContent (no
// server, no relative base).
async function katexStyles(): Promise<string> {
  const css = await fs.readFile(
    path.join(KATEX_DIST, 'katex.min.css'),
    'utf-8'
  );
  const fontsUrl = pathToFileURL(KATEX_FONTS).href;
  return css.replace(/url\(fonts\//g, `url(${fontsUrl}/`);
}

// The print stylesheet, with the __ASSET__ token pointed at the KaTeX fonts
// directory (KaTeX_Main doubles as the Computer Modern body face).
async function printStyles(): Promise<string> {
  const css = await fs.readFile(PRINT_CSS, 'utf-8');
  return css.replace(/__ASSET__/g, pathToFileURL(KATEX_FONTS).href);
}

// Rewrite root-absolute public asset references (e.g. /attachments/foo.svg) to
// absolute file:// URLs so figures resolve without a running server.
function resolveAssets(html: string): string {
  const publicUrl = pathToFileURL(PUBLIC_DIR).href;
  return html.replace(/(src|href)="\/(attachments|research|cv)\//g, (_m, attr, dir) =>
    `${attr}="${publicUrl}/${dir}/`
  );
}

// Assemble the full print HTML document: title block from frontmatter, body
// from the shared markdown pipeline (footnoteStyle: 'print').
export async function buildPrintHtml(
  note: Note,
  linkTargets: { slug: string; area: 'notes' | 'research' }[]
): Promise<string> {
  const bodyHtml = resolveAssets(
    await processMarkdown(note.content, linkTargets, 'research', {
      footnoteStyle: 'print',
    })
  );

  const [katexCss, printCss] = await Promise.all([katexStyles(), printStyles()]);

  const subtitle = note.summary
    ? `<p class="pdf-subtitle">${escapeHtml(note.summary)}</p>`
    : '';
  const author = escapeHtml(note.author || DEFAULT_AUTHOR);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(note.title)}</title>
<style>${katexCss}</style>
<style>${printCss}</style>
</head>
<body>
<article class="research-pdf">
  <header class="pdf-titleblock">
    <h1 class="pdf-title">${escapeHtml(note.title)}</h1>
    ${subtitle}
    <p class="pdf-author">${author}</p>
  </header>
  <div class="research-pdf-content">
${bodyHtml}
  </div>
</article>
</body>
</html>`;
}

// Number the top-level sections (h2) and mark the unnumbered ones. The number
// is baked into the DOM as a text node *before* Paged.js paginates — CSS
// counters drift across Paged.js page fragments, so we compute them here where
// the whole document is still one flow.
//
// Only h2 sections are auto-numbered. The Abstract is inside
// <section class="abstract"> (not a direct child, so it is skipped);
// References / Acknowledgments are named-unnumbered; and h3 subsections are left
// exactly as authored — some are deliberately hand-numbered content (a 1–7
// lifecycle), which auto-numbering would double up.
const TAG_HEADINGS = `
(() => {
  const UNNUMBERED = new Set([
    'references', 'reference', 'bibliography',
    'acknowledgments', 'acknowledgements', 'notes',
  ]);
  const content = document.querySelector('.research-pdf-content');
  if (!content) return;
  let section = 0;
  for (const h of content.querySelectorAll(':scope > h2')) {
    const text = (h.textContent || '').trim().toLowerCase();
    if (UNNUMBERED.has(text)) {
      h.classList.add('unnumbered');
      const sib = h.nextElementSibling;
      if (sib && (sib.tagName === 'UL' || sib.tagName === 'OL')) {
        sib.classList.add('references-list');
      }
    } else {
      section += 1;
      h.insertBefore(document.createTextNode(section + '. '), h.firstChild);
    }
  }
})();
`;

// Render an assembled print-HTML document to a PDF file with Paged.js driving
// pagination (running footer, section counters, page-foot footnotes) inside
// headless Chromium.
export async function renderPdf(html: string, outPath: string): Promise<void> {
  const executablePath = await findChrome();
  const pagedPolyfill = await fs.readFile(PAGED_POLYFILL, 'utf-8');

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(TAG_HEADINGS);
    // Disable Paged.js auto-run so we can await pagination deterministically.
    await page.evaluate(() => {
      (window as unknown as { PagedConfig: unknown }).PagedConfig = {
        auto: false,
      };
    });
    await page.addScriptTag({ content: pagedPolyfill });
    await page.evaluate(async () => {
      const polyfill = (
        window as unknown as {
          PagedPolyfill: { preview: () => Promise<{ total: number }> };
        }
      ).PagedPolyfill;
      await polyfill.preview();
    });
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await page.pdf({
      path: outPath,
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}
