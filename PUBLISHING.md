# Publishing Workflow

This document describes the automated workflow for publishing research notes from your Obsidian vault. For content conventions (images, figures, captions, titles), see [AUTHORING.md](./AUTHORING.md).

## Quick Start

### Option 1: Raycast (Recommended)

1. Write a note in your Obsidian vault
2. Add `to-publish` to the tags in frontmatter:
   ```yaml
   ---
   title: My Research Note
   tags: [research, to-publish]
   status: stable
   ---
   ```
3. Open Raycast → Type "Publish Research Notes"
4. Review the auto-created PR
5. Merge → Deploy!

### Option 2: Manual

```bash
# From the frontend repo
python3 scripts/smart-sync.py

# Review changes
git status

# Commit and push
git add content/
git commit -m "content: Publish new notes"
git push
```

## How It Works

### 1. Smart Sync Script (`scripts/smart-sync.py`)

The smart sync script:
- Scans your Obsidian vault for notes with `#to-publish` tag
- Copies those notes to `content/notes/`
- Removes `#to-publish` from the **published** version
- Updates the **source vault** to mark notes as published:
  - Removes `to-publish` tag
  - Adds `published: true`
  - Adds `published_at: YYYY-MM-DD`

This ensures you never accidentally re-publish the same note.

### 2. Raycast Automation (`scripts/publish-notes.sh`)

The Raycast script:
1. Runs smart sync
2. Creates a new git branch (`content/publish-TIMESTAMP`)
3. Commits changes with proper message
4. Pushes to GitHub
5. Creates a PR with list of published notes
6. Opens PR in browser for review

### 3. Frontmatter Requirements

Your notes must have frontmatter with at least:

```yaml
---
title: Note Title
status: fragment | working | stable
tags: [tag1, tag2, to-publish]  # Include 'to-publish' to publish
---
```

Optional fields:
- `summary` - Short description (used in note cards)
- `featured` - Set to `true` for homepage
- `created` - Creation date
- `notify` - Set to `true` to announce this note to email subscribers (see [Notifying subscribers](#notifying-subscribers))

## Raycast Setup

1. Install Raycast: https://raycast.com
2. Enable Script Commands in Raycast preferences
3. Add this repo's `scripts/` directory to Raycast script directories
4. Make sure you have:
   - Python 3 with PyYAML: `pip3 install -r requirements.txt`
   - GitHub CLI: `brew install gh` and authenticate with `gh auth login`

The script will appear as "Publish Research Notes" in Raycast.

## Post Template

Create a template in Obsidian for new posts:

```yaml
---
title: {{title}}
status: fragment
tags: [to-publish]
created: {{date:YYYY-MM-DD}}
notify: false   # set true to email subscribers when this publishes
---

# {{title}}

Your content here...
```

## Notifying subscribers

Publishing a note **does not** email anyone. Notifications are a separate,
deliberate step so you keep editorial control over what lands in inboxes.

### How subscribers sign up

Visitors subscribe via the form in the site footer (every page) or at
`/subscribe`. Their email is stored as a contact in a **Resend Audience** —
Resend owns the list, the unsubscribe link, and compliance. No database here.

### Announcing a note

1. In the note's frontmatter, set `notify: true` (and make sure it's published).
2. Run the notify command from the frontend repo:
   ```bash
   pnpm notify --dry-run   # preview which notes would be announced
   pnpm notify             # create the draft broadcasts
   ```
3. `pnpm notify` finds published notes flagged `notify: true` that haven't
   been announced yet, and creates a **draft** broadcast in Resend for each —
   it never sends automatically.
4. Review and send the draft at https://resend.com/broadcasts.
5. The command stamps `notified_at: YYYY-MM-DD` into the note's frontmatter so
   it's never announced twice. **Commit that change** (it lands in `content/`).

To re-announce a note (rare), delete its `notified_at` line and run again.

### Required environment variables

These live in `.env.local` (local) and Vercel project settings (production):

- `RESEND_API_KEY` — existing Resend key (also used by the deck-request form)
- `RESEND_AUDIENCE_ID` — the Audience to add subscribers to / broadcast from
- `SUBSCRIBE_FROM` — optional sender, defaults to `"John <john@johnx.co>"`

## Workflow Tips

1. **Draft → Publish**: Write in Obsidian, add `#to-publish` when ready
2. **Updates**: Just add `#to-publish` again to republish with changes
3. **Unpublish**: Remove from `content/notes/` and commit
4. **Preview**: Run `pnpm dev` in frontend repo to preview locally

## Troubleshooting

**"No notes found with #to-publish tag"**
- Make sure the tag is in the frontmatter `tags:` array
- Check the vault path in `scripts/smart-sync.py` is correct

**"PyYAML not found"**
```bash
pip3 install -r requirements.txt
```

**"gh not found"**
```bash
brew install gh
gh auth login
```

**Notes aren't syncing**
- Verify vault paths: xo at `/Users/x25bd/notes/xo`, research-notes at `/Users/x25bd/notes/research-notes`
- Check file permissions
- Try running `python3 scripts/smart-sync.py` manually to see errors

## Architecture

```
Obsidian Vault (source of truth)
  └── notes/
      └── my-note.md (with #to-publish tag)
              ↓
      [smart-sync.py scans and copies]
              ↓
Frontend Repo (published version)
  └── content/notes/
      └── my-note.md (published: true)
              ↓
      [Next.js builds static site]
              ↓
      [Vercel deploys]
              ↓
      https://johnx.co/notes/my-note
```

## Future Improvements

- [ ] Add dry-run mode to preview what will be published
- [ ] Support for scheduling posts (publish_at date)
- [ ] Automatic image optimization during sync
- [ ] Validation checks (broken wikilinks, required fields)
- [ ] Analytics on which notes get published most
