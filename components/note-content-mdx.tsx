import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx';

interface NoteContentMDXProps {
  source: string;
}

export async function NoteContentMDX({ source }: NoteContentMDXProps) {
  // @ts-expect-error - Async Server Component pattern, types lag behind React 19
  return <MDXRemote source={source} components={mdxComponents} />;
}
