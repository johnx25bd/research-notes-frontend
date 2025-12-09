import Link from "next/link"
import { StatusBadge } from "./status-badge"
import { TagChip } from "./tag-chip"
import type { Note } from "@/lib/vault"

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
              {new Date(note.lastTended).toLocaleDateString("en-US", {
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

    </div>
  )
}
