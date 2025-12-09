# Frontmatter Fields for Research Notes

This document explains the frontmatter fields used in research notes for the two-vault publishing architecture.

## Publishing Flow

```
xo vault (private)
    ↓ smart-sync.py (add to-publish tag)
research-notes vault (intermediate)
    ↓ sync-vault.sh
frontend repo (public site)
```

## Required Fields

### `title`
**Type**: String
**Required**: Yes
**Example**: `title: Dukkha`

The title of your note. Used for display and slug generation.

### `status`
**Type**: String (`fragment` | `working` | `stable`)
**Required**: Yes
**Example**: `status: fragment`

Indicates the maturity level of the note:
- `fragment` — A nascent idea, barely formed
- `working` — Taking shape but not complete
- `stable` — Mature, well-developed, and relatively stable

### `tags`
**Type**: Array of strings
**Required**: Yes (must include `to-publish` to publish)
**Example**:
```yaml
tags:
  - to-publish
  - philosophy
  - posts
```

**Important**: Add `to-publish` tag when ready to publish. The sync script will:
1. Remove `to-publish` from the published version
2. Mark the note as `published: true` in both xo and research-notes vaults
3. Sync to research-notes, then to frontend

## Optional Fields

### `summary`
**Type**: String
**Example**: `summary: Exploring the nature of suffering and constant change`

Brief description used in note cards and social sharing. If not provided, the site uses a generic description.

### `created`
**Type**: Date (YYYY-MM-DD)
**Example**: `created: 2025-12-09`

Creation date. Useful for tracking when ideas originated.

### `featured`
**Type**: Boolean
**Example**: `featured: true`

Set to `true` to feature this note on the homepage.

## Auto-Generated Fields (Don't Set These)

The following fields are automatically added by the publishing system:

### `published`
**Type**: Boolean
**Auto-set by**: smart-sync.py

Set to `true` when synced to research-notes. Notes with `published: false` (like stubs) are filtered from the frontend.

### `published_at`
**Type**: Date (YYYY-MM-DD)
**Auto-set by**: smart-sync.py

The date when the note was first published.

### `source_note`
**Type**: String (Obsidian URI)
**Auto-set by**: smart-sync.py
**Example**: `source_note: obsidian://open?vault=xo&file=Notes/Dukkha`

Obsidian URI link back to the source note in the xo vault. Only exists in research-notes vault for easy editing access. **Not visible on the published site.**

### `stub`
**Type**: Boolean
**Auto-set by**: smart-sync.py

Set to `true` for auto-generated stub notes (unpublished wikilink references). Stubs are filtered from the frontend.

## Template for New Notes

Use the "Research Note Template" in your xo vault's Templates folder:

```yaml
---
title: {{title}}
status: fragment
tags:
  - to-publish
created: {{date:YYYY-MM-DD}}
summary:
---

# {{title}}

Your research note content here...
```

## Publishing Workflow

1. **Create a note** in xo vault using the template
2. **Add content** and develop your idea
3. **When ready to publish**: Tag is already there (`to-publish`)
4. **Run sync**:
   - Command line: `python3 scripts/smart-sync.py`
   - Raycast: "Publish Research Notes"
5. **Review**: Check research-notes vault to see synced note with `source_note` link
6. **Deploy**: The note will sync to frontend and go live

## Wikilinks & Stub Notes

When you reference other notes using `[[wikilinks]]`:
- If the linked note is published → Works as normal link
- If the linked note is **not published** → Auto-generates a stub note in research-notes with `published: false`
- Stubs are visible in research-notes but **filtered from the live site**
- On the live site, unpublished wikilinks appear as muted text with `[[brackets]]` and are not clickable

## Example Note

```yaml
---
title: The Art of Noticing
status: working
tags:
  - to-publish
  - attention
  - mindfulness
created: 2025-12-09
summary: How cultivating attention transforms our relationship with the world
---

# The Art of Noticing

The practice of paying attention is not passive observation—it's an active engagement with reality. When we [[notice deeply]], we create space for [[wonder]] to emerge.

## Related Ideas
- [[Beginner's Mind]]
- [[Present Moment Awareness]]
```

In this example:
- If "Beginner's Mind" and "Present Moment Awareness" are published → They link normally
- If they're not published → Stubs are created, links appear muted on the site
- "notice deeply" and "wonder" would also get stubs if not published
