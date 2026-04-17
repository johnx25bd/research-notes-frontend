#!/bin/bash
# Syncs notes from Obsidian vault to frontend repo

VAULT_PATH="/Users/x25bd/notes/research-notes"
CONTENT_DIR="./content"

echo "🔄 Syncing notes from Obsidian vault..."

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Sync notes
rsync -av --delete "$VAULT_PATH/notes/" "$CONTENT_DIR/notes/"

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
