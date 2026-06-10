#!/usr/bin/env tsx
//
// Draft a subscriber notification for each newly-flagged note.
//
//   pnpm notify              create draft broadcasts + stamp notified_at
//   pnpm notify --dry-run    show what would be drafted, change nothing
//
// A note is announced when its frontmatter has `published: true` and
// `notify: true` and it has not been announced before (`notified_at` unset).
// This is intentionally NOT tied to deploys -- publishing a note emails no one;
// running this command does, and even then only as a DRAFT in Resend that you
// review and send yourself.
//
// Requires RESEND_API_KEY and RESEND_AUDIENCE_ID (loaded from .env.local).

import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { Resend } from "resend"
import {
  selectNotesToNotify,
  buildNotificationEmail,
  noteUrl,
  type NotifyCandidate,
} from "../lib/notify"

const NOTES_DIR = path.join(process.cwd(), "content", "notes")
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://johnx.co"
const BROADCAST_FROM = process.env.SUBSCRIBE_FROM ?? "John <john@johnx.co>"
const DRY_RUN = process.argv.includes("--dry-run")

// Load .env.local for local runs (Next.js does this automatically at runtime,
// a standalone tsx script does not). Node >=20.6 provides loadEnvFile.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env.local"))
} catch {
  // No .env.local -- rely on whatever is already in the environment.
}

function todayIso(): string {
  // Local YYYY-MM-DD, matching the published_at format written by smart-sync.py.
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Set a frontmatter field by editing the YAML block textually, leaving every
 * other line untouched. Re-serializing via gray-matter would reorder and
 * reflow the whole block and produce noisy diffs on already-published notes.
 */
function setFrontmatterField(raw: string, key: string, value: string): string {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) throw new Error("no frontmatter block found")

  const block = fmMatch[1]
  const line = `${key}: '${value}'`
  const keyLine = new RegExp(`^${key}:.*$`, "m")

  const newBlock = keyLine.test(block)
    ? block.replace(keyLine, line)
    : `${block}\n${line}`

  return raw.replace(fmMatch[0], `---\n${newBlock}\n---`)
}

async function readCandidates(): Promise<Array<NotifyCandidate & { raw: string; abs: string }>> {
  const files = await fs.readdir(NOTES_DIR, { recursive: true })
  const mdFiles = files.filter((f): f is string => typeof f === "string" && f.endsWith(".md"))

  return Promise.all(
    mdFiles.map(async (file) => {
      const abs = path.join(NOTES_DIR, file)
      const raw = await fs.readFile(abs, "utf-8")
      const { data } = matter(raw)
      return { file, data, raw, abs }
    }),
  )
}

async function main() {
  const all = await readCandidates()
  const eligible = selectNotesToNotify(all)

  if (eligible.length === 0) {
    console.log("No notes flagged for notification. Nothing to do.")
    console.log("(Flag a published note with `notify: true` in its frontmatter.)")
    return
  }

  console.log(
    `${eligible.length} note${eligible.length === 1 ? "" : "s"} to announce:\n`,
  )
  for (const note of eligible) {
    console.log(`  • ${note.data.title ?? note.file}  →  ${noteUrl(note, SITE_URL)}`)
  }
  console.log("")

  if (DRY_RUN) {
    console.log("Dry run -- no broadcasts created, no frontmatter changed.")
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    console.error("Missing RESEND_API_KEY or RESEND_AUDIENCE_ID. Aborting.")
    process.exit(1)
  }

  const resend = new Resend(apiKey)
  const matched = all as Array<NotifyCandidate & { raw: string; abs: string }>

  for (const note of eligible) {
    const email = buildNotificationEmail(note, SITE_URL)

    const broadcast = await resend.broadcasts.create({
      audienceId,
      from: BROADCAST_FROM,
      replyTo: "john@johnx.co",
      subject: email.subject,
      previewText: email.previewText,
      html: email.html,
      text: email.text,
      name: `New note: ${note.data.title ?? note.file}`,
      // Draft only -- never auto-send. Review and send from the Resend dashboard.
      send: false,
    })

    if (broadcast.error || !broadcast.data) {
      console.error(`  ✗ ${note.file}: failed to draft broadcast`, broadcast.error)
      continue
    }

    // Stamp notified_at so this note is never drafted again.
    const source = matched.find((m) => m.file === note.file)
    if (source) {
      const updated = setFrontmatterField(source.raw, "notified_at", todayIso())
      await fs.writeFile(source.abs, updated, "utf-8")
    }

    console.log(`  ✓ ${note.file}: draft created (broadcast ${broadcast.data.id})`)
  }

  console.log(
    "\nDrafts created in Resend. Review and send them at https://resend.com/broadcasts",
  )
  console.log("Commit the updated frontmatter (notified_at) so the notes aren't re-drafted.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
