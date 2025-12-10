import { LayoutShell } from "@/components/layout-shell"
import { RecentNotesSection } from "@/components/recent-notes-section"
import { getAllNotes } from "@/lib/vault"
import Link from "next/link"
import { NoteRow } from "@/components/note-row"

export default async function HomePage() {
  const notes = await getAllNotes()

  // Featured notes (where featured: true), sorted by featured_order
  const featuredNotes = notes
    .filter((note) => note.featured)
    .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999))
    .slice(0, 4)

  // Recently tended (sort by lastTended from git)
  const allRecentNotes = [...notes].sort((a, b) =>
    new Date(b.lastTended).getTime() - new Date(a.lastTended).getTime()
  )

  // Top tags (compute from all notes)
  const tagCounts = new Map<string, number>()
  notes.forEach(note => {
    note.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })
  const topThemes = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag)

  return (
    <LayoutShell noteSlugs={notes.map(n => n.slug)}>
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

        <RecentNotesSection notes={allRecentNotes} />

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={{ fontFamily: "var(--font-ui)" }}>
            Browse by Theme
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-2" style={{ fontFamily: "var(--font-ui)" }}>
            {topThemes.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </LayoutShell>
  )
}
