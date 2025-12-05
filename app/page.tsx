"use client"

import { useState } from "react"
import { LayoutShell } from "@/components/layout-shell"
import { NoteRow } from "@/components/note-row"
import { RandomNoteButton } from "@/components/random-note-button"
import { notes, tags } from "@/lib/mock-data"
import Link from "next/link"

const NOTES_PER_PAGE = 5

export default function HomePage() {
  const featuredNotes = notes.filter((note) => note.featured).slice(0, 4)

  const allRecentNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const [visibleCount, setVisibleCount] = useState(NOTES_PER_PAGE)
  const recentNotes = allRecentNotes.slice(0, visibleCount)
  const hasMore = visibleCount < allRecentNotes.length

  const topThemes = tags.slice(0, 6)

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <section className="mb-20">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up text-balance">
            Lines of inquiry.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Working notes from ongoing projects and questions. These are updated over time; links are stable,
            conclusions are not.
          </p>
        </section>

        <section className="mb-16">
          <h2
            className="section-header text-sm tracking-[0.15em] opacity-60 mb-1"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Orient
          </h2>
          <div className="space-y-0">
            {featuredNotes.map((note) => (
              <NoteRow key={note.slug} note={note} showDate={false} showStatus={false} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2
            className="section-header text-sm tracking-[0.15em] opacity-60 mb-1"
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

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={{ fontFamily: "var(--font-ui)" }}>
            Browse by Theme
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2" style={{ fontFamily: "var(--font-ui)" }}>
            {topThemes.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${tag.name}`}
                className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-8 border-t border-border/50">
          <RandomNoteButton />
        </section>
      </div>
    </LayoutShell>
  )
}
