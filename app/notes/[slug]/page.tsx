import { notFound } from "next/navigation"
import { LayoutShell } from "@/components/layout-shell"
import { StatusBadge } from "@/components/status-badge"
import { NoteContent } from "@/components/note-content"
import { NoteConnections } from "@/components/note-connections"
import { TagChip } from "@/components/tag-chip"
import { getAllNotes, getNoteBySlug } from "@/lib/vault"
import { processMarkdown } from "@/lib/markdown"
import { computeBacklinks } from "@/lib/backlinks"

export async function generateStaticParams() {
  const notes = await getAllNotes()
  return notes.map((note) => ({ slug: note.slug }))
}

interface NotePageProps {
  params: Promise<{ slug: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params
  const note = await getNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  // Get all notes for backlinks and related notes
  const allNotes = await getAllNotes()

  // Process markdown to HTML
  const html = await processMarkdown(
    note.content,
    allNotes.map(n => n.slug)
  )

  // Compute backlinks
  const backlinksMap = computeBacklinks(allNotes)
  const backlinks = backlinksMap[note.slug] || []

  // Find related notes (share tags)
  const related = allNotes
    .filter(n => n.slug !== note.slug)
    .filter(n => n.tags.some(tag => note.tags.includes(tag)))
    .slice(0, 5)

  return (
    <LayoutShell>
      <article className="max-w-2xl mx-auto px-6 py-10">
        <div className="compass-line">
          <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 text-balance">{note.title}</h1>
            <div
              className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              <StatusBadge status={note.status} />
              <span className="text-border">·</span>
              <span>
                Last tended{" "}
                {new Date(note.lastTended).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-2 mt-3">
                {note.tags.slice(0, 3).map((tag) => (
                  <TagChip key={tag} tag={tag} href={`/tags/${tag}`} />
                ))}
              </div>
            )}
          </header>

          {/* Main content */}
          <div className="prose text-foreground">
            <NoteContent html={html} />
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
