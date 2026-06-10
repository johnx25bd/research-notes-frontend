import type { Metadata } from "next"
import { LayoutShell } from "@/components/layout-shell"
import { SubscribeForm } from "@/components/subscribe-form"

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Get a short note by email when a new piece of writing goes up in the garden.",
  openGraph: {
    title: "Subscribe | johnx",
    description: "Get a short note by email when a new piece of writing goes up in the garden.",
  },
}

export default function SubscribePage() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up">
          Subscribe
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          I'll send a short note when I publish something new here. No schedule, no noise —
          just the occasional new piece of writing.
        </p>

        <SubscribeForm variant="full" />

        <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
          One email per new note, nothing else. Unsubscribe anytime — every email has a link.
        </p>
      </div>
    </LayoutShell>
  )
}
