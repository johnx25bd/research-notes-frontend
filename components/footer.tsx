import { RandomNoteButton } from "./random-note-button"
import { SubscribeForm } from "./subscribe-form"

interface FooterProps {
  noteSlugs?: string[]
  /** Widen the footer container to match wide-layout pages (e.g. /research). */
  wide?: boolean
}

export function Footer({ noteSlugs, wide = false }: FooterProps) {
  return (
    <footer className="py-12 mt-8">
      <div className={`mx-auto px-6 ${wide ? "max-w-6xl" : "max-w-2xl"}`}>
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
