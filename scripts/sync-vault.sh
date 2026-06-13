#!/bin/bash
# Syncs notes from Obsidian vault to a frontend working tree.
#
# Usage: sync-vault.sh [TARGET_DIR]
#   TARGET_DIR defaults to the current directory. Pass an explicit path to
#   sync into a specific worktree (e.g. a dedicated publish worktree) without
#   having to cd into it first.

VAULT_PATH="/Users/x25bd/notes/research-notes"
TARGET_DIR="${1:-.}"
CONTENT_DIR="$TARGET_DIR/content"
ATTACHMENTS_DIR="$TARGET_DIR/public/attachments"

echo "🔄 Syncing notes from Obsidian vault into: $TARGET_DIR"

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Sync notes
rsync -av --delete "$VAULT_PATH/notes/" "$CONTENT_DIR/notes/"

# Sync attachments to public/ for Next.js static serving
# Check multiple possible Obsidian attachment folder names
for ATTACH_DIR in "attachments" "Attachments" "assets" "Assets" "files" "Files"; do
  if [ -d "$VAULT_PATH/$ATTACH_DIR" ]; then
    echo "  Found attachments in: $ATTACH_DIR"
    mkdir -p "$ATTACHMENTS_DIR"
    rsync -av "$VAULT_PATH/$ATTACH_DIR/" "$ATTACHMENTS_DIR/"
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
echo "  Attachments: $ATTACHMENTS_DIR/"
