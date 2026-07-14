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

// Artifact status vocabulary:
//   active      — currently developed or built upon
//   preview     — research preview: early but live
//   historical  — early experiment, no longer developed
//   forthcoming — announced, not yet published (rendered unlinked and dimmed)
export type ArtifactStatus = 'active' | 'preview' | 'historical' | 'forthcoming';

// Editorial tier: 'card' renders as a full card in its track's grid; 'note'
// renders as a compact one-line row beneath the cards. Tier is a curation
// decision, independent of status (which tracks freshness/lineage).
export type ArtifactTier = 'card' | 'note';

// Artifact-kind vocabulary for curated research entries.
export type ArtifactKind =
  | 'paper'
  | 'spec'
  | 'talk'
  | 'prototype'
  | 'post'
  | 'report'
  | 'thread'
  | 'library';

// A link out from an artifact. `url` may be an absolute external URL
// (https://…) or an on-site path (/notes/…).
export interface ResearchLink {
  label: string;
  url: string;
}

export interface Note {
  slug: string;
  title: string;
  summary?: string;
  // Hosted notes use fragment/working/stable; artifacts use
  // active/preview/historical/forthcoming.
  status: 'fragment' | 'working' | 'stable' | ArtifactStatus;
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

  // --- Research-artifact fields ---
  // `type: artifact` entries are curation metadata rather than full notes.
  // A hosted note (like the framework paper) may also carry the track and
  // detail fields so it appears in track sections while still rendering its body.
  type?: string;              // 'artifact' | 'research-index' | undefined (hosted note)
  artifactKind?: ArtifactKind;
  date?: string;              // YYYY or YYYY-MM, for ordering and an eventual timeline
  tracks?: string[];          // Track slugs this entry belongs to
  purpose?: string;           // Why this exists: the motivating problem
  approach?: string;          // What it is / how it works
  statusNote?: string;        // Current state, plainly ("Live spec, maintained")
  role?: string;              // John's role: author, co-author, built it, proposed it
  links?: ResearchLink[];     // Links out; links[0] is treated as primary
  startHere?: boolean;        // Featured "Start here" card at the top of its track
  clause?: string;            // Short clause for compact one-line entries
  tier?: ArtifactTier;        // 'card' (grid card) or 'note' (compact row)
  order?: number;             // Position within the track+tier group (ascending)
}

// An ordered track defined by the research index note's frontmatter.
export interface ResearchTrack {
  slug: string;
  title: string;
  subhead?: string;  // One-sentence framing under the track heading
  note?: string;     // Small muted note (markdown) at the foot of the track's card area
}

// The research index note (content/research/index.md, `type: research-index`).
// Holds John's framing prose plus the ordered track list.
export interface ResearchIndex {
  title: string;
  content: string;
  tracks: ResearchTrack[];
  framingHref?: string;   // CTA target after the intro (e.g. /research/framing)
  framingLabel?: string;  // CTA label (e.g. "Read the longer framing")
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

        // Normalize the artifact links list: accept only entries with a URL.
        const links: ResearchLink[] = Array.isArray(data.links)
          ? data.links
              .filter((l: unknown): l is { label?: string; url?: string } =>
                typeof l === 'object' && l !== null && typeof (l as { url?: unknown }).url === 'string')
              .map((l) => ({ label: String(l.label ?? l.url), url: String(l.url) }))
          : [];

        // `status` may arrive as a single value or a YAML list (some notes use
        // `status: [working]`); normalize to the first string.
        const rawStatus = Array.isArray(data.status) ? data.status[0] : data.status;

        return {
          slug,
          title: data.title || path.basename(file, '.md'),
          summary: data.summary || data.description || '',
          status: rawStatus || 'fragment',
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
          type: data.type,
          artifactKind: data.artifact_kind,
          date: data.date ? String(data.date) : undefined,
          tracks: Array.isArray(data.tracks)
            ? data.tracks.filter((t: unknown): t is string => typeof t === 'string')
            : undefined,
          purpose: data.purpose,
          approach: data.approach,
          statusNote: data.status_note,
          role: data.role,
          links,
          startHere: data.start_here === true,
          clause: data.clause,
          tier: data.tier,
          order: typeof data.order === 'number' ? data.order : undefined,
        };
      })
    );

    // Filter out unpublished notes (only show explicitly published: true).
    // The research index note (`type: research-index`) is framing, not an
    // entry — it is loaded separately via getResearchIndex().
    return notes.filter(
      n => n !== null && n.published === true && !n.stub && n.type !== 'research-index'
    );
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

// Load the research index note (content/research/index.md). Holds the framing
// prose (returned as raw markdown for the page to render) and the ordered list
// of tracks that structures the index. Returns null if absent.
export async function getResearchIndex(): Promise<ResearchIndex | null> {
  const filepath = path.join(CONTENT_ROOT, 'research', 'index.md');
  try {
    const raw = await fs.readFile(filepath, 'utf-8');
    const { data, content } = matter(raw);
    const tracks: ResearchTrack[] = Array.isArray(data.tracks)
      ? data.tracks
          .filter((t: unknown): t is { slug?: string; title?: string } =>
            typeof t === 'object' && t !== null && typeof (t as { slug?: unknown }).slug === 'string')
          .map((t: { slug?: string; title?: string; subhead?: string; note?: string }) => ({
            slug: String(t.slug),
            title: String(t.title ?? t.slug),
            subhead: t.subhead ? String(t.subhead) : undefined,
            note: t.note ? String(t.note) : undefined,
          }))
      : [];
    return {
      title: data.title || 'Research',
      content,
      tracks,
      framingHref: data.framing_href ? String(data.framing_href) : undefined,
      framingLabel: data.framing_label ? String(data.framing_label) : undefined,
    };
  } catch {
    return null;
  }
}
