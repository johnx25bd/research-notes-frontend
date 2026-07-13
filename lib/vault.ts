import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getGitDate } from './git';

// Content areas of the site. Each maps to a folder under content/ and a
// top-level route (/notes/[slug], /research/[slug]). Files are routed into an
// area by the `area:` frontmatter flag during sync (defaults to notes).
export type Area = 'notes' | 'research';

// Root of synced content (populated from the Obsidian vault via
// scripts/sync-vault.sh). Each area is a subdirectory.
const CONTENT_ROOT = path.join(process.cwd(), 'content');

export interface Note {
  slug: string;
  title: string;
  summary?: string;
  status: 'fragment' | 'working' | 'stable';
  lastTended: string;  // From git
  tags: string[];
  content: string;
  area: Area;           // Which site area this belongs to
  featured?: boolean;
  featured_order?: number;  // For sorting featured notes
  filepath: string;
  published?: boolean;  // Set by smart-sync.py
  stub?: boolean;       // Auto-generated stub notes
  source_note?: string; // Obsidian URI back to source vault
  pdf?: boolean;        // Opt-in: generate a print-ready PDF at /research/<slug>.pdf
  author?: string;      // Byline for the PDF; defaults applied at render time
}

// Load and parse every published note in a single content area.
async function loadArea(area: Area): Promise<Note[]> {
  const dir = path.join(CONTENT_ROOT, area);
  try {
    const files = await fs.readdir(dir, { recursive: true });
    const markdownFiles = files
      .filter(f => typeof f === 'string' && f.endsWith('.md'));

    const notes = await Promise.all(
      markdownFiles.map(async (file) => {
        const filepath = path.join(dir, file);
        const raw = await fs.readFile(filepath, 'utf-8');
        const { data, content } = matter(raw);

        // Get last modified date from git
        const lastTended = await getGitDate(filepath);

        // Slug: an explicit `slug:` in frontmatter wins; otherwise derive it
        // from the filename. Either way, normalize to a clean URL slug
        // (lowercase, spaces→hyphens, em/en-dash→hyphen, smart quotes flattened).
        const slug = String(data.slug || path.basename(file, '.md'))
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[—–]/g, '-')  // em-dash and en-dash to hyphen
          .replace(/['']/g, "'")  // smart single quotes
          .replace(/[""]/g, '"'); // smart double quotes

        return {
          slug,
          title: data.title || path.basename(file, '.md'),
          summary: data.summary || data.description || '',
          status: data.status || 'fragment',
          lastTended,
          tags: Array.isArray(data.tags) ? data.tags : [],
          content,
          area,
          featured: data.featured || false,
          featured_order: data.featured_order,
          filepath: file,
          published: data.published,
          stub: data.stub,
          source_note: data.source_note,
          pdf: data.pdf === true,
          author: data.author
        };
      })
    );

    // Filter out unpublished notes (only show explicitly published: true)
    return notes.filter(n => n !== null && n.published === true && !n.stub);
  } catch (error) {
    // Silently return empty array on error - errors will surface during build
    return [];
  }
}

export async function getAllNotes(): Promise<Note[]> {
  return loadArea('notes');
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const notes = await getAllNotes();
  return notes.find(n => n.slug === slug) || null;
}

export async function getAllResearch(): Promise<Note[]> {
  return loadArea('research');
}

export async function getResearchBySlug(slug: string): Promise<Note | null> {
  const research = await getAllResearch();
  return research.find(n => n.slug === slug) || null;
}
