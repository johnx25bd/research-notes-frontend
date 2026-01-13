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

// Convert Obsidian image embeds to standard markdown
// ![[image.png]] → ![image](/attachments/image.png)
// ![[image.png|alt text]] → ![alt text](/attachments/image.png)
function preprocessObsidianImages(markdown: string): string {
  return markdown.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (_, filename, altText) => {
      const alt = altText || filename.replace(/\.[^.]+$/, '');
      const encodedFilename = encodeURIComponent(filename);
      return `![${alt}](/attachments/${encodedFilename})`;
    }
  );
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
    .use(rehypeCallouts)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(preprocessed);
  return String(result);
}
