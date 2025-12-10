import { Note } from './vault';

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;

export interface BacklinkMap {
  [slug: string]: string[];
}

export function computeBacklinks(notes: Note[]): BacklinkMap {
  const backlinks: BacklinkMap = {};

  // Initialize empty arrays for all notes
  notes.forEach(note => {
    backlinks[note.slug] = [];
  });

  // Find all wikilinks in each note
  notes.forEach(sourceNote => {
    const matches = sourceNote.content.matchAll(WIKILINK_REGEX);

    for (const match of matches) {
      const linkedTitle = match[1].trim().toLowerCase();

      // Find target note by title or slug
      const targetNote = notes.find(n => {
        const noteTitle = typeof n.title === 'string' ? n.title.toLowerCase() : '';
        return noteTitle === linkedTitle || n.slug === linkedTitle;
      });

      if (targetNote && targetNote.slug !== sourceNote.slug) {
        // Add sourceNote as a backlink to targetNote
        if (!backlinks[targetNote.slug].includes(sourceNote.slug)) {
          backlinks[targetNote.slug].push(sourceNote.slug);
        }
      }
    }
  });

  return backlinks;
}
