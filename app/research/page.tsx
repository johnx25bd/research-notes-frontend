import Link from "next/link"
import { ArrowRight } from "lucide-react"
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

  // Track subheads and notes run through the markdown pipeline too, so YAML
  // block scalars (`subhead: |`) with blank lines render as separate
  // paragraphs in the rail — and markdown links work (the vision note's
  // pointer to the longer framing relies on this).
  const subheadHtml = new Map<string, string>()
  const noteHtml = new Map<string, string>()
  for (const track of index.tracks) {
    if (track.subhead) {
      subheadHtml.set(track.slug, await processMarkdown(track.subhead, linkTargets, "research"))
    }
    if (track.note) {
      noteHtml.set(track.slug, await processMarkdown(track.note, linkTargets, "research"))
    }
  }

  return (
    <LayoutShell wide>
      {/* One container, one left edge: everything on this page — nav and
          footer (via LayoutShell wide), intro, and all section bands — aligns
          to the same max-w-6xl container. */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Intro: capped at a readable measure but left-aligned to the
            container edge, sharing its left edge with the section rails. */}
        <header className="max-w-[70ch] mb-14 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 text-balance">
            {index.title}
          </h1>
          <div
            className="prose text-foreground"
            dangerouslySetInnerHTML={{ __html: framingHtml }}
          />
          {/* CTA to the longer framing note — the site's quiet outline button
              (matches the subscribe treatment), not a loud filled one. */}
          {index.framingHref && (
            <div className="mt-8">
              <Link
                href={index.framingHref}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-foreground/80 rounded-sm hover:bg-foreground hover:text-background transition-colors"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                {index.framingLabel ?? "Read the longer framing"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
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

            // Odd-count rule: when a section has an odd number of full cards,
            // the first card spans both columns so the grid never leaves an
            // orphan gap. Applied identically in every section.
            const oddCount = fullCards.length % 2 === 1

            return (
              <section
                key={track.slug}
                className="py-12 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12"
              >
                {/* Context rail: fixed 300px in every section so the internal
                    vertical axis is identical down the page. Sticky within its
                    band on desktop; offset clears the h-14 site header. */}
                <div className="mb-8 lg:mb-0 lg:sticky lg:top-20 lg:self-start">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-balance">
                    {track.title}
                  </h2>
                  {track.subhead && (
                    <div
                      className="text-base text-muted-foreground leading-relaxed mt-3 space-y-2.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                      dangerouslySetInnerHTML={{ __html: subheadHtml.get(track.slug) ?? "" }}
                    />
                  )}
                </div>

                {/* Card area: featured card spans the full area, full cards sit
                    two across, compact rows follow. min-w-0 lets the grid track
                    shrink instead of overflowing the band. */}
                <div className="min-w-0">
                  {featured.map((artifact) => (
                    <div key={artifact.slug} className="mb-4">
                      <FeaturedArtifactCard artifact={artifact} />
                    </div>
                  ))}

                  {fullCards.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {fullCards.map((artifact, i) => (
                        <ArtifactCard
                          key={artifact.slug}
                          artifact={artifact}
                          className={oddCount && i === 0 ? "sm:col-span-2" : undefined}
                        />
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

                  {/* Small muted note at the foot of the track's card area
                      (e.g. the web3-framing note under Vision). */}
                  {track.note && (
                    <div
                      className="mt-6 text-sm text-muted-foreground leading-relaxed space-y-1.5 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                      dangerouslySetInnerHTML={{ __html: noteHtml.get(track.slug) ?? "" }}
                    />
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
