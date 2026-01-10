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
        <section className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6">
            Hey, I'm John.
          </h1>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I build systems that connect emerging tech to the people who need to understand it—developers, policymakers, enterprises. I love exploring the world—ideally under natural power—and learning about how things connect.{" "}
            <Link href="/about" className="underline hover:text-foreground transition-colors">
              Read more about me
            </Link>.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            My work spans a lot of domains, so I created this as a low friction way to share what I'm working on, whatever its state of development. For a long time I've wanted to build in public; this{" "}
            <a href="https://maggieappleton.com/garden-history" className="underline hover:text-foreground transition-colors">digital garden</a>{" "}
            is my effort to do just that.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            If you're interested in anything I'm writing about, please reach out! That's half the point of doing this.
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="https://twitter.com/johnx25bd" className="underline hover:text-foreground transition-colors">Twitter</a>
            <a href="https://github.com/johnx25bd" className="underline hover:text-foreground transition-colors">GitHub</a>
            <a href="https://linkedin.com/in/johnx25bd" className="underline hover:text-foreground transition-colors">LinkedIn</a>
            <a href="mailto:john@johnx.co" className="underline hover:text-foreground transition-colors">john@johnx.co</a>
          </div>
        </section>

        <section className="mb-16">
          <h2
            className="section-header text-lg tracking-[0.15em] opacity-60"
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
