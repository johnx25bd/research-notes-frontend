import { NoteRow } from "./note-row"
import { getNoteBySlug } from "@/lib/mock-data"
import type { Note } from "@/lib/mock-data"

interface NoteConnectionsProps {
  note: Note
}

export function NoteConnections({ note }: NoteConnectionsProps) {
  const hasBacklinks = note.backlinks.length > 0
  const hasRelated = note.relatedNotes.length > 0

  if (!hasBacklinks && !hasRelated) return null

  const backlinkNotes = note.backlinks.map((slug) => getNoteBySlug(slug)).filter((n): n is Note => n !== undefined)

  const relatedNoteObjects = note.relatedNotes
    .map((slug) => getNoteBySlug(slug))
    .filter((n): n is Note => n !== undefined)

  return (
    <section className="mt-16 pt-8" style={{ borderTop: "1px solid var(--entry-divider)" }}>
      <h2 className="section-header text-sm mb-6" style={{ fontFamily: "var(--font-ui)" }}>
        Connections
      </h2>

      <div className="space-y-8">
        {hasBacklinks && (
          <div>
            <h3 className="section-header text-xs mb-4" style={{ fontFamily: "var(--font-ui)" }}>
              Linked From
            </h3>
            <div className="space-y-0">
              {backlinkNotes.map((linkedNote) => (
                <NoteRow key={linkedNote.slug} note={linkedNote} showDate={false} />
              ))}
            </div>
          </div>
        )}

        {hasRelated && (
          <div>
            <h3 className="section-header text-xs mb-4" style={{ fontFamily: "var(--font-ui)" }}>
              Related Notes
            </h3>
            <div className="space-y-0">
              {relatedNoteObjects.map((relatedNote) => (
                <NoteRow key={relatedNote.slug} note={relatedNote} showDate={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
