#!/usr/bin/env python3
"""
Smart sync script for publishing notes from Obsidian vault.

Finds notes tagged with 'to-publish', syncs them to the frontend repo,
and marks them as published in the source vault.
"""

import os
import sys
import yaml
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

VAULT_PATH = Path("/Users/x25bd/Projects/obsidian/research-notes")
CONTENT_DIR = Path("./content")
TO_PUBLISH_TAG = "to-publish"


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
    """Find all notes in vault with to-publish tag."""
    notes_to_publish = []
    notes_dir = VAULT_PATH / "notes"

    if not notes_dir.exists():
        print(f"❌ Notes directory not found: {notes_dir}")
        return []

    for md_file in notes_dir.rglob("*.md"):
        frontmatter, _ = parse_frontmatter(md_file)
        if has_publish_tag(frontmatter):
            notes_to_publish.append(md_file)

    return notes_to_publish


def sync_note(source_path: Path, update_source: bool = True) -> bool:
    """
    Sync a single note to the frontend repo.

    Args:
        source_path: Path to note in vault
        update_source: If True, update source frontmatter to mark as published

    Returns:
        True if successful
    """
    try:
        # Parse frontmatter
        frontmatter, body = parse_frontmatter(source_path)
        if not frontmatter:
            print(f"⚠️  Skipping {source_path.name}: No frontmatter")
            return False

        # Determine destination path (preserve directory structure)
        rel_path = source_path.relative_to(VAULT_PATH / "notes")
        dest_path = CONTENT_DIR / "notes" / rel_path
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        # Create cleaned frontmatter for published version
        published_frontmatter = frontmatter.copy()

        # Remove to-publish tag
        if 'tags' in published_frontmatter:
            tags = published_frontmatter['tags']
            if isinstance(tags, list):
                published_frontmatter['tags'] = [t for t in tags if t != TO_PUBLISH_TAG]
            elif tags == TO_PUBLISH_TAG:
                published_frontmatter['tags'] = []

        # Add published metadata
        if 'published' not in published_frontmatter:
            published_frontmatter['published'] = True
            published_frontmatter['published_at'] = datetime.now().strftime('%Y-%m-%d')

        # Write to destination
        write_frontmatter(dest_path, published_frontmatter, body)
        print(f"  ✓ Synced: {rel_path}")

        # Update source vault to mark as published
        if update_source:
            source_frontmatter = frontmatter.copy()

            # Remove to-publish tag from source
            if 'tags' in source_frontmatter:
                tags = source_frontmatter['tags']
                if isinstance(tags, list):
                    source_frontmatter['tags'] = [t for t in tags if t != TO_PUBLISH_TAG]
                elif tags == TO_PUBLISH_TAG:
                    source_frontmatter['tags'] = []

            # Mark as published in source
            source_frontmatter['published'] = True
            source_frontmatter['published_at'] = datetime.now().strftime('%Y-%m-%d')

            write_frontmatter(source_path, source_frontmatter, body)
            print(f"    → Updated source vault")

        return True

    except Exception as e:
        print(f"❌ Error syncing {source_path.name}: {e}")
        return False


def sync_about_page():
    """Sync About.md if it exists."""
    about_path = VAULT_PATH / "About.md"
    if about_path.exists():
        dest_path = CONTENT_DIR / "About.md"
        shutil.copy2(about_path, dest_path)
        print("  ✓ Synced: About.md")
        return True
    return False


def main():
    print("🔄 Smart sync: Finding notes to publish...\n")

    # Create content directory if needed
    (CONTENT_DIR / "notes").mkdir(parents=True, exist_ok=True)

    # Find notes to publish
    notes_to_publish = find_notes_to_publish()

    if not notes_to_publish:
        print("📭 No notes found with #to-publish tag")
        print("\nTo publish a note:")
        print("  1. Add 'to-publish' to the tags in frontmatter")
        print("  2. Run this script again")
        return 0

    print(f"📝 Found {len(notes_to_publish)} note(s) to publish:\n")
    for note_path in notes_to_publish:
        rel_path = note_path.relative_to(VAULT_PATH / "notes")
        print(f"  • {rel_path}")

    print("\n🚀 Publishing...\n")

    # Sync each note
    success_count = 0
    for note_path in notes_to_publish:
        if sync_note(note_path, update_source=True):
            success_count += 1

    # Sync About.md
    print()
    sync_about_page()

    print(f"\n✅ Published {success_count}/{len(notes_to_publish)} notes")
    print(f"\nNext steps:")
    print(f"  1. Review changes: git status")
    print(f"  2. Stage changes: git add content/")
    print(f"  3. Commit: git commit -m 'content: Publish new notes'")
    print(f"  4. Push: git push")

    return 0 if success_count == len(notes_to_publish) else 1


if __name__ == "__main__":
    sys.exit(main())
