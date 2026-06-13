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
REPO_DIR="/Users/x25bd/code/johnx/front"
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

# Resolve the publish working tree and prepare the branch BEFORE syncing, so
# content always lands in the directory we'll commit from. The publish branch
# may already be checked out in a separate worktree (e.g. a dedicated
# front-publish worktree); git refuses to check it out a second time here, so
# in that case we publish directly from that worktree instead.
if [[ "$USE_EXISTING" == "true" ]]; then
  BRANCH_NAME="$EXISTING_BRANCH"
  WORK_DIR=$(git worktree list --porcelain | awk -v ref="branch refs/heads/$BRANCH_NAME" '
    /^worktree /{wt=substr($0, 10)}
    $0==ref{print wt; exit}')
  if [[ -n "$WORK_DIR" ]]; then
    echo ""
    echo "🌿 Branch already checked out in worktree: $WORK_DIR"
    git -C "$WORK_DIR" fetch origin "$BRANCH_NAME" -q
  else
    WORK_DIR="$REPO_DIR"
    echo ""
    echo "🌿 Switching to existing branch: $BRANCH_NAME"
    git -C "$WORK_DIR" fetch origin "$BRANCH_NAME"
    git -C "$WORK_DIR" checkout "$BRANCH_NAME"
  fi
  # Bring in the latest main (notes depend on code merged there, e.g. the
  # markdown renderer). Merge rather than rebase: the branch is shared/pushed,
  # and a merge avoids rewriting history that other worktrees may hold.
  echo "🔄 Merging main..."
  if ! git -C "$WORK_DIR" merge main --no-edit; then
    echo "⚠️  Merge conflict in $WORK_DIR — resolve manually, then re-run."
    exit 1
  fi
else
  # New PR: stay on main and sync here; the branch is created after we confirm
  # there's something to publish, so we never leave an empty branch behind.
  WORK_DIR="$REPO_DIR"
fi

# Sync research-notes → the resolved publish working tree
echo ""
echo "📦 Syncing to frontend..."
bash "$REPO_DIR/scripts/sync-vault.sh" "$WORK_DIR"

# Check if there are changes (content or attachments)
if [[ -z $(git -C "$WORK_DIR" status --porcelain content/ public/attachments/) ]]; then
  echo ""
  echo "✅ No new notes to publish!"
  exit 0
fi

# For a new PR, create the branch now that we know there are changes; the
# untracked synced files carry over onto it.
if [[ "$USE_EXISTING" != "true" ]]; then
  TIMESTAMP=$(date +%Y%m%d-%H%M%S)
  BRANCH_NAME="${BRANCH_PREFIX}-${TIMESTAMP}"
  echo ""
  echo "🌿 Creating branch: $BRANCH_NAME"
  git -C "$WORK_DIR" checkout -b "$BRANCH_NAME"
fi

# Show what will be published
echo ""
echo "📋 Changes to be published:"
git -C "$WORK_DIR" status --short content/ public/attachments/

# Stage changes
git -C "$WORK_DIR" add content/ public/attachments/
[[ -d "$WORK_DIR/.beads" ]] && git -C "$WORK_DIR" add .beads/

# Detect new vs modified notes
NEW_NOTES=$(git -C "$WORK_DIR" diff --cached --name-only --diff-filter=A content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')
MODIFIED_NOTES=$(git -C "$WORK_DIR" diff --cached --name-only --diff-filter=M content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')

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

git -C "$WORK_DIR" commit -m "$COMMIT_MSG"

# Push branch
echo ""
echo "⬆️  Pushing to GitHub..."
if [[ "$USE_EXISTING" == "true" ]]; then
  git -C "$WORK_DIR" push --force-with-lease origin "$BRANCH_NAME"
else
  git -C "$WORK_DIR" push -u origin "$BRANCH_NAME"
fi

# Build PR body (used for both create and update)
PR_TITLE="Publish research notes"

PR_BODY="## Research Notes Update

This PR publishes notes that were tagged with \`#to-publish\` in the vault."

# Get new and modified notes for PR
NEW_NOTES_PR=$(git -C "$WORK_DIR" diff --name-only origin/main --diff-filter=A content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')
MODIFIED_NOTES_PR=$(git -C "$WORK_DIR" diff --name-only origin/main --diff-filter=M content/notes/ | sed 's/content\/notes\///' | sed 's/\.md$//')

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

# Open PR in browser
open "$PR_URL"
