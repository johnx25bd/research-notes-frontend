import Link from "next/link"
import { getNoteBySlug } from "@/lib/mock-data"
import type { Note } from "@/lib/mock-data"

interface NoteConnectionsProps {
  note: Note
}

export function NoteConnections({ note }: NoteConnectionsProps) {
  const hasBacklinks = note.backlinks.length > 0
  const hasRelated = note.relatedNotes.length > 0

  if (!hasBacklinks && !hasRelated) return null

  return (
    <section className="mt-16 pt-8 border-t border-border/50">
      <h2 className="text-lg font-medium text-foreground mb-6">Connections</h2>

      <div className="space-y-8">
        {hasBacklinks && (
          <div>
            <h3
              className="text-xs uppercase tracking-wider text-muted-foreground mb-3"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Linked from
            </h3>
            <ul className="space-y-2">
              {note.backlinks.map((slug) => {
                const linkedNote = getNoteBySlug(slug)
                return linkedNote ? (
                  <li key={slug}>
                    <Link
                      href={`/notes/${slug}`}
                      className="text-primary hover:underline decoration-primary/30 underline-offset-2"
                    >
                      {linkedNote.title}
                    </Link>
                    <span className="text-muted-foreground"> — {linkedNote.summary}</span>
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )}

        {hasRelated && (
          <div>
            <h3
              className="text-xs uppercase tracking-wider text-muted-foreground mb-3"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Related notes
            </h3>
            <ul className="space-y-2">
              {note.relatedNotes.map((slug) => {
                const relatedNote = getNoteBySlug(slug)
                return relatedNote ? (
                  <li key={slug}>
                    <Link
                      href={`/notes/${slug}`}
                      className="text-primary hover:underline decoration-primary/30 underline-offset-2"
                    >
                      {relatedNote.title}
                    </Link>
                    <span className="text-muted-foreground"> — {relatedNote.summary}</span>
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
