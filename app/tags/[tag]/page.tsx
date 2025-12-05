import { notFound } from "next/navigation"
import Link from "next/link"
import { LayoutShell } from "@/components/layout-shell"
import { NoteRow } from "@/components/note-row"
import { tags, getNotesByTag } from "@/lib/mock-data"
import { ArrowLeft } from "lucide-react"

export function generateStaticParams() {
  return tags.map((tag) => ({ tag: tag.name }))
}

interface TagPageProps {
  params: Promise<{ tag: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params
  const tagInfo = tags.find((t) => t.name === tag)

  if (!tagInfo) {
    notFound()
  }

  const tagNotes = getNotesByTag(tag)

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
          {tagInfo.count} {tagInfo.count === 1 ? "note" : "notes"} on this theme
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
