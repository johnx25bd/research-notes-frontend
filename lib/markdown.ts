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
// A pipe segment that is a bare number (pixels, Obsidian's convention) or an
// N% value is treated as a width hint and carried on the src as a #w= fragment
// rather than as alt text. rehypeImageWidth (below) turns it into an inline
// style. We keep emitting a standard inline image — not a raw <img> tag — so an
// adjacent caption line still renders as markdown instead of being swallowed
// into an HTML block.
// ![[image.svg|75%]]        → ![image](/attachments/image.svg#w=75%)
// ![[image.svg|alt|400]]    → ![alt](/attachments/image.svg#w=400)
function preprocessObsidianImages(markdown: string): string {
  return markdown.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (_, filename, params) => {
      const parts: string[] = params
        ? params.split('|').map((p: string) => p.trim())
        : [];
      let width: string | undefined;
      const altParts: string[] = [];
      for (const part of parts) {
        if (/^\d+%$/.test(part) || /^\d+$/.test(part)) {
          width = part;
        } else {
          altParts.push(part);
        }
      }
      const alt = altParts.join(' ') || filename.replace(/\.[^.]+$/, '');
      let src = `/attachments/${encodeURIComponent(filename)}`;
      if (width) {
        src += `#w=${encodeURIComponent(width)}`;
      }
      return `![${alt}](${src})`;
    }
  );
}

// Apply a width hint encoded as a #w= fragment on an image src (see
// preprocessObsidianImages) as an inline style, then strip the fragment so the
// served src stays clean. A bare number is treated as pixels, an N% value as a
// percentage. Walks the tree directly to avoid a unist-util-visit dependency.
function rehypeImageWidth() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any): void => {
    if (
      node.type === 'element' &&
      node.tagName === 'img' &&
      node.properties?.src
    ) {
      const src = String(node.properties.src);
      const match = src.match(/#w=([^#]+)$/);
      if (match) {
        const raw = decodeURIComponent(match[1]);
        const width = /^\d+$/.test(raw) ? `${raw}px` : raw;
        node.properties.src = src.replace(/#w=[^#]+$/, '');
        const existing = node.properties.style
          ? `${node.properties.style};`
          : '';
        node.properties.style =
          `${existing}width: ${width}; height: auto; display: block; margin-inline: auto;`;
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
    .use(rehypeImageWidth)
    .use(rehypeCallouts)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(preprocessed);
  return String(result);
}
