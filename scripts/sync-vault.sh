#!/bin/bash
# Syncs notes from Obsidian vault to frontend repo

VAULT_PATH="/Users/x25bd/Projects/obsidian/research-notes"
CONTENT_DIR="./content"

echo "🔄 Syncing notes from Obsidian vault..."

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Sync notes
rsync -av --delete "$VAULT_PATH/notes/" "$CONTENT_DIR/notes/"

# Sync attachments if they exist
if [ -d "$VAULT_PATH/attachments" ]; then
  rsync -av --delete "$VAULT_PATH/attachments/" "$CONTENT_DIR/attachments/"
fi

echo ""
echo "✅ Sync complete!"
echo ""
echo "Files synced:"
echo "  Notes: $CONTENT_DIR/notes/"
echo "  Attachments: $CONTENT_DIR/attachments/"
echo ""
echo "Next steps:"
echo "  1. Review changes: git status"
echo "  2. Stage changes: git add content/"
echo "  3. Commit: git commit -m 'Your message'"
echo "  4. Push: git push"
