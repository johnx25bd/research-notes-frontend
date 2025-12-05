import { LayoutShell } from "@/components/layout-shell"
import { NoteRow } from "@/components/note-row"
import { RandomNoteButton } from "@/components/random-note-button"
import { notes, tags } from "@/lib/mock-data"
import Link from "next/link"

export default function HomePage() {
  const featuredNotes = notes.filter((note) => note.featured).slice(0, 4)

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const topThemes = tags.slice(0, 6)

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <section className="mb-20">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up text-balance">
            Welcome to the garden
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A collection of evolving notes—ideas that grow and connect over time. Wander through the links, or start
            somewhere below.
          </p>
        </section>

        <section className="mb-16">
          <h2
            className="text-xs uppercase tracking-wider text-muted-foreground mb-6"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Start here
          </h2>
          <div className="space-y-0">
            {featuredNotes.map((note) => (
              <NoteRow key={note.slug} note={note} showDate={false} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2
            className="text-xs uppercase tracking-wider text-muted-foreground mb-6"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Recently tended
          </h2>
          <div className="space-y-0">
            {recentNotes.map((note) => (
              <NoteRow key={note.slug} note={note} />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2
            className="text-xs uppercase tracking-wider text-muted-foreground mb-4"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Browse by theme
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2" style={{ fontFamily: "var(--font-ui)" }}>
            {topThemes.map((tag) => (
              <Link
                key={tag.name}
                href={`/tags/${tag.name}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Random note in footer area */}
        <section className="pt-8 border-t border-border/50">
          <RandomNoteButton />
        </section>
      </div>
    </LayoutShell>
  )
}
