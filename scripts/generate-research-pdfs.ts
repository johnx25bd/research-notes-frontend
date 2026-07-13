#!/usr/bin/env tsx
/*
 * Generate print-ready academic PDFs for research notes that opt in with
 * `pdf: true` in their frontmatter. Each note is rendered — reusing the same
 * markdown pipeline as the web post — to public/research/<slug>.pdf, served at
 * /research/<slug>.pdf alongside the web version.
 *
 * Opt-in, not opt-out: a note gets a PDF only when it asks for one. Runs in the
 * local publish flow (wired into scripts/sync-vault.sh) and via `pnpm
 * generate:pdfs`; the resulting PDFs are committed, so the Vercel build just
 * serves them as static files and never needs a browser.
 *
 * Rendering is content-hash cached (public/research/.pdf-manifest.json): a note
 * whose source and styling are unchanged is skipped. Pass --force to rebuild
 * all, or one or more slugs to restrict the run.
 */
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getAllNotes, getAllResearch, type Note } from '../lib/vault';
import { containsMDX } from '../lib/markdown';
import { buildPrintHtml, renderPdf } from './research-pdf/render';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'research');
const MANIFEST = path.join(OUT_DIR, '.pdf-manifest.json');
const PRINT_CSS = path.join(__dirname, 'research-pdf', 'print.css');

// Bump when the HTML template or render logic changes in a way that should
// invalidate cached PDFs (styling changes are picked up via the CSS hash).
const TEMPLATE_VERSION = '1';

type Manifest = Record<string, string>;

async function readManifest(): Promise<Manifest> {
  try {
    return JSON.parse(await fs.readFile(MANIFEST, 'utf-8')) as Manifest;
  } catch {
    return {};
  }
}

// A note's PDF is a pure function of its body, the frontmatter shown in the PDF,
// the stylesheet, and the template version. Hash all four so a change to any
// one triggers a rebuild and nothing else does.
function contentHash(note: Note, cssHash: string): string {
  const h = crypto.createHash('sha256');
  h.update(TEMPLATE_VERSION);
  h.update(cssHash);
  h.update(note.content);
  h.update(JSON.stringify({ title: note.title, summary: note.summary, author: note.author }));
  return h.digest('hex');
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const slugFilter = new Set(args.filter((a) => !a.startsWith('--')));

  const [research, notes, cssRaw] = await Promise.all([
    getAllResearch(),
    getAllNotes(),
    fs.readFile(PRINT_CSS, 'utf-8'),
  ]);
  const cssHash = crypto.createHash('sha256').update(cssRaw).digest('hex');

  // Wikilink resolution spans both areas, mirroring the web page.
  const linkTargets = [...notes, ...research].map((n) => ({ slug: n.slug, area: n.area }));

  const manifest = await readManifest();

  // Opt-in gate: published research notes that asked for a PDF.
  let targets = research.filter((n) => n.pdf === true);
  if (slugFilter.size > 0) {
    targets = targets.filter((n) => slugFilter.has(n.slug));
  }

  if (targets.length === 0) {
    console.log('📄 No research notes opted into PDF export (pdf: true). Nothing to do.');
    return;
  }

  console.log(`📄 Generating research PDFs (${targets.length} opted in)…\n`);

  let built = 0;
  let skipped = 0;
  const seen = new Set<string>();

  for (const note of targets) {
    seen.add(note.slug);

    // A React-component note has no faithful paper form — skip loudly.
    if (containsMDX(note.content)) {
      console.warn(`  ⚠️  ${note.slug}: contains MDX/React components — skipped (no paper form).`);
      continue;
    }

    const outPath = path.join(OUT_DIR, `${note.slug}.pdf`);
    const hash = contentHash(note, cssHash);
    let exists = false;
    try {
      await fs.access(outPath);
      exists = true;
    } catch {
      exists = false;
    }

    if (!force && exists && manifest[note.slug] === hash) {
      console.log(`  ⏭  ${note.slug}: unchanged — skipped.`);
      skipped++;
      continue;
    }

    process.stdout.write(`  🖨  ${note.slug}: rendering… `);
    const html = await buildPrintHtml(note, linkTargets);
    await renderPdf(html, outPath);
    manifest[note.slug] = hash;
    built++;
    const { size } = await fs.stat(outPath);
    console.log(`done (${Math.round(size / 1024)} KB).`);
  }

  // Prune manifest entries for notes that no longer opt in (leave the PDF files
  // themselves — removing committed files is a deliberate, separate action).
  for (const slug of Object.keys(manifest)) {
    if (!research.some((n) => n.slug === slug && n.pdf === true)) {
      delete manifest[slug];
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n✅ Research PDFs: ${built} built, ${skipped} unchanged.`);
}

main().catch((err) => {
  console.error('\n❌ PDF generation failed:', err);
  process.exit(1);
});
