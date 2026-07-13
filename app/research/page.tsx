import { LayoutShell } from "@/components/layout-shell"
import { NotesPageClient } from "@/components/notes-page-client"
import { ArtifactCard } from "@/components/artifact-card"
import { getAllNotes, getAllResearch, getResearchIndex } from "@/lib/vault"
import { processMarkdown } from "@/lib/markdown"
import type { Note } from "@/lib/vault"

export const metadata = {
  title: "Research",
  description:
    "Verifiable geospatial technologies and the spatial governance of intelligent machines.",
}

// Sort key for a track's cards: featured_order first (missing sorts last),
// then date descending. Dates are YYYY or YYYY-MM; fold to a comparable number.
function orderOf(note: Note): number {
  const raw = note.featured_order as unknown
  if (raw === null || raw === undefined || raw === "") return Number.POSITIVE_INFINITY
  const v = Number(raw)
  return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY
}

function dateScore(date?: string): number {
  if (!date) return 0
  const [y, m] = date.split("-")
  return Number(y) * 100 + (m ? Number(m) : 0)
}

function sortTrackEntries(entries: Note[]): Note[] {
  return [...entries].sort((a, b) => {
    const byOrder = orderOf(a) - orderOf(b)
    if (byOrder !== 0) return byOrder
    return dateScore(b.date) - dateScore(a.date)
  })
}

export default async function ResearchPage() {
  const index = await getResearchIndex()
  const research = await getAllResearch()

  // Fallback: if the framing note is missing, keep the old searchable list so
  // the route never breaks.
  if (!index) {
    return (
      <LayoutShell>
        <NotesPageClient
          notes={research}
          title="Research"
          description="Longer-form research — frameworks, notes, and work in progress."
          searchPlaceholder="Search research..."
        />
      </LayoutShell>
    )
  }

  // Entries that belong in a track (artifacts plus any hosted note carrying
  // track frontmatter, like the framework paper).
  const trackEntries = research.filter((n) => n.tracks && n.tracks.length > 0)

  // Render the framing prose. Wikilinks resolve across both areas.
  const notes = await getAllNotes()
  const linkTargets = [...notes, ...research].map((n) => ({ slug: n.slug, area: n.area }))
  const framingHtml = await processMarkdown(index.content, linkTargets, "research")

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 text-balance">
            {index.title}
          </h1>
          <div
            className="prose text-foreground"
            dangerouslySetInnerHTML={{ __html: framingHtml }}
          />
        </header>

        <div className="space-y-12">
          {index.tracks.map((track) => {
            const entries = sortTrackEntries(
              trackEntries.filter((n) => n.tracks?.includes(track.slug)),
            )
            if (entries.length === 0) return null
            return (
              <section key={track.slug}>
                <h2
                  className="section-header text-lg tracking-[0.12em] opacity-60 mb-5"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  {track.title}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {entries.map((artifact) => (
                    <ArtifactCard key={artifact.slug} artifact={artifact} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </LayoutShell>
  )
}
