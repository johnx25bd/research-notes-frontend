import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { LayoutShell } from "@/components/layout-shell"
import { NoteContentInteractive } from "@/components/note-content-interactive"
import { NoteContentMDX } from "@/components/note-content-mdx"
import { NoteConnections } from "@/components/note-connections"
import { TagChip } from "@/components/tag-chip"
import { getAllNotes, getAllResearch, getResearchBySlug } from "@/lib/vault"
import { processMarkdown, containsMDX } from "@/lib/markdown"
import { computeBacklinks } from "@/lib/backlinks"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://johnx.co'

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

  return (
    <LayoutShell>
      <article className="research-article mx-auto">
        <div className="compass-line">
          <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 text-balance">{note.title}</h1>
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
