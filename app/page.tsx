import { LayoutShell } from "@/components/layout-shell"
import { RecentNotesSection } from "@/components/recent-notes-section"
import { getAllNotes, getAllResearch } from "@/lib/vault"
import Link from "next/link"
import { NoteRow } from "@/components/note-row"
import { SubscribeForm } from "@/components/subscribe-form"
import type { Note } from "@/lib/vault"

// Top post pinned above the featured notes in "Orient". Links straight out
// to the external post in a new tab rather than to an internal note page.
const topPost: Note = {
  slug: "spatial-alignment",
  title: "Spatial Alignment",
  summary: "Towards spatial governance of intelligent machines",
  status: "fragment",
  lastTended: "",
  tags: [],
  content: "",
  area: "notes",
  filepath: "",
}
const TOP_POST_URL = "https://sotaletters.substack.com/p/spatial-alignment"

// Tidy up Orient sublines: drop trailing periods for consistency, and glue the
// last two words with a non-breaking space so we never wrap a single orphan word.
function formatSubline(summary?: string): string {
  if (!summary) return ""
  return summary
    .trim()
    .replace(/\.+$/, "")
    .replace(/\s+(\S+)$/, " $1")
}

export default async function HomePage() {
  const notes = await getAllNotes()
  const research = await getAllResearch()

  // Featured pool spans both areas so a featured research post can appear here.
  // Missing/blank/non-numeric orders sort last (999); NoteRow links each to its
  // own area (/notes or /research) via note.area.
  const orderOf = (n: Note) => {
    const raw = n.featured_order as unknown
    if (raw === null || raw === undefined || raw === "") return 999
    const v = Number(raw)
    return Number.isFinite(v) ? v : 999
  }
  const featuredNotes = [...notes, ...research]
    .filter((note) => note.featured)
    .sort((a, b) => orderOf(a) - orderOf(b))
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
          <p className="text-lg text-foreground leading-relaxed mb-4">
            If you're interested in anything I'm writing about, please reach out! That's half the point of doing this.
          </p>
          <div className="mb-6">
            <p className="text-base text-muted-foreground leading-relaxed mb-2">
              Or subscribe for an occasional note when I publish something new.
            </p>
            <SubscribeForm variant="inline" />
          </div>
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
            <NoteRow
              note={{ ...topPost, summary: formatSubline(topPost.summary) }}
              externalUrl={TOP_POST_URL}
              showDate={false}
              showStatus={false}
              wrapSummary
            />
            {featuredNotes.map((note) => (
              <NoteRow
                key={note.slug}
                note={{ ...note, summary: formatSubline(note.summary) }}
                showDate={false}
                showStatus={false}
                wrapSummary
              />
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
