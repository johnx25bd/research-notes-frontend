import { notFound } from "next/navigation"
import Link from "next/link"
import { LayoutShell } from "@/components/layout-shell"
import { NoteRow } from "@/components/note-row"
import { getAllNotes } from "@/lib/vault"
import { ArrowLeft } from "lucide-react"

export async function generateStaticParams() {
  const notes = await getAllNotes()
  const allTags = new Set<string>()
  notes.forEach(note => note.tags.forEach(tag => allTags.add(tag)))
  return Array.from(allTags).map((tag) => ({ tag }))
}

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const allNotes = await getAllNotes()
  const tagNotes = allNotes.filter(note => note.tags.includes(tag))

  if (tagNotes.length === 0) {
    notFound()
  }

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          href="/tags"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All themes
        </Link>

        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-2 animate-fade-in-up">{tag}</h1>
        <p className="text-muted-foreground mb-10" style={{ fontFamily: "var(--font-ui)" }}>
          {tagNotes.length} {tagNotes.length === 1 ? "note" : "notes"} on this theme
        </p>

        <div className="space-y-0">
          {tagNotes.map((note) => (
            <NoteRow key={note.slug} note={note} />
          ))}
        </div>
      </div>
    </LayoutShell>
  )
}
