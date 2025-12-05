import { notFound } from "next/navigation"
import { LayoutShell } from "@/components/layout-shell"
import { StatusBadge } from "@/components/status-badge"
import { NoteContent } from "@/components/note-content"
import { NoteConnections } from "@/components/note-connections"
import { TagChip } from "@/components/tag-chip"
import { getNoteBySlug, notes } from "@/lib/mock-data"

export function generateStaticParams() {
  return notes.map((note) => ({ slug: note.slug }))
}

interface NotePageProps {
  params: Promise<{ slug: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params
  const note = getNoteBySlug(slug)

  if (!note) {
    notFound()
  }

  return (
    <LayoutShell>
      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="compass-line pl-8 lg:pl-0">
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
                {new Date(note.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              {note.tags.length > 0 && (
                <>
                  <span className="text-border">·</span>
                  <div className="flex gap-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <TagChip key={tag} tag={tag} href={`/tags/${tag}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Main content */}
          <div className="prose text-foreground">
            <NoteContent content={note.content} />
          </div>

          <NoteConnections note={note} />
        </div>
      </article>
    </LayoutShell>
  )
}
