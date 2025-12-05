import { NoteRow } from "./note-row"
import type { Note } from "@/lib/vault"

interface NoteConnectionsProps {
  backlinks: string[]
  relatedNotes: Note[]
  allNotes: Note[]
}

export function NoteConnections({ backlinks, relatedNotes, allNotes }: NoteConnectionsProps) {
  const hasBacklinks = backlinks.length > 0
  const hasRelated = relatedNotes.length > 0

  if (!hasBacklinks && !hasRelated) return null

  // Get backlink note objects
  const backlinkNotes = backlinks
    .map((slug) => allNotes.find(n => n.slug === slug))
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
              {relatedNotes.map((relatedNote) => (
                <NoteRow key={relatedNote.slug} note={relatedNote} showDate={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
