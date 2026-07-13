import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { LayoutShell } from "@/components/layout-shell"
import { NoteContentInteractive } from "@/components/note-content-interactive"
import { NoteContentMDX } from "@/components/note-content-mdx"
import { NoteConnections } from "@/components/note-connections"
import { TagChip } from "@/components/tag-chip"
import { ArtifactStatusBadge, KIND_LABELS } from "@/components/artifact-card"
import { getAllNotes, getAllResearch, getResearchBySlug } from "@/lib/vault"
import { processMarkdown, containsMDX } from "@/lib/markdown"
import { computeBacklinks } from "@/lib/backlinks"
import type { ResearchLink } from "@/lib/vault"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://johnx.co'

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url)
}

// A single link out from an artifact page. The primary link is emphasized as a
// filled button; secondary links render as quiet inline links. External links
// open in a new tab; on-site paths use client navigation.
function ArtifactLink({ link, primary }: { link: ResearchLink; primary: boolean }) {
  const external = isExternal(link.url)
  const base = primary
    ? "inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
    : "inline-flex items-center gap-1 text-sm text-primary hover:underline"
  const content = (
    <>
      <span>{link.label}</span>
      {external && <ArrowUpRight className={primary ? "h-4 w-4" : "h-3.5 w-3.5"} />}
    </>
  )
  if (external) {
    return (
      <a href={link.url} target="_blank" rel="noopener noreferrer" className={base} style={{ fontFamily: "var(--font-ui)" }}>
        {content}
      </a>
    )
  }
  return (
    <Link href={link.url} className={base} style={{ fontFamily: "var(--font-ui)" }}>
      {content}
    </Link>
  )
}

export async function generateStaticParams() {
  const research = await getAllResearch()
  return research.map((note) => ({ slug: note.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const note = await getResearchBySlug(slug)

  if (!note) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: note.title,
    description: note.summary || `Research: ${note.title}`,
    openGraph: {
      title: note.title,
      description: note.summary || `Research: ${note.title}`,
      type: 'article',
      publishedTime: note.lastTended,
      modifiedTime: note.lastTended,
      tags: note.tags,
      url: `${siteUrl}/research/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: note.title,
      description: note.summary || `Research: ${note.title}`,
    },
  }
}

interface ResearchPageProps {
  params: Promise<{ slug: string }>
}

export default async function ResearchNotePage({ params }: ResearchPageProps) {
  const { slug } = await params
  const note = await getResearchBySlug(slug)

  if (!note) {
    notFound()
  }

  // Corpus for backlinks and related notes: the research area.
  const allNotes = await getAllResearch()

  // Wikilink resolution spans both areas so cross-area links resolve correctly.
  const notes = await getAllNotes()
  const linkTargets = [...notes, ...allNotes].map(n => ({ slug: n.slug, area: n.area }))

  // Detect if content contains MDX (React components)
  const isMDX = containsMDX(note.content)

  // Process markdown to HTML (only needed for non-MDX content)
  const html = isMDX
    ? ''
    : await processMarkdown(note.content, linkTargets, "research")

  // Compute backlinks
  const backlinksMap = computeBacklinks(allNotes)
  const backlinks = backlinksMap[note.slug] || []

  // Find related notes (share tags)
  const related = allNotes
    .filter(n => n.slug !== note.slug)
    .filter(n => n.tags.some(tag => note.tags.includes(tag)))
    .slice(0, 5)

  // Hide publishing-workflow tags from the reader-facing tag list.
  const WORKFLOW_TAGS = new Set(["to-publish", "research"])
  const displayTags = note.tags.filter(tag => !WORKFLOW_TAGS.has(tag))

  // Artifact pages: curation metadata, a prominent link out, and Connections.
  // The optional short body renders like any note body.
  if (note.type === "artifact") {
    const links = note.links ?? []
    const primary = links[0]
    const secondary = links.slice(1)
    const kindLabel = note.artifactKind ? KIND_LABELS[note.artifactKind] ?? note.artifactKind : null
    const year = note.date ? note.date.slice(0, 4) : null
    const meta = [kindLabel, year, note.role].filter(Boolean) as string[]
    const hasBody = note.content.trim().length > 0
    const supersededByNote = note.supersededBy
      ? allNotes.find(n => n.slug === note.supersededBy)
      : undefined

    return (
      <LayoutShell>
        <article className="research-article max-w-2xl mx-auto px-6 py-10">
          <div className="compass-line">
            <header className="mb-8 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-3 text-balance">{note.title}</h1>
              {meta.length > 0 && (
                <div
                  className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  <span>{meta.join("  ·  ")}</span>
                  <ArtifactStatusBadge status={note.status} />
                </div>
              )}
              {note.summary && (
                <p className="text-lg text-foreground/90 leading-snug text-balance">{note.summary}</p>
              )}
              {supersededByNote && (
                <p className="text-sm text-muted-foreground mt-3" style={{ fontFamily: "var(--font-ui)" }}>
                  Superseded by{" "}
                  <Link
                    href={`/research/${supersededByNote.slug}`}
                    className="text-primary hover:underline"
                  >
                    {supersededByNote.title} {"→"}
                  </Link>
                </p>
              )}
            </header>

            {note.fits && (
              <section className="mb-8">
                <h2
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  How it fits
                </h2>
                <p className="text-base text-muted-foreground leading-relaxed">{note.fits}</p>
              </section>
            )}

            {primary && (
              <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-3">
                <ArtifactLink link={primary} primary />
                {secondary.map((link) => (
                  <ArtifactLink key={link.url} link={link} primary={false} />
                ))}
              </div>
            )}

            {hasBody && (
              <div className="prose text-foreground">
                <NoteContentInteractive html={html} allNotes={allNotes} />
              </div>
            )}

            {displayTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {displayTags.slice(0, 4).map((tag) => (
                  <TagChip key={tag} tag={tag} href={`/tags/${tag}`} />
                ))}
              </div>
            )}

            <NoteConnections backlinks={backlinks} relatedNotes={related} allNotes={allNotes} />
          </div>
        </article>
      </LayoutShell>
    )
  }

  return (
    <LayoutShell>
      <article className="research-article max-w-2xl mx-auto px-6 py-10">
        <div className="compass-line">
          <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 text-balance">{note.title}</h1>
            {note.summary && (
              <p className="text-lg text-muted-foreground leading-snug mb-4 text-balance">{note.summary}</p>
            )}
            {displayTags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {displayTags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} tag={tag} href={`/tags/${tag}`} />
                ))}
              </div>
            )}
          </header>

          {/* Main content */}
          <div className="prose text-foreground">
            {isMDX ? (
              /* @ts-expect-error - Async Server Component pattern */
              <NoteContentMDX source={note.content} />
            ) : (
              <NoteContentInteractive html={html} allNotes={allNotes} />
            )}
          </div>

          <NoteConnections
            backlinks={backlinks}
            relatedNotes={related}
            allNotes={allNotes}
          />
        </div>
      </article>
    </LayoutShell>
  )
}
