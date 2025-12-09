import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { Note } from "@/lib/vault"

interface NoteCardProps {
  note: Note
  showTags?: boolean
  showDate?: boolean
}

export function NoteCard({ note, showTags = true, showDate = true }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${note.slug}`}
      className="block p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-card-foreground leading-snug">{note.title}</h3>
        <StatusBadge status={note.status} className="shrink-0" />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{note.summary}</p>

      <div className="flex items-center justify-between gap-3">
        {showTags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {showDate && (
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(note.lastTended).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </Link>
  )
}
