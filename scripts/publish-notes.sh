#!/bin/bash
# Raycast Script Command for Publishing Research Notes
#
# Two-vault architecture: xo → research-notes → frontend
#
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Publish Research Notes
# @raycast.mode fullOutput
#
# Optional parameters:
# @raycast.icon △
# @raycast.packageName Research Notes
# @raycast.description Two-stage sync: xo vault → research-notes → frontend repo

set -e

# Configuration
REPO_DIR="/Users/x25bd/Code/johnx/front"
BRANCH_PREFIX="content/publish"

cd "$REPO_DIR"

echo "🔄 Two-vault publishing workflow"
echo "================================"
echo ""

# Check for uncommitted changes
echo "📋 Checking working tree..."
if ! git diff-index --quiet HEAD --; then
  echo "❌ You have uncommitted changes. Please commit or stash them first."
  echo ""
  git status --short
  exit 1
fi

# Get current branch and update it
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Fetch latest from origin (don't checkout main to avoid worktree conflicts)
echo "📥 Fetching latest changes..."
git fetch origin

# If on main, pull latest
if [ "$CURRENT_BRANCH" = "main" ]; then
  git pull origin main --ff-only || {
    echo "❌ Cannot fast-forward main. Please resolve conflicts manually."
    exit 1
  }
fi

# STAGE 1: xo vault → research-notes vault
echo ""
echo "📝 STAGE 1: Syncing xo → research-notes"
echo "---------------------------------------"
# Use the same Python that has PyYAML installed
/Users/x25bd/.pyenv/versions/3.8.10/bin/python3 scripts/smart-sync.py

# STAGE 2: research-notes vault → frontend repo
echo ""
echo "📦 STAGE 2: Syncing research-notes → frontend"
echo "---------------------------------------------"
./scripts/sync-vault.sh

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
COMMIT_MSG="content: Publish notes from xo vault

Two-vault sync: xo → research-notes → frontend"

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

# Create PR and capture the URL
PR_URL=$(gh pr create \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --base main \
  --head "$BRANCH_NAME" 2>&1)

if [[ $? -eq 0 ]]; then
  echo ""
  echo "✅ Pull request created successfully!"
  echo "   $PR_URL"

  # Clean up old merged publish branches to prevent bloat
  echo ""
  echo "🧹 Cleaning up old publish branches..."
  OLD_BRANCHES=$(git branch -r --merged origin/main | grep "origin/$BRANCH_PREFIX" | sed 's|origin/||' | head -n -1)
  if [ -n "$OLD_BRANCHES" ]; then
    echo "$OLD_BRANCHES" | while read branch; do
      git push origin --delete "$branch" 2>/dev/null && echo "   Deleted: $branch" || true
    done
  else
    echo "   No old branches to clean up"
  fi

  echo ""
  echo "Opening PR in browser..."
  open "$PR_URL" || echo "Could not open browser automatically. Please visit: $PR_URL"
  echo ""
  echo "Next steps:"
  echo "  1. Review the PR"
  echo "  2. Merge when ready"
  echo "  3. Vercel will auto-deploy"
else
  echo ""
  echo "❌ Failed to create pull request:"
  echo "$PR_URL"
  exit 1
fi
