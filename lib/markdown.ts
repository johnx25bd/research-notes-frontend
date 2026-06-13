import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from 'remark-wiki-link';
import rehypeCallouts from 'rehype-callouts';

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

// Resolve a sizing hint encoded as a fragment on an image src (see
// preprocessObsidianImages), then strip the fragment so the served src stays
// clean. A #w= hint becomes an inline width style; a #layout= hint becomes a
// class (`img-wide` / `img-full`) styled in globals.css. Walks the tree
// directly to avoid a unist-util-visit dependency.
function rehypeImageLayout() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any): void => {
    if (
      node.type === 'element' &&
      node.tagName === 'img' &&
      node.properties?.src
    ) {
      const src = String(node.properties.src);
      const widthMatch = src.match(/#w=([^#]+)$/);
      const layoutMatch = src.match(/#layout=([^#]+)$/);
      if (widthMatch) {
        const raw = decodeURIComponent(widthMatch[1]);
        const width = /^\d+$/.test(raw) ? `${raw}px` : raw;
        node.properties.src = src.replace(/#w=[^#]+$/, '');
        const existing = node.properties.style
          ? `${node.properties.style};`
          : '';
        node.properties.style =
          `${existing}width: ${width}; height: auto; display: block; margin-inline: auto;`;
      } else if (layoutMatch) {
        node.properties.src = src.replace(/#layout=[^#]+$/, '');
        const cls = layoutMatch[1] === 'full' ? 'img-full' : 'img-wide';
        const existing = Array.isArray(node.properties.className)
          ? node.properties.className
          : node.properties.className
            ? [node.properties.className]
            : [];
        node.properties.className = [...existing, cls];
      }
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(visit);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any): void => visit(tree);
}

export async function processMarkdown(
  markdown: string,
  availableNotes: string[] = []
): Promise<string> {
  const preprocessed = preprocessObsidianImages(markdown);
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm) // Tables, strikethrough, task lists
    .use(wikiLinkPlugin, {
      permalinks: availableNotes,
      pageResolver: (name: string) => {
        // Convert page name to slug format (lowercase, spaces to hyphens)
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return [slug];
      },
      hrefTemplate: (permalink: string) => `/notes/${permalink}`,
      wikiLinkClassName: 'internal-link',
      newClassName: 'broken-link',
      aliasDivider: '|' // Obsidian uses | for aliases, not :
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeImageLayout)
    .use(rehypeCallouts)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(preprocessed);
  return String(result);
}
