"use client"

import Link from "next/link"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { StatusBadge } from "@/components/status-badge"
import { getNoteBySlug } from "@/lib/mock-data"

interface NoteLinkProps {
  noteTitle: string
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function NoteLink({ noteTitle }: NoteLinkProps) {
  const slug = slugify(noteTitle)
  const note = getNoteBySlug(slug)

  // If note doesn't exist, show as broken link
  if (!note) {
    return <span className="text-muted-foreground line-through decoration-muted-foreground/50">{noteTitle}</span>
  }

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Link
          href={`/notes/${slug}`}
          className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary transition-all duration-200"
        >
          {noteTitle}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-4 border-border/50" side="top" align="start">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-medium text-sm leading-snug">{note.title}</h4>
            <StatusBadge status={note.status} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{note.summary}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
