import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from 'remark-wiki-link';
import rehypeCallouts from 'rehype-callouts';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Area } from './vault';

/**
 * Detect if content contains MDX (React component) syntax.
 * Looks for JSX-like patterns: <ComponentName> or <ComponentName />
 * Excludes standard HTML tags (lowercase).
 */
export function containsMDX(markdown: string): boolean {
  // Match <ComponentName or <ComponentName> where component starts with uppercase
  // This excludes standard HTML tags like <div>, <span>, etc.
  const jsxPattern = /<([A-Z][a-zA-Z0-9]*)\s*[^>]*\/?>/;
  return jsxPattern.test(markdown);
}

// Strip Obsidian comments and unwrap Obsidian highlights.
//   %% ... %%   → removed entirely (author-only comments, inline or block)
//   ==text==    → text (the highlight markers are dropped, content kept)
// Runs before the markdown parse so neither leaks into the published HTML.
// Highlights are unwrapped rather than turned into <mark> because published
// notes use them as author annotations, not as emphasis meant for readers.
// The non-greedy `==` unwrap leaves inline math ($...$) inside a highlight
// intact for remark-math to pick up downstream.
function stripObsidianAnnotations(markdown: string): string {
  return markdown
    .replace(/%%[\s\S]*?%%/g, '')
    // Unwrap highlights, but only within a single line and with no `=` inside,
    // so a stray `==` never pairs across paragraphs/code blocks (e.g. two
    // separate `a == b` comparisons) and swallows the content between them.
    .replace(/==([^\n=]+?)==/g, '$1');
}

// remark-math only renders $$…$$ as *display* (block, centered) math when the
// delimiters sit on their own lines. Obsidian — and this vault — authors
// single-line `$$…$$` as display too, so expand any line that is entirely one
// `$$…$$` expression onto fenced lines. Inline `$…$` and mid-sentence `$$` are
// untouched (the anchors require the whole line to be the expression).
function normalizeDisplayMath(markdown: string): string {
  return markdown.replace(
    /^[ \t]*\$\$(.+?)\$\$[ \t]*$/gm,
    (_match, expr) => `$$\n${expr}\n$$`
  );
}

// Convert Obsidian image embeds to standard markdown.
// ![[image.png]]            → ![image](/attachments/image.png)
// ![[image.png|alt text]]   → ![alt text](/attachments/image.png)
//
// A pipe segment can also carry a sizing hint, encoded on the src as a fragment
// that rehypeImageLayout (below) resolves and then strips:
//   - a bare number (pixels) or N% value → a width within the text column
//   - `wide` → the image bleeds past the column margins (like a figure)
//   - `full` → the image bleeds to the full viewport width
// We keep emitting a standard inline image — not a raw <img> tag — so an
// adjacent caption line still renders as markdown instead of being swallowed
// into an HTML block.
// ![[image.svg|75%]]        → ![image](/attachments/image.svg#w=75%)
// ![[image.svg|wide]]       → ![image](/attachments/image.svg#layout=wide)
// ![[image.svg|alt|wide]]   → ![alt](/attachments/image.svg#layout=wide)
function preprocessObsidianImages(markdown: string): string {
  return markdown.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (_, filename, params) => {
      const parts: string[] = params
        ? params.split('|').map((p: string) => p.trim())
        : [];
      let width: string | undefined;
      let layout: string | undefined;
      const altParts: string[] = [];
      for (const part of parts) {
        const lower = part.toLowerCase();
        if (lower === 'wide' || lower === 'full') {
          layout = lower;
        } else if (/^\d+%$/.test(part) || /^\d+$/.test(part)) {
          width = part;
        } else {
          altParts.push(part);
        }
      }
      const alt = altParts.join(' ') || filename.replace(/\.[^.]+$/, '');
      let src = `/attachments/${encodeURIComponent(filename)}`;
      if (layout) {
        src += `#layout=${layout}`;
      } else if (width) {
        src += `#w=${encodeURIComponent(width)}`;
      }
      return `![${alt}](${src})`;
    }
  );
}

// Wrap image embeds in a <figure>, attaching a title, a caption, and a sizing
// class.
//
// Authoring convention (inferred from Obsidian):
//   **A title**                    ← an optional bold line directly above
//   ![[diagram.svg|wide]]          ← image + optional sizing hint
//   > A caption.                    ← a blockquote (or a single italic line)
//   > It may span multiple lines.     directly below becomes the caption
//
// Title and caption may also ride on the image's own line (Obsidian renders
// `**Title** ![[img]] *caption*` as one paragraph when there are no blank
// lines). The result is:
//   <figure class="note-figure img-wide">
//     <p class="figure-title">…</p><img><figcaption>…</figcaption>
//   </figure>
// The sizing hint (#layout= / #w= from preprocessObsidianImages) is consumed
// here and the fragment stripped from the src. The figure is styled opaque and
// raised above the page's meridian line in globals.css; the sizing class drives
// the bleed (wide/full) or a column width. Plain images with neither a hint nor
// a caption are left untouched. Runs after rehypeCallouts so callout
// blockquotes (already turned into divs) are never mistaken for captions.
// Walks the tree directly to avoid a unist-util-visit dependency.
function rehypeImageFigures() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isBlank = (n: any) => n.type === 'text' && /^\s*$/.test(n.value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meaningful = (nodes: any[]) => nodes.filter((n) => !isBlank(n));

  // Inspect a paragraph containing an image, partitioning its inline content
  // into a leading title (bold) and a trailing caption (italic) — both of which
  // Obsidian renders on the same line as the image when there are no blank
  // lines. Returns null unless the image is alone or flanked only by those; an
  // image sitting in real body text is left as a plain inline image.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageParagraph = (
    node: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): { img: any; inlineTitle: any[] | null; inlineCaption: any[] | null } | null => {
    if (node?.type !== 'element' || node.tagName !== 'p') return null;
    const kids = meaningful(node.children || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgIdx = kids.findIndex((k: any) => k.tagName === 'img');
    if (imgIdx === -1) return null;
    const before = kids.slice(0, imgIdx);
    const after = kids.slice(imgIdx + 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allStrong = before.length > 0 && before.every((k: any) => k.tagName === 'strong');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allEm = after.length > 0 && after.every((k: any) => k.tagName === 'em');
    if (before.length > 0 && !allStrong) return null;
    if (after.length > 0 && !allEm) return null;
    return {
      img: kids[imgIdx],
      inlineTitle: allStrong ? before : null,
      inlineCaption: allEm ? after : null,
    };
  };

  // A standalone paragraph whose meaningful content is entirely one inline tag
  // (`strong` → a title line, `em` → a caption line).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAllOf = (node: any, tag: string): boolean => {
    if (node?.type !== 'element' || node.tagName !== 'p') return false;
    const kids = meaningful(node.children || []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return kids.length > 0 && kids.every((k: any) => k.tagName === tag);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrap = (tagName: string, className: string | null, children: any[]) => ({
    type: 'element',
    tagName,
    properties: className ? { className: [className] } : {},
    children,
  });

  // Consume a sizing hint from the img src; returns the class and/or style to
  // place on the figure.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sizing = (img: any): { className?: string; style?: string } => {
    const src = String(img.properties?.src || '');
    const layout = src.match(/#layout=([^#]+)$/);
    if (layout) {
      img.properties.src = src.replace(/#layout=[^#]+$/, '');
      return { className: layout[1] === 'full' ? 'img-full' : 'img-wide' };
    }
    const width = src.match(/#w=([^#]+)$/);
    if (width) {
      img.properties.src = src.replace(/#w=[^#]+$/, '');
      const raw = decodeURIComponent(width[1]);
      return { style: `width: ${/^\d+$/.test(raw) ? `${raw}px` : raw};` };
    }
    return {};
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transform = (parent: any): void => {
    const children = parent.children;
    if (!Array.isArray(children)) return;
    for (let i = 0; i < children.length; i++) {
      const info = imageParagraph(children[i]);
      if (info) {
        const { img, inlineTitle, inlineCaption } = info;
        const { className, style } = sizing(img);
        let start = i;
        let end = i;

        // Title: a bold lead on the image's line, else a bold line directly above.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let title: any[] | null = inlineTitle;
        if (!title) {
          let p = i - 1;
          while (p >= 0 && isBlank(children[p])) p--;
          if (p >= 0 && isAllOf(children[p], 'strong')) {
            title = meaningful(children[p].children);
            start = p;
          }
        }

        // Caption: an italic trailer on the image's line, else a blockquote or
        // italic line directly below.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let caption: any[] | null = inlineCaption;
        if (!caption) {
          let j = i + 1;
          while (j < children.length && isBlank(children[j])) j++;
          const next = children[j];
          if (next?.type === 'element' && next.tagName === 'blockquote') {
            caption = meaningful(next.children || []);
            end = j;
          } else if (next && isAllOf(next, 'em')) {
            caption = [next];
            end = j;
          }
        }

        if (className || style || title || caption) {
          const figureProps: Record<string, unknown> = {
            className: ['note-figure', ...(className ? [className] : [])],
          };
          if (style) figureProps.style = style;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const figureKids: any[] = [];
          if (title) figureKids.push(wrap('p', 'figure-title', title));
          figureKids.push(img);
          if (caption) figureKids.push(wrap('figcaption', null, caption));
          const figure = {
            type: 'element',
            tagName: 'figure',
            properties: figureProps,
            children: figureKids,
          };
          children.splice(start, end - start + 1, figure);
          i = start;
          continue;
        }
      }
      transform(children[i]);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any): void => transform(tree);
}

// Relocate GFM footnotes into inline margin notes (Tufte-style sidenotes).
// remark-gfm/remark-rehype emit a trailing <section data-footnotes> with all
// definitions collected at the foot of the document, plus a <sup> reference at
// each call site. This transform pulls each definition up next to its
// reference as an <aside class="sidenote">, so the reader sees the note in the
// margin without jumping to the bottom. CSS (scoped to .research-article)
// floats the aside into the right margin on wide screens and inlines it on
// narrow ones. The original footnotes section is removed.
// Hand-walks the tree to avoid a unist-util-visit dependency (as elsewhere).
function rehypeSidenotes() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textOf = (node: any): string => {
    if (node.type === 'text') return node.value || '';
    if (Array.isArray(node.children)) return node.children.map(textOf).join('');
    return '';
  };

  // Deep-clone a subtree while dropping the footnote back-reference anchors.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withoutBackref = (node: any): any | null => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      node.properties?.dataFootnoteBackref !== undefined
    ) {
      return null;
    }
    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(withoutBackref).filter(Boolean),
      };
    }
    return { ...node };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any): void => {
    // 1. Find the footnotes section and collect id → definition content.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let section: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sectionParent: any = null;
    let sectionIndex = -1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locate = (node: any): void => {
      if (!node || !Array.isArray(node.children)) return;
      node.children.forEach((child: any, idx: number) => {
        if (
          child.type === 'element' &&
          child.tagName === 'section' &&
          child.properties?.dataFootnotes !== undefined
        ) {
          section = child;
          sectionParent = node;
          sectionIndex = idx;
        } else {
          locate(child);
        }
      });
    };
    locate(tree);
    if (!section) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defs = new Map<string, any[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ol = (section.children || []).find((c: any) => c.tagName === 'ol');
    if (ol) {
      for (const li of ol.children) {
        if (li.type !== 'element' || li.tagName !== 'li' || !li.properties?.id) continue;
        const cleaned = withoutBackref(li);
        defs.set(String(li.properties.id), cleaned.children);
      }
    }

    // 2. Remove the trailing footnotes section (before walking for refs).
    if (sectionParent && sectionIndex >= 0) {
      sectionParent.children.splice(sectionIndex, 1);
    }

    // 3. Insert an <aside> after each footnote-reference <sup>.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insert = (node: any): void => {
      if (!node || !Array.isArray(node.children)) return;
      const kids = node.children;
      for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        if (child.type === 'element' && child.tagName === 'sup') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const a = (child.children || []).find(
            (c: any) =>
              c.type === 'element' &&
              c.tagName === 'a' &&
              c.properties?.dataFootnoteRef !== undefined
          );
          if (a) {
            const id = String(a.properties?.href || '').replace(/^#/, '');
            const content = defs.get(id);
            if (content) {
              const aside = {
                type: 'element',
                tagName: 'aside',
                properties: { className: ['sidenote'] },
                children: [
                  {
                    type: 'element',
                    tagName: 'sup',
                    properties: { className: ['sidenote-number'] },
                    children: [{ type: 'text', value: textOf(a) }],
                  },
                  ...content,
                ],
              };
              kids.splice(i + 1, 0, aside);
              i++; // step past the aside we just inserted
              continue;
            }
          }
        }
        insert(child);
      }
    };
    insert(tree);
  };
}

// Inline each GFM footnote definition at its call site as
// <span class="footnote">…</span>, so a paginator (Paged.js `float: footnote`)
// can lift it to the foot of the printed page and number it automatically.
// This is the print counterpart to rehypeSidenotes: same collection of
// id → definition, but the original <sup> reference is replaced outright
// (Paged.js emits its own call number) and the trailing footnotes section is
// removed. Used only for the PDF build; the web keeps margin sidenotes.
// Self-contained (own tree-walk and back-ref stripping) so the web path is
// never touched.
function rehypePrintFootnotes() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withoutBackref = (node: any): any | null => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      node.properties?.dataFootnoteBackref !== undefined
    ) {
      return null;
    }
    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map(withoutBackref).filter(Boolean),
      };
    }
    return { ...node };
  };

  // Flatten a footnote definition to purely inline content. A block element
  // (<p>, <ul>, blockquote, …) cannot legally nest inside the inline footnote
  // <span>: the HTML parser would eject it, floating an empty note to the page
  // foot and stranding the text in the body. So we recursively unwrap every
  // block container to its inline children, joining siblings and list items
  // with a space. Inline formatting (em/strong/code/links) is preserved.
  const BLOCK_CONTAINERS = new Set(['p', 'div', 'blockquote', 'section']);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flattenToInline = (nodes: any[]): any[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pushSpaced = (children: any[]) => {
      if (out.length > 0) out.push({ type: 'text', value: ' ' });
      out.push(...flattenToInline(children));
    };
    for (const node of nodes) {
      if (node.type === 'element' && BLOCK_CONTAINERS.has(node.tagName)) {
        pushSpaced(node.children || []);
      } else if (
        node.type === 'element' &&
        (node.tagName === 'ul' || node.tagName === 'ol')
      ) {
        for (const li of node.children || []) {
          if (li.type === 'element' && li.tagName === 'li') {
            pushSpaced(li.children || []);
          }
        }
      } else {
        out.push(node);
      }
    }
    return out;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any): void => {
    // 1. Locate the collected footnotes section and index its definitions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let section: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sectionParent: any = null;
    let sectionIndex = -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locate = (node: any): void => {
      if (!node || !Array.isArray(node.children)) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node.children.forEach((child: any, idx: number) => {
        if (
          child.type === 'element' &&
          child.tagName === 'section' &&
          child.properties?.dataFootnotes !== undefined
        ) {
          section = child;
          sectionParent = node;
          sectionIndex = idx;
        } else {
          locate(child);
        }
      });
    };
    locate(tree);
    if (!section) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defs = new Map<string, any[]>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ol = (section.children || []).find((c: any) => c.tagName === 'ol');
    if (ol) {
      for (const li of ol.children) {
        if (li.type !== 'element' || li.tagName !== 'li' || !li.properties?.id) continue;
        const cleaned = withoutBackref(li);
        defs.set(String(li.properties.id), cleaned.children);
      }
    }

    // 2. Drop the trailing section (before walking for references).
    if (sectionParent && sectionIndex >= 0) {
      sectionParent.children.splice(sectionIndex, 1);
    }

    // 3. Replace each footnote-reference <sup> with a floatable footnote span.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const replace = (node: any): void => {
      if (!node || !Array.isArray(node.children)) return;
      const kids = node.children;
      for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        if (child.type === 'element' && child.tagName === 'sup') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const a = (child.children || []).find(
            (c: any) =>
              c.type === 'element' &&
              c.tagName === 'a' &&
              c.properties?.dataFootnoteRef !== undefined
          );
          if (a) {
            const id = String(a.properties?.href || '').replace(/^#/, '');
            const content = defs.get(id);
            if (content) {
              kids[i] = {
                type: 'element',
                tagName: 'span',
                properties: { className: ['footnote'] },
                children: flattenToInline(content),
              };
              continue;
            }
          }
        }
        replace(child);
      }
    };
    replace(tree);
  };
}

// Wrap a leading "Abstract" section (the h2 plus everything up to the next
// heading) in <section class="abstract"> so research pages can style it apart
// from the body. No-op when there is no Abstract heading.
function rehypeAbstract() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textOf = (n: any): string =>
    n.type === 'text' ? (n.value || '') : Array.isArray(n.children) ? n.children.map(textOf).join('') : '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isHeading = (n: any) => n?.type === 'element' && /^h[1-6]$/.test(n.tagName);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any): void => {
    const children = tree.children;
    if (!Array.isArray(children)) return;
    const start = children.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c?.type === 'element' && c.tagName === 'h2' && textOf(c).trim().toLowerCase() === 'abstract'
    );
    if (start === -1) return;
    let end = children.length;
    for (let j = start + 1; j < children.length; j++) {
      if (isHeading(children[j])) { end = j; break; }
    }
    const section = {
      type: 'element',
      tagName: 'section',
      properties: { className: ['abstract'] },
      children: children.slice(start, end),
    };
    children.splice(start, end - start, section);
  };
}

export interface ProcessMarkdownOptions {
  // How research footnotes are placed. 'sidenotes' (default) floats each into
  // the right margin as a Tufte-style aside — the web reading experience.
  // 'print' inlines each definition as a <span class="footnote"> at its call
  // site so a paginator (Paged.js) can lift it to the foot of the printed page.
  footnoteStyle?: 'sidenotes' | 'print';
}

export async function processMarkdown(
  markdown: string,
  // Accepts either a bare slug list (back-compat) or slug+area pairs. Bare
  // slugs are assumed to live in the current area.
  availableNotes: (string | { slug: string; area: Area })[] = [],
  currentArea: Area = 'notes',
  options: ProcessMarkdownOptions = {}
): Promise<string> {
  const preprocessed = preprocessObsidianImages(
    normalizeDisplayMath(stripObsidianAnnotations(markdown))
  );
  // Resolve a wikilink to the area its target actually lives in, so links point
  // at /notes/… or /research/… correctly (and cross-area links resolve too).
  const normalizedNotes = availableNotes.map(n =>
    typeof n === 'string' ? { slug: n, area: currentArea } : n
  );
  const areaBySlug = new Map(normalizedNotes.map(n => [n.slug, n.area]));
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) // Tables, strikethrough, task lists
    .use(remarkMath) // $inline$ and $$block$$ LaTeX
    .use(wikiLinkPlugin, {
      permalinks: normalizedNotes.map(n => n.slug),
      pageResolver: (name: string) => {
        // Convert page name to slug format (lowercase, spaces to hyphens)
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return [slug];
      },
      hrefTemplate: (permalink: string) =>
        `/${areaBySlug.get(permalink) ?? currentArea}/${permalink}`,
      wikiLinkClassName: 'internal-link',
      newClassName: 'broken-link',
      aliasDivider: '|' // Obsidian uses | for aliases, not :
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex); // Render math nodes to KaTeX HTML

  // Research pieces get Tufte-style margin sidenotes and a set-apart abstract;
  // notes keep the standard collected footnotes section at the foot.
  if (currentArea === 'research') {
    processor.use(
      options.footnoteStyle === 'print' ? rehypePrintFootnotes : rehypeSidenotes
    );
    processor.use(rehypeAbstract);
  }

  processor
    // Give every heading a stable, GitHub-style id slug, then prepend a quiet
    // "#" permalink so any section is directly linkable. rehypeSlug must run
    // first — autolink reads the ids it assigns. The "#" is decorative (kept
    // out of the tab order, revealed on hover); globals.css positions it in the
    // left margin and print.css hides it. Applies to notes and research alike.
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'prepend',
      properties: {
        className: ['heading-anchor'],
        ariaLabel: 'Link to this section',
        tabIndex: -1,
      },
      content: { type: 'text', value: '#' },
    })
    .use(rehypeCallouts)
    .use(rehypeImageFigures)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(preprocessed);
  return String(result);
}
