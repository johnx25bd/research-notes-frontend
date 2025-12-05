import Link from "next/link"
import { LayoutShell } from "@/components/layout-shell"
import { tags, getNotesByTag } from "@/lib/mock-data"

export default function TagsPage() {
  const sortedTags = [...tags].sort((a, b) => b.count - a.count)

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up">Themes</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Browse notes by theme. Each represents a thread of related ideas.
        </p>

        <div className="space-y-6">
          {sortedTags.map((tag) => {
            const tagNotes = getNotesByTag(tag.name)
            return (
              <Link
                key={tag.name}
                href={`/tags/${tag.name}`}
                className="block group py-3 border-b border-border/50 last:border-0"
              >
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {tag.name}
                  </span>
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: "var(--font-ui)" }}>
                    {tag.count} {tag.count === 1 ? "note" : "notes"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tagNotes
                    .slice(0, 3)
                    .map((n) => n.title)
                    .join(", ")}
                  {tagNotes.length > 3 && ", ..."}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </LayoutShell>
  )
}
