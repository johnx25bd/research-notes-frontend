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

function yearOf(date?: string): string {
  return date ? date.slice(0, 4) : ""
}

interface ArtifactCardProps {
  artifact: Note
}

// A card for a research artifact, shown within a track section on the index.
// The whole card links to the artifact's own /research/{slug} page; when the
// artifact has a primary external link, a small glyph offers a direct shortcut
// out (it sits above the card-wide link via z-index).
export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const primary = artifact.links?.[0]
  const isExternal = primary ? /^https?:\/\//.test(primary.url) : false
  const kindLabel = artifact.artifactKind ? KIND_LABELS[artifact.artifactKind] ?? artifact.artifactKind : null
  const year = yearOf(artifact.date)

  return (
    <div className="group relative p-4 rounded-lg border border-border bg-card transition-colors hover:border-primary/30">
      <Link
        href={`/research/${artifact.slug}`}
        className="absolute inset-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        aria-label={artifact.title}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-medium text-card-foreground leading-snug group-hover:text-primary transition-colors">
          {artifact.title}
        </h3>
        {isExternal && primary && (
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

      <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{artifact.summary}</p>

      <div
        className="flex items-center gap-2.5 text-xs text-muted-foreground/70"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        {kindLabel && <span className="uppercase tracking-wide text-[0.65rem]">{kindLabel}</span>}
        {kindLabel && year && <span className="text-muted-foreground/30">·</span>}
        {year && <span>{year}</span>}
        {artifact.status === "historical" && (
          <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.65rem] text-muted-foreground/80 bg-muted/60">
            Historical
          </span>
        )}
      </div>
    </div>
  )
}
