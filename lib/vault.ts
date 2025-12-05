import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getGitDate } from './git';

// Path to synced notes (synced from Obsidian vault via scripts/sync-vault.sh)
const VAULT_PATH = path.join(process.cwd(), 'content', 'notes');

export interface Note {
  slug: string;
  title: string;
  summary?: string;
  status: 'fragment' | 'working' | 'stable';
  lastTended: string;  // From git
  tags: string[];
  content: string;
  featured?: boolean;
  filepath: string;
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    const files = await fs.readdir(VAULT_PATH, { recursive: true });
    const markdownFiles = files
      .filter(f => typeof f === 'string' && f.endsWith('.md'));

    const notes = await Promise.all(
      markdownFiles.map(async (file) => {
        const filepath = path.join(VAULT_PATH, file);
        const raw = await fs.readFile(filepath, 'utf-8');
        const { data, content } = matter(raw);

        // Get last modified date from git
        const lastTended = await getGitDate(filepath);

        // Generate slug from filename
        const slug = path.basename(file, '.md')
          .toLowerCase()
          .replace(/\s+/g, '-');

        return {
          slug,
          title: data.title || path.basename(file, '.md'),
          summary: data.summary || data.description || '',
          status: data.status || 'fragment',
          lastTended,
          tags: Array.isArray(data.tags) ? data.tags : [],
          content,
          featured: data.featured || false,
          filepath: file
        };
      })
    );

    return notes.filter(n => n !== null);
  } catch (error) {
    console.error('Error reading vault:', error);
    return [];
  }
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const notes = await getAllNotes();
  return notes.find(n => n.slug === slug) || null;
}
