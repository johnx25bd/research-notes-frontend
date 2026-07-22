import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { mdxComponents } from '@/components/mdx';

// Anchored headings for the MDX render path, matching lib/markdown.ts's
// processMarkdown pipeline so component-bearing notes get the same id slugs and
// hover "#" permalinks as plain-markdown ones. Styling lives in globals.css.
const rehypePlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'prepend',
      properties: {
        className: ['heading-anchor'],
        ariaLabel: 'Link to this section',
        tabIndex: -1,
      },
      content: { type: 'text', value: '#' },
    },
  ],
] as const;

interface NoteContentMDXProps {
  source: string;
}

export async function NoteContentMDX({ source }: NoteContentMDXProps) {
  return (
    // @ts-expect-error - Async Server Component pattern, types lag behind React 19
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        blockJS: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mdxOptions: { rehypePlugins: rehypePlugins as any },
      }}
    />
  );
}
