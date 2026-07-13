import { LayoutShell } from "@/components/layout-shell"
import { NotesPageClient } from "@/components/notes-page-client"
import {
  ArtifactCard,
  ArtifactCompactRow,
  FeaturedArtifactCard,
} from "@/components/artifact-card"
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
// The "missing" sentinel must be finite: Infinity - Infinity is NaN, which a
// sort comparator treats as "equal" and silently falls back to file order.
const UNORDERED = Number.MAX_SAFE_INTEGER

function orderOf(note: Note): number {
  const raw = note.featured_order as unknown
  if (raw === null || raw === undefined || raw === "") return UNORDERED
  const v = Number(raw)
  return Number.isFinite(v) ? v : UNORDERED
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

// Compact one-line treatment for historical or superseded work; everything
// else gets a full card. The featured (start_here) entry is pulled out first.
function isCompact(note: Note): boolean {
  return note.status === "historical" || Boolean(note.supersededBy)
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
  const bySlug = new Map(research.map((n) => [n.slug, n]))

  // Render the framing prose. Wikilinks resolve across both areas.
  const notes = await getAllNotes()
  const linkTargets = [...notes, ...research].map((n) => ({ slug: n.slug, area: n.area }))
  const framingHtml = await processMarkdown(index.content, linkTargets, "research")

  return (
    <LayoutShell>
      {/* Dashboard layout: a wide, bounded container. The intro stays at the
          site's reading measure; each track below is a full-width band. */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="max-w-2xl mx-auto mb-14 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 text-balance">
            {index.title}
          </h1>
          <div
            className="prose text-foreground"
            dangerouslySetInnerHTML={{ __html: framingHtml }}
          />
        </header>

        {/* Each track is a two-column band: the left third holds the section
            context (heading + subhead) and sticks within its band on desktop,
            so the framing stays in view while the cards scroll past — a tour
            of the agenda with relevant context alongside. On small screens the
            context stacks above the cards and sticky is off. */}
        <div className="divide-y divide-[var(--entry-divider)]">
          {index.tracks.map((track) => {
            const entries = sortTrackEntries(
              trackEntries.filter((n) => n.tracks?.includes(track.slug)),
            )
            if (entries.length === 0) return null

            const featured = entries.filter((n) => n.startHere)
            const rest = entries.filter((n) => !n.startHere)
            const fullCards = rest.filter((n) => !isCompact(n))
            const compact = rest.filter(isCompact)

            return (
              <section key={track.slug} className="py-12 lg:grid lg:grid-cols-3 lg:gap-12">
                {/* Context column: the strong serif h2 (left-aligned in this
                    layout) and the one-sentence subhead, with room for future
                    section prose. Sticky offset clears the h-14 site header. */}
                <div className="mb-8 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-balance">
                    {track.title}
                  </h2>
                  {track.subhead && (
                    <p className="text-base text-muted-foreground leading-relaxed mt-3">
                      {track.subhead}
                    </p>
                  )}
                </div>

                {/* Card column: featured card spans the column, full cards sit
                    two across, compact rows follow. */}
                <div className="lg:col-span-2">
                  {featured.map((artifact) => (
                    <div key={artifact.slug} className="mb-4">
                      <FeaturedArtifactCard artifact={artifact} />
                    </div>
                  ))}

                  {fullCards.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {fullCards.map((artifact) => (
                        <ArtifactCard key={artifact.slug} artifact={artifact} />
                      ))}
                    </div>
                  )}

                  {compact.length > 0 && (
                    <div className="mt-4">
                      {compact.map((artifact) => (
                        <ArtifactCompactRow
                          key={artifact.slug}
                          artifact={artifact}
                          supersededByNote={
                            artifact.supersededBy ? bySlug.get(artifact.supersededBy) : undefined
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </LayoutShell>
  )
}
