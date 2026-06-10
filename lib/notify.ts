// Selection and email-building logic for new-post notifications.
//
// A note is announced to subscribers only when it is explicitly flagged
// (`notify: true` in frontmatter) and has not been announced before
// (`notified_at` unset). This is deliberately decoupled from deploys --
// publishing a note does not email anyone; running `pnpm notify` does.
//
// Kept pure (no I/O, no Resend, no dates) so it can be unit-tested. The
// script in scripts/notify-subscribers.ts wires it to the filesystem and Resend.

export interface NoteFrontmatter {
  title?: string
  summary?: string
  description?: string
  published?: boolean
  notify?: boolean
  notified_at?: string
  stub?: boolean
  url?: string
}

export interface NotifyCandidate {
  /** Path relative to content/notes, used for stable slug + logging. */
  file: string
  data: NoteFrontmatter
}

/**
 * Pick the notes that should generate a notification broadcast: published,
 * flagged with `notify: true`, not already announced, and not a stub.
 */
export function selectNotesToNotify(candidates: NotifyCandidate[]): NotifyCandidate[] {
  return candidates.filter(
    (c) =>
      c.data.published === true &&
      c.data.notify === true &&
      !c.data.notified_at &&
      c.data.stub !== true,
  )
}

/** Mirror of the slug derivation in lib/vault.ts so links match the live site. */
export function slugFromFile(file: string): string {
  const base = file.replace(/\.md$/i, "").split("/").pop() ?? file
  return base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[—–]/g, "-")
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
}

export function noteUrl(candidate: NotifyCandidate, siteUrl: string): string {
  if (candidate.data.url) return candidate.data.url
  const base = siteUrl.replace(/\/$/, "")
  return `${base}/notes/${slugFromFile(candidate.file)}`
}

export interface NotificationEmail {
  subject: string
  previewText: string
  html: string
  text: string
}

/**
 * Build the broadcast content for a single newly-announced note. Plain and
 * personal -- it reads as a short note from John, not a marketing blast.
 * Resend appends the unsubscribe footer to broadcasts automatically.
 */
export function buildNotificationEmail(
  candidate: NotifyCandidate,
  siteUrl: string,
): NotificationEmail {
  const title = candidate.data.title?.trim() || slugFromFile(candidate.file)
  const summary = (candidate.data.summary || candidate.data.description || "").trim()
  const url = noteUrl(candidate, siteUrl)

  const subject = `New note: ${title}`
  const previewText = summary || `A new note is up on the garden.`

  const lines = [
    `I just published a new note: ${title}.`,
    summary,
    `Read it here: ${url}`,
    "",
    "If it sparks anything, just reply -- this comes straight to my inbox.",
    "",
    "John",
  ].filter((line, i) => line !== "" || i > 0)

  const text = lines.join("\n\n").replace(/\n\n\n+/g, "\n\n")

  const summaryHtml = summary
    ? `<p style="margin:0 0 16px;color:#444;">${escapeHtml(summary)}</p>`
    : ""

  const html = [
    `<div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1a1a1f;">`,
    `<p style="margin:0 0 16px;">I just published a new note: <strong>${escapeHtml(title)}</strong>.</p>`,
    summaryHtml,
    `<p style="margin:0 0 24px;"><a href="${escapeHtml(url)}" style="color:#1a1a1f;">Read it here →</a></p>`,
    `<p style="margin:0 0 16px;color:#444;">If it sparks anything, just reply -- this comes straight to my inbox.</p>`,
    `<p style="margin:0;">John</p>`,
    `</div>`,
  ]
    .filter(Boolean)
    .join("\n")

  return { subject, previewText, html, text }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
