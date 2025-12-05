import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { Note } from "@/lib/mock-data"

interface NoteRowProps {
  note: Note
  showDate?: boolean
  showStatus?: boolean
}

export function NoteRow({ note, showDate = true, showStatus = true }: NoteRowProps) {
  return (
    <Link
      href={`/notes/${note.slug}`}
      className="note-entry group block py-4 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-medium text-lg text-foreground group-hover:text-primary transition-colors">
              {note.title}
            </h3>
            {showStatus && <StatusBadge status={note.status} />}
          </div>
          <p className="text-base text-muted-foreground line-clamp-1">{note.summary}</p>
        </div>
        {showDate && (
          <span className="text-xs text-muted-foreground shrink-0 mt-1" style={{ fontFamily: "var(--font-ui)" }}>
            {new Date(note.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  )
}
