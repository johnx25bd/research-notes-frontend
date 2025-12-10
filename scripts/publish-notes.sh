#!/bin/bash
# Raycast Script Command for Publishing Research Notes
#
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Publish Research Notes
# @raycast.mode fullOutput
#
# Optional parameters:
# @raycast.icon 📝
# @raycast.packageName Research Notes
# @raycast.description Sync notes tagged with #to-publish and create a PR

set -e

# Configuration
REPO_DIR="/Users/x25bd/Code/johnx/front"
BRANCH_PREFIX="content/publish"

cd "$REPO_DIR"

echo "🔄 Publishing research notes..."
echo ""

# Ensure we're on main and up to date
echo "📥 Updating main branch..."
git checkout main
git pull origin main

# Run smart sync (xo → research-notes)
echo ""
echo "🔍 Finding notes to publish..."
# Use the same Python that has PyYAML installed
/Users/x25bd/.pyenv/versions/3.8.10/bin/python3 scripts/smart-sync.py

# Sync research-notes → frontend/content
echo ""
echo "📦 Syncing to frontend..."
bash scripts/sync-vault.sh

# Check if there are changes
if [[ -z $(git status --porcelain content/) ]]; then
  echo ""
  echo "✅ No new notes to publish!"
  exit 0
fi

# Show what will be published
echo ""
echo "📋 Changes to be published:"
git status --short content/

# Create a new branch
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH_NAME="${BRANCH_PREFIX}-${TIMESTAMP}"

echo ""
echo "🌿 Creating branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# Stage changes
git add content/ .beads/

# Detect new vs modified notes
NEW_NOTES=$(git diff --cached --name-only --diff-filter=A content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')
MODIFIED_NOTES=$(git diff --cached --name-only --diff-filter=M content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')

# Build commit message
COMMIT_MSG="content: Publish research notes"

if [[ -n "$NEW_NOTES" ]]; then
  COMMIT_MSG="${COMMIT_MSG}

New notes:
$(echo "$NEW_NOTES" | sed 's/^/- /')"
fi

if [[ -n "$MODIFIED_NOTES" ]]; then
  COMMIT_MSG="${COMMIT_MSG}

Updated:
$(echo "$MODIFIED_NOTES" | sed 's/^/- /')"
fi

git commit -m "$COMMIT_MSG"

# Push branch
echo ""
echo "⬆️  Pushing to GitHub..."
git push -u origin "$BRANCH_NAME"

# Create PR using gh CLI
echo ""
echo "🔀 Creating pull request..."

PR_TITLE="Publish research notes"

# Build PR body
PR_BODY="## Research Notes Update

This PR publishes notes that were tagged with \`#to-publish\` in the vault."

# Get new and modified notes for PR
NEW_NOTES_PR=$(git diff --name-only origin/main --diff-filter=A content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')
MODIFIED_NOTES_PR=$(git diff --name-only origin/main --diff-filter=M content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')

if [[ -n "$NEW_NOTES_PR" ]]; then
  PR_BODY="${PR_BODY}

### New Notes
$(echo "$NEW_NOTES_PR" | sed 's/^/- /')"
fi

if [[ -n "$MODIFIED_NOTES_PR" ]]; then
  PR_BODY="${PR_BODY}

### Updated Notes
$(echo "$MODIFIED_NOTES_PR" | sed 's/^/- /')"
fi

PR_BODY="${PR_BODY}

### Checklist
- [ ] Review note content
- [ ] Check frontmatter is correct
- [ ] Verify wikilinks work"

gh pr create \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --base main \
  --head "$BRANCH_NAME" \
  --web

echo ""
echo "✅ Done! PR created and opened in browser."
echo ""
echo "Next steps:"
echo "  1. Review the PR"
echo "  2. Merge when ready"
echo "  3. Vercel will auto-deploy"
