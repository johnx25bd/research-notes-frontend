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
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Prose stays at the site's reading measure; card grids run wider. */}
        <header className="max-w-2xl mx-auto mb-14 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 text-balance">
            {index.title}
          </h1>
          <div
            className="prose text-foreground"
            dangerouslySetInnerHTML={{ __html: framingHtml }}
          />
        </header>

        <div className="space-y-14">
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
              <section key={track.slug}>
                <div className="max-w-2xl mx-auto mb-6">
                  <h2
                    className="section-header text-lg tracking-[0.12em] opacity-60"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    {track.title}
                  </h2>
                  {track.subhead && (
                    <p className="text-base text-muted-foreground leading-relaxed mt-2">
                      {track.subhead}
                    </p>
                  )}
                </div>

                {featured.map((artifact) => (
                  <div key={artifact.slug} className="mb-4">
                    <FeaturedArtifactCard artifact={artifact} />
                  </div>
                ))}

                {fullCards.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              </section>
            )
          })}
        </div>
      </div>
    </LayoutShell>
  )
}
