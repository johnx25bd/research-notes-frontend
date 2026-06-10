import { RandomNoteButton } from "./random-note-button"
import { SubscribeForm } from "./subscribe-form"

interface FooterProps {
  noteSlugs?: string[]
}

export function Footer({ noteSlugs }: FooterProps) {
  return (
    <footer className="py-12 mt-8">
      <div className="max-w-2xl mx-auto px-6">
        <div className="pt-8 border-t border-border/50 space-y-6">
          <div className="space-y-2">
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Subscribe to get a short note when I publish something new.
            </p>
            <SubscribeForm variant="inline" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-sm text-muted-foreground"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              A digital garden, tended with care
            </p>
            {noteSlugs && noteSlugs.length > 0 && <RandomNoteButton noteSlugs={noteSlugs} />}
          </div>
        </div>
      </div>
    </footer>
  )
}
