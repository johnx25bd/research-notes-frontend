# Spec: automatic PDF export for research notes

**Status:** proposed — not yet implemented
**Owner:** John
**Related:** PR #91 (the first PDF, produced by hand), `docs/research-pdf-export-reference.typ` (the approved visual target), [NicklasVraa/Obsidian-academic-export](https://github.com/NicklasVraa/Obsidian-academic-export) (the aesthetic reference)

## Goal

When a research note is published, a print-ready academic PDF of it should be generated automatically and served alongside the web post at the same URL with `.pdf` appended — no manual step. Publishing `location-verification-framework` should make both of these live in the same deploy:

- `johnx.co/research/location-verification-framework` — the interactive web post (unchanged)
- `johnx.co/research/location-verification-framework.pdf` — the paper, in the house academic format

This was done once by hand for the location-verification paper (PR #91). This spec describes how to make it happen for every research note, every time, as part of the normal publish flow.

## Why

Research notes are the one area of the garden that read as formal papers — an abstract, numbered sections, equations, footnotes, references. A downloadable PDF in a proper academic layout is what people expect to cite, print, or circulate, and it is tedious to produce by hand. The web post and the PDF should never drift, so the PDF has to be generated from the same source as the post, on the same trigger.

The target look is a LaTeX-compiled paper — Latin Modern / Computer Modern serif, single column, auto-numbered sections, centered small-caps title, footnotes at the foot of the page — the aesthetic the Obsidian academic-export snippet produces. The hand-built reference is committed at `docs/research-pdf-export-reference.typ`; its rendered output is the acceptance bar for "does this look right."

## Requirements

### Functional

1. Every published research note (`content/research/*.md` with `published: true`) gets a PDF at `public/research/<slug>.pdf`, served at `/research/<slug>.pdf`. The `<slug>` must match the web route's slug exactly (same derivation as `lib/vault.ts`).
2. The PDF is regenerated whenever its source markdown (or the shared template/styling) changes, and only then — unchanged notes are not re-rendered on every build.
3. The bare research URL keeps serving the web post; only the `.pdf` suffix resolves to the file. (Already true: Next serves `public/` static files before the dynamic `[slug]` route — precedent is `public/cv/ai-governance.pdf` at `/cv/ai-governance.pdf`.)
4. The PDF's body content matches the post: same prose, math, footnotes, callouts, figures, references. The PDF's *layout* deliberately differs from the web (see "Layout differences" below) — it is a paper, not a screenshot of the page.
5. Content that cannot be faithfully rendered to a paper (notes flagged as MDX / React components — see `containsMDX` in `lib/markdown.ts`) is skipped, with a visible warning in the build log rather than a broken PDF.

### Non-functional

6. Runs automatically in the publish/deploy path with no human step beyond the existing sync-and-push.
7. Does not meaningfully slow the common deploy (a push that changes one note should not re-render all notes). Target: incremental, content-hash cached.
8. Deterministic — the same markdown produces byte-stable-enough PDFs that a "no content change" run is a no-op (important if PDFs are committed; see "Where generation runs").
9. Fonts must be embedded and licensed for redistribution (Latin Modern / New Computer Modern are OFL — fine).

## How things work today (context for a fresh implementer)

- **Authoring → deploy:** notes are written in the Obsidian vault (`/Users/x25bd/notes/research-notes`), synced into the repo with `scripts/sync-vault.sh` (rsync of `content/{notes,research}/` and `public/attachments/`), committed, and pushed. Vercel's git integration builds (`vercel.json` → `pnpm validate && next build`) and deploys. **There are no GitHub Actions**; the only CI is the Vercel build.
- **Content model:** `content/research/*.md`, gray-matter frontmatter parsed in `lib/vault.ts`. Relevant fields: `title`, `summary` (used as the post subtitle), `tags`, `status`, `published` (gate — only `published: true` non-stub notes render), `slug` (optional; otherwise derived from filename). **There is no `author` field yet.**
- **Markdown rendering:** `lib/markdown.ts` `processMarkdown(md, linkTargets, "research")` runs a `unified` pipeline: `remark-parse → remark-gfm → remark-math → remark-wiki-link → remark-rehype → rehype-katex →` (for research: `rehypeSidenotes`, `rehypeAbstract`) `→ rehype-callouts → rehypeImageFigures → rehype-stringify`. It also preprocesses Obsidian-isms: strips `%% comments %%`, unwraps `==highlights==`, normalizes single-line `$$…$$` to display math, and rewrites `![[embeds]]` to `/attachments/…`.
- **Research conventions the pipeline already understands:**
  - `## Abstract` — an h2 literally titled "Abstract" is wrapped as `<section class="abstract">` (`rehypeAbstract`).
  - `$inline$` / `$$display$$` math via KaTeX.
  - GFM footnotes (`[^1]`) — collected, then relocated to Tufte margin **sidenotes** for research (`rehypeSidenotes`).
  - Obsidian callouts `> [!note]` via `rehype-callouts`.
  - `[[wikilinks]]` and `![[image|size]]` embeds.
  - Image figures with an optional bold title line above and a blockquote/italic caption below.
- **Title / subtitle / author placement:** on the web, `title` and `summary` come from **frontmatter** and are rendered as the page header (`app/research/[slug]/page.tsx`); the markdown **body** starts at `## Abstract`. The PDF must follow the same split: title block from frontmatter, body from `## Abstract` onward.

## Layout differences: web post vs. PDF

The PDF is a formal paper and should differ from the web layout in these specific ways (the reference `.typ` shows all of them):

| Element | Web | PDF |
| --- | --- | --- |
| Title | `<h1>` from `title`, left-aligned | Centered, small-caps, ~18pt |
| Subtitle | `summary`, left, muted | Centered, small-caps, ~11pt |
| Author | not shown | Centered byline under the subtitle |
| Sections | unnumbered headings | Auto-numbered `1.`, `1.1.` |
| Abstract | set-apart section | Centered "Abstract" heading, unnumbered, narrower text block |
| Footnotes | margin sidenotes | Numbered footnotes at the foot of the page |
| References | plain `## References` prose | Unnumbered heading, hanging-indent list |
| Callouts | tinted callout blocks | Thin-bordered aside box |
| Running footer | none | `johnx.co/research` (left) + page number (center) |
| Page | fluid web column | A4, 2cm margins, single column |

Note the tension in requirement 4: the *content* is shared, but the *presentation* is not. Whatever engine we pick has to reuse the parsing while applying a print-specific layout. That is the central design constraint and it drives the recommendation below.

## Design options

Three viable architectures. The axis that matters most is **how much of `lib/markdown.ts` we reuse** — every construct we do not reuse (callouts, wikilinks, figures, footnotes, math edge cases) is one we must re-implement and keep from drifting.

### Option A — reuse the unified HTML pipeline → print CSS → PDF via headless Chromium + Paged.js (recommended)

Render each note to HTML with the **existing** `processMarkdown(..., "research")`, then paginate and print it with a headless Chromium (Playwright or Puppeteer) driving [Paged.js], under a dedicated **print stylesheet** that imposes the academic layout.

- **Reuse:** all parsing — math (KaTeX renders perfectly in Chromium), callouts, wikilinks, figures, footnotes. Zero parser duplication.
- **Layout:** pure CSS. `@page` for A4 + margins + running footer; CSS counters for section numbering; Paged.js `float: footnote` (or a small transform) to turn the sidenote `<aside>`s back into page-foot footnotes; Latin Modern webfont for the body; KaTeX's own fonts (which are Computer Modern clones) for math — so body and math read as one typeface. This is exactly the mechanism of the Obsidian academic-export snippet John pointed to, which is a print stylesheet over rendered HTML.
- **Cost:** Chromium is a heavy dependency (~100–170MB via `@sparticuz/chromium` or a Playwright browser). If it runs in the Vercel build, it adds install weight and time. Mitigations: content-hash caching (below), and/or move generation out of the Vercel build into the local `sync-vault.sh` step and **commit** the PDFs (the repo already commits PDFs; this is what PR #91 does by hand).

**Why recommended:** content-parity is the whole point of "deployed with the post," and the repo has already solved every hard markdown-construct once. Reusing that is the correct long-term call even at the cost of a heavier renderer. The layout is achieved the same way the reference tool achieves it.

### Option B — markdown → Typst → PDF (fastest to the approved look)

Feed the note's markdown to a markdown→Typst converter (pandoc's Typst writer via `--pdf-engine=typst`, or a small custom converter) and compile with a Typst template that encodes the house style. The approved reference (`docs/research-pdf-export-reference.typ`) is exactly this template, already signed off — so this is the shortest path to the exact output John approved.

- **Reuse:** none of `lib/markdown.ts`. Typst is a small (~30MB) fast static binary, trivial to fetch in a build step, and its native math/typography is beautiful.
- **Risk:** re-parsing means re-implementing (or accepting pandoc's partial handling of) Obsidian callouts, wikilinks, image figures, the `## Abstract`/sidenote conventions, `%%comments%%`, `==highlights==`, and `$$` normalization. Pandoc does **not** understand Obsidian callouts or wikilinks out of the box. This is real, ongoing drift surface.
- **Mitigation:** extract the Obsidian-normalization helpers from `lib/markdown.ts` (`stripObsidianAnnotations`, `normalizeDisplayMath`, `preprocessObsidianImages`) into a shared module and run them before conversion, so at least the preprocessing is not duplicated. Math converts LaTeX→Typst natively in pandoc.

### Option C — reuse unified HTML → WeasyPrint

Same HTML-reuse as A, but render with WeasyPrint (a Python lib, much lighter than Chromium; good `@page`/counters/CSS-footnote support). **Blocker:** KaTeX's HTML relies on fine positioning that WeasyPrint renders imperfectly. Would require swapping math to MathJax-SVG for the print build (a print-only rehype step / second math renderer). Listed for completeness; not recommended unless avoiding Chromium is a hard constraint and the MathJax-SVG detour is acceptable.

### Recommendation

**Option A**, with generation cached by content hash, and an explicit fallback to "generate locally in the sync step and commit" if Chromium in the Vercel build proves too heavy. **Option B is the pragmatic fast path** and is reasonable for a v1 given the template is already approved — the cost is a parallel parser to maintain. **This engine choice is the key decision to confirm before implementing** (see open questions).

## The chosen pipeline (assuming Option A)

1. **Enumerate.** A build script (`scripts/generate-research-pdfs.ts`, run via `tsx`) loads every published research note through `getAllResearch()` (reusing `lib/vault.ts`), skipping MDX notes (`containsMDX`).
2. **Cache check.** For each note, compute a hash of `{ markdown body, frontmatter used in the PDF, template version, stylesheet version }`. If `public/research/<slug>.pdf` already exists and a sidecar manifest records the same hash, skip. Store hashes in `public/research/.pdf-manifest.json` (or similar).
3. **Render HTML.** Call `processMarkdown(note.content, linkTargets, "research")` to get the body HTML — the *same* function the page uses. Wrap it in a minimal HTML document that includes the title block (from `title`, `summary`, `author`), the KaTeX stylesheet, the Latin Modern webfont, and the print stylesheet.
4. **Paginate + print.** Load that HTML in headless Chromium with Paged.js and print to PDF (A4). Paged.js handles the running footer, page numbers, section counters, and footnote placement.
5. **Write.** Emit `public/research/<slug>.pdf` and update the manifest.
6. **Deploy.** Because the file lands in `public/research/` before `next build`, Next includes it in the deploy automatically.

Hook it in as a `prebuild` step (npm/pnpm runs `prebuild` before `build`) or fold it into the `validate` step, so `vercel.json`'s `pnpm validate && next build` picks it up with no config change. Keep it a separate `pnpm generate:pdfs` script too, for local runs.

## Frontmatter contract changes

Add to research note frontmatter:

- `author` (string, optional) — byline for the PDF. Default to `John Robison Hoopes` if absent (the site is single-author today). The web page can start showing it too, or ignore it.
- `subtitle` (string, optional) — if we want the paper subtitle to differ from the web `summary`. Default: reuse `summary`. (The location-verification paper's subtitle *is* its summary, so this may be unnecessary — decide.)
- `pdf` (boolean, optional, default `true`) — opt-out switch for notes that should not get a PDF (e.g. very short fragments). Alternatively invert to opt-in; decide based on how many research notes are paper-shaped.

No change to the slug logic — reuse `lib/vault.ts` exactly so URLs line up.

## Styling spec (the house academic format)

The acceptance bar is `docs/research-pdf-export-reference.typ`. Whichever engine is used, the print output must reproduce these parameters. (For Option A these become the print stylesheet; for Option B they are already the Typst template.)

- **Page:** A4, 2cm margins, single column.
- **Body:** Latin Modern / New Computer Modern, 10pt, justified; line leading ~1.2; a small inter-paragraph gap (~1.1em); list items kept tight (~0.7em, i.e. *no* extra gap between bullets).
- **Title block (centered):** title ~18pt small-caps; subtitle ~11pt small-caps; author byline ~10pt. (In the reference, the subtitle is manually broken after "for" — that is note-specific hand-tuning, not a general rule.)
- **Abstract:** unnumbered, centered "Abstract" heading; body indented ~2.4em each side so it is visibly narrower than full width.
- **Sections:** auto-numbered, `1.` for sections and `1.1.` for subsections; 12pt bold. Abstract and References are unnumbered, so the numbered run is Introduction (1) … through the last body section.
- **Footnotes:** at the foot of the page, ~8pt, with a short separator rule. (Web sidenotes become page-foot footnotes.)
- **Callouts:** thin-bordered aside box with a bold lead line.
- **References:** unnumbered heading; hanging indent ~1.5em; ~9.5pt.
- **Running footer:** `johnx.co/research` bottom-left, page number bottom-center, ~8pt muted.
- **Acknowledgments (if present):** a thin rule then italic ~9pt, at the end.

## Edge cases and risks

- **MDX notes** (`containsMDX`): skip with a build-log warning. A React-component note has no faithful paper form.
- **Wikilinks in a PDF:** `[[other-note]]` has no clickable destination on paper. Render as plain text, or as text with the absolute `johnx.co/…` URL in a footnote. Decide; plain text is the safe default.
- **Images / SVG:** figures must resolve from `public/attachments/`. Chromium needs a real or file:// base URL so `/attachments/…` resolves during print. SVGs with external refs must be self-contained.
- **Math edge cases:** Option A inherits KaTeX exactly (no divergence). Option B depends on pandoc's LaTeX→Typst coverage — spot-check unusual macros; provide a raw-Typst escape hatch if needed.
- **Build weight / time (Option A):** Chromium size and cold-start. Mitigate with content-hash caching and, if needed, moving generation to the local sync step with committed PDFs.
- **Determinism:** if PDFs are committed, non-deterministic output (timestamps, font subsetting order) creates noisy diffs. Pin the toolchain and, if necessary, post-process to strip volatile metadata.
- **Slug collisions:** a note whose slug ends up as `foo.pdf`-shaped, or two notes with the same slug — reuse `lib/vault.ts` derivation so the PDF and the page always agree, and let the existing publish validation catch dupes.

## Implementation plan (phased)

1. **Decide the engine** (A vs B) and the opt-in/opt-out policy. Blocking; see open questions.
2. **Shared preprocessing / rendering seam.** For A: confirm `processMarkdown` can run outside Next (it is a plain async function — it can). For B: extract the Obsidian-normalization helpers into a shared module.
3. **Template / stylesheet.** Port `docs/research-pdf-export-reference.typ` into the chosen form (print CSS for A; reuse directly for B). Reproduce the styling spec above. Parameterize title/subtitle/author.
4. **Generator script** `scripts/generate-research-pdfs.ts`: enumerate → cache-check → render → write manifest. Add `pnpm generate:pdfs` and wire a `prebuild` hook.
5. **Toolchain in the build.** A: install a headless browser (`@sparticuz/chromium` or a pinned Playwright) available in the Vercel build; or move generation to `sync-vault.sh` + commit. B: fetch the Typst (and pandoc, if used) binary in the build step, cached.
6. **Serve + link.** Confirm `/research/<slug>.pdf` resolves (it does for static `public/` files). Optionally add a "Download PDF" link to `app/research/[slug]/page.tsx` header when `public/research/<slug>.pdf` exists.
7. **Tests.** Use `location-verification-framework` as the golden fixture: assert a PDF is produced, is non-trivial in size, contains expected text (via `pdftotext`), and — ideally — a visual snapshot against the approved reference. Add a unit test that the generator skips MDX and unpublished notes.
8. **Docs.** Update `PUBLISHING.md` / `DEPLOYMENT.md` to note that PDFs are generated automatically, and document the frontmatter additions in `AUTHORING.md`.

## Where generation runs — decision needed

Two shapes, both satisfy "deploys with the post":

- **In the Vercel build** (`prebuild`): PDFs are never committed; always in sync with content; build does the work. Needs the toolchain (Chromium or Typst) available in the build, and caching to stay fast.
- **In the local sync step** (`sync-vault.sh` calls the generator; PDFs are committed): keeps the Vercel build light (just serves static files, as today), matches how PR #91 already works, but puts binary PDFs in git history and depends on the author running the sync step.

Recommendation: start in the **local sync step with committed PDFs** (lowest-risk, mirrors current working state, no Vercel build changes), and move to build-time generation later if committing binaries becomes annoying.

## Open questions for John

1. **Engine:** Option A (reuse HTML + Chromium, best parity) or Option B (Typst, fastest to the already-approved look, but a parallel parser)? This is the main call.
2. **Where it runs:** build-time (no committed PDFs) or local-sync-time (committed PDFs, lighter build)?
3. **Coverage:** every research note by default (opt-out), or only notes that opt in (`pdf: true`)? How many research notes are actually paper-shaped?
4. **`author` field:** default silently to "John Robison Hoopes," or require it in frontmatter?
5. **"Download PDF" link** on the web post — in scope for this feature, or a follow-up?
6. **Page size:** A4 (as approved) or US Letter, given a US audience?

## Reference artifacts

- `docs/research-pdf-export-reference.typ` — the hand-built Typst source whose output John approved. The visual acceptance bar; also a ready-made template if Option B is chosen.
- PR #91 — the first PDF (`public/research/location-verification-framework.pdf`), produced by the manual process this feature automates.
- [NicklasVraa/Obsidian-academic-export](https://github.com/NicklasVraa/Obsidian-academic-export) — the print-CSS-on-HTML approach that inspired the look and validates Option A's mechanism.
