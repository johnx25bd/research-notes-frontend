"use client"

import { useState } from "react"
import { NoteRow } from "@/components/note-row"
import type { Note } from "@/lib/vault"

const NOTES_PER_PAGE = 5

interface RecentNotesSectionProps {
  notes: Note[]
}

export function RecentNotesSection({ notes }: RecentNotesSectionProps) {
  const [visibleCount, setVisibleCount] = useState(NOTES_PER_PAGE)
  const recentNotes = notes.slice(0, visibleCount)
  const hasMore = visibleCount < notes.length

  return (
    <section className="mb-16">
      <h2
        className="section-header text-lg tracking-[0.15em] opacity-60"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        Latest Revisions
      </h2>
      <div className="space-y-0">
        {recentNotes.map((note) => (
          <NoteRow key={note.slug} note={note} showStatus={false} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((prev) => prev + NOTES_PER_PAGE)}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          Load more notes...
        </button>
      )}
    </section>
  )
}
