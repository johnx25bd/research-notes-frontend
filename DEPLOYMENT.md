# Deployment Workflow

Simple workflow for publishing notes to your digital garden.

## Overview

1. **Write** notes in Obsidian (`/Users/x25bd/notes/research-notes`)
2. **Sync** notes to frontend repo with `./scripts/sync-vault.sh`
3. **Review** changes with `git status`
4. **Commit** with a meaningful message
5. **Push** to trigger automatic Vercel deployment

## Publishing Notes

### Step 1: Edit in Obsidian

Write and edit your notes in Obsidian as usual. The vault is located at:
```
/Users/x25bd/notes/research-notes
```

### Step 2: Sync to Frontend

From the frontend repo:
```bash
cd /Users/x25bd/Code/johnx/front
./scripts/sync-vault.sh
```

This copies notes from your Obsidian vault to `./content/notes/` in the frontend repo.

### Step 3: Review Changes

```bash
git status
git diff content/
```

### Step 4: Commit

```bash
git add content/
git commit -m "Add new note on Web3 design principles"
```

### Step 5: Push

```bash
git push
```

Vercel will automatically build and deploy your changes (~2 minutes).

## Validation

The build includes automatic validation that checks:
- ✅ Required frontmatter fields (title, status)
- ⚠️  Sensitive keywords in content
- ℹ️  Broken wikilinks

Run validation locally before committing:
```bash
pnpm validate
```

If validation fails with errors, the build will fail and won't deploy.

## Build Process

When you push to GitHub:

1. **Vercel triggered** - Detects push to main branch
2. **Install dependencies** - `pnpm install`
3. **Validate notes** - `pnpm validate` (checks all notes)
4. **Build site** - `pnpm build` (processes markdown, generates static pages)
5. **Deploy** - Site goes live at your production URL

Markdown processing happens during build:
- Parses frontmatter (title, status, tags, etc.)
- Converts markdown to HTML with remark/rehype
- Processes wikilinks `[[Note Title]]` → clickable links with hover previews
- Handles callouts and GFM features

## File Structure

```
research-notes-frontend/
├── content/              # Synced from Obsidian (git tracked)
│   ├── notes/           # Markdown files
│   └── attachments/     # Images, PDFs, etc.
├── scripts/
│   ├── sync-vault.sh    # Sync script
│   └── validate.ts      # Validation script
├── lib/
│   └── vault.ts         # Reads notes from content/notes/
└── app/
    └── notes/[slug]/    # Note pages
```

## Troubleshooting

### Build fails with validation errors

Check the error message and fix the note(s):
- Missing title in frontmatter
- Invalid status value
- Run `pnpm validate` locally to see all issues

### Notes not appearing

1. Did you run `./scripts/sync-vault.sh`?
2. Did you commit the `content/` directory?
3. Check Vercel build logs for errors

### Local development

```bash
./scripts/sync-vault.sh  # Sync latest notes
pnpm dev                 # Start dev server
```

Visit http://localhost:3000
