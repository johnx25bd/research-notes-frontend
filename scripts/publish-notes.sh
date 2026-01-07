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

# Check if there are changes (content or attachments)
if [[ -z $(git status --porcelain content/ public/attachments/) ]]; then
  echo ""
  echo "✅ No new notes to publish!"
  exit 0
fi

# Show what will be published
echo ""
echo "📋 Changes to be published:"
git status --short content/ public/attachments/

# Check for existing open PR with our title
echo ""
echo "🔍 Checking for existing open PR..."
EXISTING_PR=$(gh pr list --state open --json number,headRefName,title \
  --jq '.[] | select(.title == "Publish research notes") | "\(.number) \(.headRefName)"')

if [[ -n "$EXISTING_PR" ]]; then
  PR_NUMBER=$(echo "$EXISTING_PR" | awk '{print $1}')
  EXISTING_BRANCH=$(echo "$EXISTING_PR" | awk '{print $2}')
  echo "📌 Found existing PR #$PR_NUMBER on branch: $EXISTING_BRANCH"
  USE_EXISTING=true
else
  echo "📝 No existing PR, will create new"
  USE_EXISTING=false
fi

# Handle branching
if [[ "$USE_EXISTING" == "true" ]]; then
  BRANCH_NAME="$EXISTING_BRANCH"
  echo ""
  echo "🌿 Switching to existing branch: $BRANCH_NAME"
  git fetch origin "$BRANCH_NAME"
  git checkout "$BRANCH_NAME"
  # Rebase on main to get latest changes
  echo "🔄 Rebasing on main..."
  if ! git rebase main; then
    echo "⚠️  Rebase conflict, falling back to merge..."
    git rebase --abort
    git merge main -m "Merge main into publish branch"
  fi
else
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BRANCH_NAME="${BRANCH_PREFIX}-${TIMESTAMP}"
  echo ""
  echo "🌿 Creating branch: $BRANCH_NAME"
  git checkout -b "$BRANCH_NAME"
fi

# Stage changes
git add content/ public/attachments/ .beads/

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
if [[ "$USE_EXISTING" == "true" ]]; then
  git push --force-with-lease origin "$BRANCH_NAME"
else
  git push -u origin "$BRANCH_NAME"
fi

# Build PR body (used for both create and update)
PR_TITLE="Publish research notes"

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

# Either update existing PR or create new one
if [[ "$USE_EXISTING" == "true" ]]; then
  echo ""
  echo "🔀 Updating existing PR #$PR_NUMBER..."
  gh pr edit "$PR_NUMBER" --body "$PR_BODY"
  PR_URL=$(gh pr view "$PR_NUMBER" --json url --jq '.url')
  echo ""
  echo "✅ Done! Updated PR: $PR_URL"
else
  echo ""
  echo "🔀 Creating pull request..."
  PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base main \
    --head "$BRANCH_NAME")
  echo ""
  echo "✅ Done! PR created: $PR_URL"
fi

echo ""
echo "Next steps:"
echo "  1. Review the PR"
echo "  2. Merge when ready"
echo "  3. Vercel will auto-deploy"
