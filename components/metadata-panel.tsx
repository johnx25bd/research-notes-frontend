import Link from "next/link"
import { StatusBadge } from "./status-badge"
import { TagChip } from "./tag-chip"
import type { Note } from "@/lib/mock-data"
import { getNoteBySlug } from "@/lib/mock-data"

interface MetadataPanelProps {
  note: Note
}

export function MetadataPanel({ note }: MetadataPanelProps) {
  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Details</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge status={note.status} />
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Last tended</dt>
            <dd className="text-foreground">
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>

        {note.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <TagChip key={tag} tag={tag} href={`/tags/${tag}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backlinks */}
      {note.backlinks.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Linked from</h3>
          <ul className="space-y-2">
            {note.backlinks.map((slug) => {
              const linkedNote = getNoteBySlug(slug)
              return linkedNote ? (
                <li key={slug}>
                  <Link href={`/notes/${slug}`} className="text-sm text-primary hover:underline decoration-primary/30">
                    {linkedNote.title}
                  </Link>
                </li>
              ) : null
            })}
          </ul>
        </div>
      )}

      {/* Related notes */}
      {note.relatedNotes.length > 0 && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Related notes</h3>
          <ul className="space-y-2">
            {note.relatedNotes.map((slug) => {
              const relatedNote = getNoteBySlug(slug)
              return relatedNote ? (
                <li key={slug}>
                  <Link href={`/notes/${slug}`} className="text-sm text-primary hover:underline decoration-primary/30">
                    {relatedNote.title}
                  </Link>
                </li>
              ) : null
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
