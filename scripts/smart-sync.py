#!/usr/bin/env python3
"""
Smart sync script for two-vault publishing architecture.

xo vault (private) → research-notes vault (intermediate) → frontend (public)

Syncs notes with 'to-publish' tag from xo to research-notes, parses wikilinks,
generates stubs for unpublished references, and adds source_note links back to xo.
"""

import os
import sys
import yaml
import shutil
import re
import urllib.parse
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple, Set

# Two-vault architecture paths
XO_VAULT_PATH = Path("/Users/x25bd/notes/xo")
RESEARCH_NOTES_VAULT_PATH = Path("/Users/x25bd/notes/research-notes")
TO_PUBLISH_TAG = "to-publish"

# Preferred attachment locations in the xo vault, searched first for a clean
# match before falling back to a vault-wide search.
XO_ATTACHMENT_DIRS = [
    XO_VAULT_PATH / "Attachments",
    XO_VAULT_PATH / "attachments",
    XO_VAULT_PATH / "Assets",
    XO_VAULT_PATH / "assets",
    XO_VAULT_PATH / "Files",
    XO_VAULT_PATH / "files",
]


def find_attachment_in_vault(filename: str) -> Optional[Path]:
    """Locate an embedded attachment anywhere in the xo vault.

    Obsidian resolves ![[file]] by searching the whole vault, so attachments
    can live next to a note (e.g. in Notes/) and be linked by relative path,
    not just in a dedicated Attachments/ folder. Mirror that here: check the
    preferred attachment dirs first (fast, predictable), then fall back to a
    recursive search so notes-adjacent files are still found.

    Skips hidden folders (e.g. .obsidian, .trash) and Templates.
    """
    for attach_dir in XO_ATTACHMENT_DIRS:
        candidate = attach_dir / filename
        if candidate.exists():
            return candidate

    for match in XO_VAULT_PATH.rglob(filename):
        if any(part.startswith('.') for part in match.parts):
            continue
        if 'Templates' in match.parts:
            continue
        return match

    return None


def parse_frontmatter(file_path: Path) -> Tuple[Optional[Dict[str, Any]], str]:
    """Parse YAML frontmatter from markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if not content.startswith('---\n'):
        return None, content

    try:
        # Find the end of frontmatter
        end_idx = content.find('\n---\n', 4)
        if end_idx == -1:
            return None, content

        frontmatter_str = content[4:end_idx]
        body = content[end_idx + 5:]  # Skip past closing ---

        frontmatter = yaml.safe_load(frontmatter_str)
        return frontmatter, body
    except Exception as e:
        print(f"⚠️  Error parsing frontmatter in {file_path}: {e}")
        return None, content


def write_frontmatter(file_path: Path, frontmatter: Dict[str, Any], body: str):
    """Write frontmatter and body back to file."""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(frontmatter, f, default_flow_style=False, allow_unicode=True)
        f.write('---\n')
        f.write(body)


def extract_wikilinks(content: str) -> Set[str]:
    """Extract all wikilinks from markdown content.

    Supports:
    - [[Note Name]]
    - [[Note Name|Display Text]]
    - [[folder/Note Name]]
    """
    # Pattern matches [[...]] but not ![[ (for images)
    pattern = r'(?<!!)\[\[([^\]|]+)(?:\|[^\]]+)?\]\]'
    matches = re.findall(pattern, content)

    # Clean up note names (remove path, just get the note name)
    note_names = set()
    for match in matches:
        # Remove folder path if present, get just the note name
        note_name = match.split('/')[-1].strip()
        note_names.add(note_name)

    return note_names


def extract_image_embeds(content: str) -> Set[str]:
    """Extract all image embeds from markdown content.

    Supports Obsidian syntax:
    - ![[image.png]]
    - ![[image.png|alt text]]
    """
    pattern = r'!\[\[([^\]|]+?)(?:\|[^\]]+)?\]\]'
    matches = re.findall(pattern, content)
    return set(matches)


def copy_referenced_attachments(content: str, dest_attachments_dir: Path, note_slug: str) -> Dict[str, str]:
    """Copy referenced image attachments from xo vault to destination with clean names.

    Args:
        content: Markdown content with potential image embeds
        dest_attachments_dir: Directory to copy attachments to
        note_slug: Slug of the note (used for renaming images)

    Returns:
        Dict mapping original filename → new filename
    """
    image_filenames = extract_image_embeds(content)
    if not image_filenames:
        return {}

    filename_mapping = {}
    img_counter = 1

    for filename in sorted(image_filenames):  # Sort for consistent numbering
        # Search for the file anywhere in the vault (attachment dirs first)
        source_path = find_attachment_in_vault(filename)
        if source_path:
            dest_attachments_dir.mkdir(parents=True, exist_ok=True)

            # Create clean filename: note-slug-1.png
            ext = source_path.suffix.lower()
            new_filename = f"{note_slug}-{img_counter}{ext}"
            dest_path = dest_attachments_dir / new_filename

            shutil.copy2(source_path, dest_path)
            filename_mapping[filename] = new_filename
            print(f"    📎 {filename} → {new_filename}")
            img_counter += 1

    return filename_mapping


def rewrite_image_embeds(content: str, filename_mapping: Dict[str, str]) -> str:
    """Rewrite image embeds in content using the new filenames.

    Args:
        content: Markdown content with Obsidian image embeds
        filename_mapping: Dict mapping original filename → new filename

    Returns:
        Content with updated image embeds
    """
    for old_name, new_name in filename_mapping.items():
        # Replace ![[old_name]] or ![[old_name|alt]] with ![[new_name]] or ![[new_name|alt]]
        pattern = rf'!\[\[{re.escape(old_name)}(\|[^\]]+)?\]\]'
        replacement = f'![[{new_name}\\1]]'
        content = re.sub(pattern, replacement, content)
    return content


def rename_xo_attachments(content: str, note_slug: str) -> Dict[str, str]:
    """Rename image attachments in-place in xo vault with clean names.

    This ensures the source document keeps working after sync by renaming
    images in the xo vault itself, not just copying with new names.

    Args:
        content: Markdown content with potential image embeds
        note_slug: Slug of the note (used for renaming images)

    Returns:
        Dict mapping original filename → new filename
    """
    image_filenames = extract_image_embeds(content)
    if not image_filenames:
        return {}

    # Files already in `{note_slug}-{N}.ext` form keep their number, so
    # re-publishing a note doesn't renumber (and break) attachments that were
    # cleaned on a previous run. New attachments are numbered after the highest
    # index already in use.
    clean_pattern = re.compile(rf'^{re.escape(note_slug)}-(\d+)\.[^.]+$')
    used_indices = {
        int(m.group(1))
        for f in image_filenames
        if (m := clean_pattern.match(f))
    }
    next_index = max(used_indices, default=0) + 1

    filename_mapping = {}

    for filename in sorted(image_filenames):  # Sort for consistent numbering
        # Already-clean names need no rename
        if clean_pattern.match(filename):
            continue

        source_path = find_attachment_in_vault(filename)
        if source_path:
            ext = source_path.suffix.lower()
            new_filename = f"{note_slug}-{next_index}{ext}"
            # Rename in the directory where the file actually lives, which may
            # be an attachment folder or alongside the note (e.g. Notes/).
            new_path = source_path.parent / new_filename

            # Rename in place
            source_path.rename(new_path)
            filename_mapping[filename] = new_filename
            print(f"    📎 Renamed in xo: {filename} → {new_filename}")
            next_index += 1

    return filename_mapping


def copy_renamed_attachments(filename_mapping: Dict[str, str], dest_dir: Path):
    """Copy already-renamed attachments from xo vault to research-notes.

    Args:
        filename_mapping: Dict mapping old filename → new filename (values are copied)
        dest_dir: Destination directory in research-notes
    """
    for new_filename in filename_mapping.values():
        source_path = find_attachment_in_vault(new_filename)
        if source_path:
            dest_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_path, dest_dir / new_filename)


def create_obsidian_uri(vault_name: str, note_path: str) -> str:
    """Create an Obsidian URI for opening a note.

    Args:
        vault_name: Name of the Obsidian vault (e.g., 'xo')
        note_path: Path to note relative to vault (e.g., 'Notes/My Note')

    Returns:
        Obsidian URI string
    """
    # URL encode the path
    encoded_path = urllib.parse.quote(note_path)
    return f"obsidian://open?vault={vault_name}&file={encoded_path}"


VALID_AREAS = {"notes", "research"}


def resolve_area(frontmatter: Optional[Dict[str, Any]]) -> str:
    """Determine which site area a note publishes to.

    Driven by the `area:` frontmatter flag. Absent, empty, or unrecognized
    values fall back to 'notes' so existing notes keep publishing as before.
    """
    if not frontmatter:
        return "notes"
    area = frontmatter.get("area")
    if isinstance(area, str) and area.strip().lower() in VALID_AREAS:
        return area.strip().lower()
    return "notes"


def create_live_url(note_name: str, area: str = "notes", slug: Optional[str] = None) -> str:
    """Create a URL for the live published note.

    Args:
        note_name: Name of the note (without .md extension)
        area: Site area the note publishes to ('notes' or 'research')
        slug: Explicit slug from frontmatter, if set; otherwise derived from
            the filename. Must match how lib/vault.ts builds the slug.

    Returns:
        URL to the published note on johnx.co
    """
    # Honor an explicit frontmatter slug; else derive from the filename.
    # Convert to slug format: lowercase + spaces to dashes.
    base = slug if slug else note_name
    slugified = base.lower().replace(' ', '-')
    return f"https://johnx.co/{area}/{slugified}"


def create_research_notes_uri(note_name: str, area: str = "notes") -> str:
    """Create an Obsidian URI for the note in research-notes vault.

    Args:
        note_name: Name of the note (without .md extension)
        area: Subfolder the note lives in ('notes' or 'research')

    Returns:
        Obsidian URI to open the note in research-notes vault
    """
    encoded_path = urllib.parse.quote(f"{area}/{note_name}")
    return f"obsidian://open?vault=research-notes&file={encoded_path}"


def find_note_in_vault(vault_path: Path, note_name: str) -> Optional[Path]:
    """Find a note by name in a vault (searches recursively)."""
    # Try exact match with .md extension
    for md_file in vault_path.rglob(f"{note_name}.md"):
        return md_file
    return None


def has_publish_tag(frontmatter: Optional[Dict[str, Any]]) -> bool:
    """Check if note has to-publish tag."""
    if not frontmatter or 'tags' not in frontmatter:
        return False

    tags = frontmatter['tags']
    if isinstance(tags, str):
        tags = [tags]
    elif not isinstance(tags, list):
        return False

    return TO_PUBLISH_TAG in tags


def find_notes_to_publish() -> List[Path]:
    """Find all notes in xo vault with to-publish tag."""
    notes_to_publish = []

    if not XO_VAULT_PATH.exists():
        print(f"❌ xo vault not found: {XO_VAULT_PATH}")
        return []

    # Search recursively in the entire xo vault
    for md_file in XO_VAULT_PATH.rglob("*.md"):
        # Skip hidden files, .obsidian folder, and Templates folder
        if any(part.startswith('.') for part in md_file.parts):
            continue
        if 'Templates' in md_file.parts:
            continue

        frontmatter, _ = parse_frontmatter(md_file)
        if has_publish_tag(frontmatter):
            notes_to_publish.append(md_file)

    return notes_to_publish


def find_modified_published_notes() -> List[Path]:
    """Find notes in xo with published: true that are newer than research-notes version."""
    modified_notes = []

    if not XO_VAULT_PATH.exists():
        return []

    # Search for all notes with published: true
    for md_file in XO_VAULT_PATH.rglob("*.md"):
        # Skip hidden files, .obsidian folder, and Templates folder
        if any(part.startswith('.') for part in md_file.parts):
            continue
        if 'Templates' in md_file.parts:
            continue

        frontmatter, _ = parse_frontmatter(md_file)
        if not frontmatter or frontmatter.get('published') != True:
            continue

        # Check if note exists in research-notes, under its area subfolder
        area = resolve_area(frontmatter)
        research_note_path = RESEARCH_NOTES_VAULT_PATH / area / (md_file.stem + '.md')
        if not research_note_path.exists():
            continue

        # Compare modification times
        xo_mtime = md_file.stat().st_mtime
        research_mtime = research_note_path.stat().st_mtime

        # If xo version is newer, add to list
        if xo_mtime > research_mtime:
            modified_notes.append(md_file)

    return modified_notes


def create_stub_note(note_name: str, source_note_name: str, dest_dir: Path) -> Path:
    """
    Create a stub note for an unpublished reference.

    Args:
        note_name: Name of the referenced note (without .md)
        source_note_name: Name of the note that referenced it
        dest_dir: Directory to create stub in

    Returns:
        Path to created stub note
    """
    stub_path = dest_dir / f"{note_name}.md"

    # Create stub frontmatter
    stub_frontmatter = {
        'title': note_name,
        'published': False,
        'stub': True,
        'created_by': f'Auto-generated stub (referenced in {source_note_name})',
        'created_at': datetime.now().strftime('%Y-%m-%d')
    }

    # Create minimal stub content
    stub_body = f"This note is referenced but not yet published.\n\nReferenced in: [[{source_note_name}]]\n"

    write_frontmatter(stub_path, stub_frontmatter, stub_body)
    return stub_path


def sync_note(source_path: Path, created_stubs: Set[str], update_source: bool = True) -> bool:
    """
    Sync a note from xo vault to research-notes vault.

    Two-vault architecture:
    1. Copy note from xo to research-notes
    2. Add source_note obsidian:// URI pointing back to xo
    3. Parse wikilinks and create stubs for unpublished references
    4. Mark source note as published

    Args:
        source_path: Path to note in xo vault
        created_stubs: Set to track created stub note names
        update_source: If True, update source frontmatter to mark as published

    Returns:
        True if successful
    """
    try:
        # Parse frontmatter and content
        frontmatter, body = parse_frontmatter(source_path)
        if not frontmatter:
            print(f"⚠️  Skipping {source_path.name}: No frontmatter")
            return False

        # Calculate relative path from xo vault
        rel_path = source_path.relative_to(XO_VAULT_PATH)

        # Which site area this note publishes to (notes/ or research/)
        area = resolve_area(frontmatter)

        # Destination path in research-notes, under the area subfolder
        dest_path = RESEARCH_NOTES_VAULT_PATH / area / source_path.stem
        dest_path = dest_path.with_suffix('.md')
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        # Create frontmatter for research-notes version
        research_frontmatter = frontmatter.copy()

        # Remove xo-specific tags (to-publish, posts, emoji tags like 0🌲)
        XO_SPECIFIC_TAGS = {TO_PUBLISH_TAG, 'posts', '0🌲'}
        if 'tags' in research_frontmatter:
            tags = research_frontmatter['tags']
            if isinstance(tags, list):
                research_frontmatter['tags'] = [t for t in tags if t not in XO_SPECIFIC_TAGS]
            elif tags in XO_SPECIFIC_TAGS:
                research_frontmatter['tags'] = []

        # Add published metadata (overwrite null or missing)
        research_frontmatter['published'] = True
        if research_frontmatter.get('published_at') is None:
            research_frontmatter['published_at'] = datetime.now().strftime('%Y-%m-%d')

        # Add source_note obsidian:// URI for all notes
        source_note_uri = create_obsidian_uri('xo', str(rel_path).replace('.md', ''))
        research_frontmatter['source_note'] = source_note_uri

        # Extract wikilinks and create stubs for unpublished references
        wikilinks = extract_wikilinks(body)
        notes_dir = RESEARCH_NOTES_VAULT_PATH / "notes"
        notes_dir.mkdir(parents=True, exist_ok=True)

        for linked_note in wikilinks:
            # Check if note exists in research-notes
            linked_note_path = notes_dir / f"{linked_note}.md"

            if not linked_note_path.exists():
                # Check if it exists in xo and has published: true
                xo_note_path = find_note_in_vault(XO_VAULT_PATH, linked_note)

                should_create_stub = True
                if xo_note_path:
                    xo_frontmatter, _ = parse_frontmatter(xo_note_path)
                    if xo_frontmatter and xo_frontmatter.get('published') == True:
                        should_create_stub = False

                # Create stub if note doesn't exist or isn't published
                if should_create_stub and linked_note not in created_stubs:
                    create_stub_note(linked_note, source_path.stem, notes_dir)
                    created_stubs.add(linked_note)
                    print(f"    ⚠️  Created stub for unpublished reference: {linked_note}")

        # Rename attachments in xo vault first (so source doc keeps working)
        attachments_dir = RESEARCH_NOTES_VAULT_PATH / "attachments"
        note_slug = source_path.stem.lower().replace(' ', '-')
        filename_mapping = rename_xo_attachments(body, note_slug)

        # Rewrite image embeds in body to use new filenames
        if filename_mapping:
            body = rewrite_image_embeds(body, filename_mapping)

        # Copy renamed attachments to research-notes
        copy_renamed_attachments(filename_mapping, attachments_dir)

        # Write to research-notes vault
        write_frontmatter(dest_path, research_frontmatter, body)
        print(f"  ✓ Synced: {source_path.stem}")

        # Update xo vault to mark as published
        if update_source:
            source_frontmatter = frontmatter.copy()

            # Remove to-publish tag from source
            if 'tags' in source_frontmatter:
                tags = source_frontmatter['tags']
                if isinstance(tags, list):
                    source_frontmatter['tags'] = [t for t in tags if t != TO_PUBLISH_TAG]
                elif tags == TO_PUBLISH_TAG:
                    source_frontmatter['tags'] = []

            # Mark as published in xo vault (overwrite null or missing)
            source_frontmatter['published'] = True
            if 'published_at' not in source_frontmatter or source_frontmatter['published_at'] is None:
                source_frontmatter['published_at'] = datetime.now().strftime('%Y-%m-%d')

            # Add live URL and research-notes link to xo vault
            slug = frontmatter.get('slug') if isinstance(frontmatter.get('slug'), str) and frontmatter.get('slug').strip() else None
            source_frontmatter['url'] = create_live_url(source_path.stem, area, slug)
            source_frontmatter['research_note'] = create_research_notes_uri(source_path.stem, area)

            write_frontmatter(source_path, source_frontmatter, body)
            print(f"    → Marked as published in xo vault")
            print(f"      url: {source_frontmatter['url']}")
            print(f"      research_note: {source_frontmatter['research_note']}")

        return True

    except Exception as e:
        print(f"❌ Error syncing {source_path.name}: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("🔄 Two-vault sync: xo → research-notes\n")
    print(f"Source vault: {XO_VAULT_PATH}")
    print(f"Destination vault: {RESEARCH_NOTES_VAULT_PATH}\n")

    # Ensure research-notes vault exists
    if not RESEARCH_NOTES_VAULT_PATH.exists():
        print(f"❌ research-notes vault not found: {RESEARCH_NOTES_VAULT_PATH}")
        return 1

    # Create notes directory in research-notes if needed
    (RESEARCH_NOTES_VAULT_PATH / "notes").mkdir(parents=True, exist_ok=True)

    # Find new notes to publish (with #to-publish tag)
    notes_to_publish = find_notes_to_publish()

    # Find already-published notes that have been modified
    modified_notes = find_modified_published_notes()

    # Combine lists (remove duplicates)
    all_notes_to_sync = list(set(notes_to_publish + modified_notes))

    if not all_notes_to_sync:
        print("📭 No notes to sync")
        print("\nTo publish a new note:")
        print("  1. Add 'to-publish' to the tags in frontmatter")
        print("  2. Run this script again")
        print("\nAlready-published notes are auto-synced when modified in xo vault")
        return 0

    # Report what we found
    if notes_to_publish:
        print(f"📝 New notes to publish ({len(notes_to_publish)}):\n")
        for note_path in notes_to_publish:
            print(f"  • {note_path.stem}")
        print()

    if modified_notes:
        print(f"🔄 Modified published notes ({len(modified_notes)}):\n")
        for note_path in modified_notes:
            print(f"  • {note_path.stem}")
        print()

    print("🚀 Syncing to research-notes vault...\n")

    # Track created stubs across all notes
    created_stubs: Set[str] = set()

    # Sync each note
    success_count = 0
    for note_path in all_notes_to_sync:
        # Only update source (remove #to-publish) for new notes, not modified ones
        update_source = note_path in notes_to_publish
        if sync_note(note_path, created_stubs, update_source=update_source):
            success_count += 1

    # Summary
    print(f"\n✅ Synced {success_count}/{len(all_notes_to_sync)} notes to research-notes")

    if created_stubs:
        print(f"\n⚠️  Created {len(created_stubs)} stub note(s) for unpublished references:")
        for stub_name in sorted(created_stubs):
            print(f"  • {stub_name} (published: false)")

    print("\n📋 Next steps:")
    print("  1. Review synced notes in research-notes vault")
    print("  2. Run sync-vault.sh to publish research-notes → frontend")
    print("  3. Or use Raycast: 'Publish Research Notes'")

    return 0 if success_count == len(all_notes_to_sync) else 1


if __name__ == "__main__":
    sys.exit(main())
