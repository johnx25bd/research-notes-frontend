# Authoring notes

Conventions for writing note content. The publishing workflow itself is in
[PUBLISHING.md](./PUBLISHING.md).

## Images and figures

Images use Obsidian's embed syntax. A plain embed renders as a normal inline
image:

```markdown
![[diagram.svg]]
```

Attachments can live anywhere in the vault — a dedicated `Attachments/` folder,
or right next to the note. The publish step finds them by name and copies them
into `public/attachments/`.

### Sizing

Add a sizing hint after a `|`:

| Hint | Result |
|------|--------|
| `![[diagram.svg\|75%]]` | 75% of the text column, centered |
| `![[diagram.svg\|400]]` | 400px wide (a bare number = pixels) |
| `![[diagram.svg\|wide]]` | bleeds past the column margins, wider on bigger screens |
| `![[diagram.svg\|full]]` | bleeds to the full viewport width |

`wide` is the one to reach for when a diagram needs room to breathe. It mirrors
the breakout used by the inline map figures.

### Captions

Put the caption in a **blockquote directly under the image**. It can span
multiple lines and contain markdown:

```markdown
![[diagram.svg|wide]]
> The headline point the figure makes.
> A second line with more detail, if you want it.
```

A single italic line under the image also works (`*like this*`), but a
blockquote is the one to remember because it handles multiple lines.

### Titles

An optional **bold line directly above the image** becomes a figure title:

```markdown
**Location precision across policy scales**
![[diagram.svg|wide]]
> Caption goes here.
```

### How it renders

A sizing hint, a caption, or a title turns the embed into a single `<figure>`:
a bold title on top, the image, then a muted caption at the image's width. The
figure has an opaque background and sits above the page's meridian line, so a
wide image never gets cut across by it. A plain `![[image.png]]` with none of
these stays a bare inline image.

Blank lines between the title, image, and caption are optional — adjacent lines
work too, which is how it reads naturally in Obsidian.

### Where this lives (for fixing later)

- Parsing and figure assembly: `rehypeImageFigures` in `lib/markdown.ts`. It
  reads the sizing hint off the embed, then pulls in an adjacent title
  (bold) and caption (blockquote or italic line).
- Styling — the bleed widths, the opaque background, the caption and title
  type — is in `app/globals.css` under the `.note-figure` rules.
- Behavior is pinned by tests in `lib/__tests__/markdown.test.ts` (the
  "Image embeds" group).
