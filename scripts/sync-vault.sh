#!/bin/bash
# Syncs notes from Obsidian vault to frontend repo

VAULT_PATH="/Users/x25bd/Projects/obsidian/research-notes"
CONTENT_DIR="./content"
SYNCIGNORE_FILE="$VAULT_PATH/.syncignore"

echo "🔄 Syncing notes from Obsidian vault..."

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Build rsync exclude arguments from .syncignore
EXCLUDE_ARGS=""
if [ -f "$SYNCIGNORE_FILE" ]; then
  echo "  📋 Reading .syncignore..."
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    # Add as rsync exclude pattern (with .md extension)
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=${line}.md"
    echo "    → Excluding: ${line}.md"
  done < "$SYNCIGNORE_FILE"
fi

# Sync notes (respecting .syncignore)
rsync -av --delete $EXCLUDE_ARGS "$VAULT_PATH/notes/" "$CONTENT_DIR/notes/"

# Sync attachments to public/ for Next.js static serving
# Check multiple possible Obsidian attachment folder names
for ATTACH_DIR in "attachments" "Attachments" "assets" "Assets" "files" "Files"; do
  if [ -d "$VAULT_PATH/$ATTACH_DIR" ]; then
    echo "  Found attachments in: $ATTACH_DIR"
    mkdir -p "./public/attachments"
    rsync -av "$VAULT_PATH/$ATTACH_DIR/" "./public/attachments/"
    break
  fi
done

# Sync About.md if it exists
if [ -f "$VAULT_PATH/About.md" ]; then
  rsync -av "$VAULT_PATH/About.md" "$CONTENT_DIR/About.md"
  echo "  About.md synced"
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "Files synced:"
echo "  Notes: $CONTENT_DIR/notes/"
echo "  Attachments: ./public/attachments/"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Stage changes: git add content/"
echo "  3. Commit: git commit -m 'Your message'"
echo "  4. Push: git push"
