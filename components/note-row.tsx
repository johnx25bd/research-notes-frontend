import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { Note } from "@/lib/vault"

interface NoteRowProps {
  note: Note
  showDate?: boolean
  showStatus?: boolean
  wrapSummary?: boolean
  /** If set, the row links out to this URL in a new tab instead of the internal note page. */
  externalUrl?: string
}

export function NoteRow({
  note,
  showDate = true,
  showStatus = true,
  wrapSummary = false,
  externalUrl,
}: NoteRowProps) {
  const className = "note-entry group block py-4 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded"

  const inner = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">
            {note.title}
          </h3>
          {showStatus && <StatusBadge status={note.status} />}
        </div>
        <p className={`text-base text-muted-foreground ${wrapSummary ? "" : "line-clamp-1"}`}>{note.summary}</p>
      </div>
      {showDate && (
        <span className="text-xs text-muted-foreground shrink-0 mt-1" style={{ fontFamily: "var(--font-ui)" }}>
          {new Date(note.lastTended).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      )}
    </div>
  )

  if (externalUrl) {
    return (
      <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }

  return (
    <Link href={`/${note.area ?? "notes"}/${note.slug}`} className={className}>
      {inner}
    </Link>
  )
}
