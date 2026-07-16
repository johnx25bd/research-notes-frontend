import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import type { Note } from "@/lib/vault"

export const KIND_LABELS: Record<string, string> = {
  paper: "Paper",
  spec: "Spec",
  talk: "Talk",
  prototype: "Prototype",
  post: "Post",
  report: "Report",
  thread: "Thread",
  library: "Library",
}

// Non-default artifact statuses get a badge; `active` is the unmarked state.
const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  preview: { label: "Preview", className: "text-primary/70 bg-primary/5" },
  historical: { label: "Historical", className: "text-muted-foreground/80 bg-muted/60" },
  forthcoming: {
    label: "Forthcoming",
    className: "text-muted-foreground/70 border border-dashed border-current/40",
  },
}

function yearOf(date?: string): string {
  return date ? date.slice(0, 4) : ""
}

export function ArtifactStatusBadge({
  status,
  className,
}: {
  status: Note["status"]
  className?: string
}) {
  const badge = STATUS_BADGES[status]
  if (!badge) return null
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] ${badge.className} ${className ?? ""}`}
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {badge.label}
    </span>
  )
}

interface ArtifactCardProps {
  artifact: Note
  /** Extra classes on the card root (e.g. a grid col-span from the page). */
  className?: string
}

// A full card for a research artifact, shown within a track section on the
// index. The whole card links to the artifact's own /research/{slug} page;
// when the artifact has a primary external link, a small glyph offers a direct
// shortcut out (it sits above the card-wide link via z-index). Forthcoming
// entries render unlinked and dimmed — announced, not yet published.
export function ArtifactCard({ artifact, className }: ArtifactCardProps) {
  const forthcoming = artifact.status === "forthcoming"
  const primary = artifact.links?.[0]
  const isExternal = primary ? /^https?:\/\//.test(primary.url) : false
  const kindLabel = artifact.artifactKind
    ? KIND_LABELS[artifact.artifactKind] ?? artifact.artifactKind
    : null
  const year = yearOf(artifact.date)

  return (
    <div
      className={`group relative flex h-full flex-col p-4 rounded-lg border bg-card transition-colors ${
        forthcoming
          ? "border-dashed border-border opacity-70"
          : "border-border hover:border-primary/30"
      } ${className ?? ""}`}
    >
      {!forthcoming && (
        <Link
          href={`/research/${artifact.slug}`}
          className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          aria-label={artifact.title}
        />
      )}

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={`font-medium text-card-foreground leading-snug ${
            forthcoming ? "" : "group-hover:text-primary transition-colors"
          }`}
        >
          {artifact.title}
        </h3>
        {isExternal && primary && !forthcoming && (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 shrink-0 text-muted-foreground/50 hover:text-primary transition-colors"
            aria-label={`Open ${primary.label}`}
            title={primary.label}
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{artifact.summary}</p>

      <div
        className="mt-auto flex items-center gap-2.5 text-xs text-muted-foreground/70"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {kindLabel && <span className="uppercase tracking-wide text-[0.65rem]">{kindLabel}</span>}
        {kindLabel && year && <span className="text-muted-foreground/30">·</span>}
        {year && <span>{year}</span>}
        <ArtifactStatusBadge status={artifact.status} className="ml-auto" />
      </div>
    </div>
  )
}

// The featured "Start here" card at the top of a track — full-width and more
// generous than the grid cards, for the piece a new reader should open first.
export function FeaturedArtifactCard({ artifact }: ArtifactCardProps) {
  const kindLabel = artifact.artifactKind
    ? KIND_LABELS[artifact.artifactKind] ?? artifact.artifactKind
    : null
  const year = yearOf(artifact.date)

  return (
    <div className="group relative p-6 rounded-lg border border-primary/25 bg-card transition-colors hover:border-primary/50">
      <Link
        href={`/research/${artifact.slug}`}
        className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={artifact.title}
      />
      <p
        className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary mb-2"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        Start here
      </p>
      <h3 className="font-medium text-lg sm:text-xl text-card-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
        {artifact.title}
      </h3>
      <p className="text-base text-muted-foreground leading-relaxed mb-3 max-w-2xl">
        {artifact.summary}
      </p>
      <div
        className="flex items-center gap-2.5 text-xs text-muted-foreground/70"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {kindLabel && <span className="uppercase tracking-wide text-[0.65rem]">{kindLabel}</span>}
        {kindLabel && year && <span className="text-muted-foreground/30">·</span>}
        {year && <span>{year}</span>}
        {artifact.role && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span>{artifact.role}</span>
          </>
        )}
      </div>
    </div>
  )
}

interface ArtifactCompactRowProps {
  artifact: Note
}

// A compact one-line entry for note-tier artifacts. The whole row links to
// the artifact's /research page via an absolutely positioned overlay (like
// the cards); the small up-right arrow is a shortcut straight out to the
// primary external link, opening in a new tab above the overlay via z-index.
// Two explicit clusters that can never collide: the left cluster (title +
// clause) wraps within its own space, and the right cluster (kind, year,
// status, arrow) stays on one line behind a minimum gap. Below sm the
// metadata cluster drops onto its own line under the title.
export function ArtifactCompactRow({ artifact }: ArtifactCompactRowProps) {
  const kindLabel = artifact.artifactKind
    ? KIND_LABELS[artifact.artifactKind] ?? artifact.artifactKind
    : null
  const year = yearOf(artifact.date)
  const primary = artifact.links?.[0]
  const isExternal = primary ? /^https?:\/\//.test(primary.url) : false

  return (
    <div
      className="group relative py-2.5 text-sm transition-colors hover:bg-muted/30 -mx-2 px-2 sm:flex sm:items-baseline sm:justify-between sm:gap-6"
      style={{ borderBottom: "1px solid var(--entry-divider)" }}
    >
      <Link
        href={`/research/${artifact.slug}`}
        className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label={artifact.title}
      />
      <p className="min-w-0">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
          {artifact.title}
        </span>{" "}
        <span className="text-muted-foreground">
          {"—"} {artifact.clause || artifact.summary}
        </span>
      </p>
      <span
        className="mt-1 flex items-baseline gap-2.5 text-xs text-muted-foreground/70 whitespace-nowrap sm:mt-0 sm:shrink-0"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {kindLabel && <span className="uppercase tracking-wide text-[0.65rem]">{kindLabel}</span>}
        {year && <span>{year}</span>}
        <ArtifactStatusBadge status={artifact.status} />
        {isExternal && primary && (
          <a
            href={primary.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 self-center text-muted-foreground/50 hover:text-primary transition-colors"
            aria-label={`Open ${primary.label}`}
            title={primary.label}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )}
      </span>
    </div>
  )
}
