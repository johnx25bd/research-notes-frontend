import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import wikiLinkPlugin from 'remark-wiki-link';
import rehypeCallouts from 'rehype-callouts';

// Convert Obsidian image embeds to standard markdown
// ![[image.png]] → ![image](/attachments/image.png)
// ![[image.png|alt text]] → ![alt text](/attachments/image.png)
function preprocessObsidianImages(markdown: string): string {
  return markdown.replace(
    /!\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g,
    (_, filename, altText) => {
      const alt = altText || filename.replace(/\.[^.]+$/, '');
      return `![${alt}](/attachments/${filename})`;
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
