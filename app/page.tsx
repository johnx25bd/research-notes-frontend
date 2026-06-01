import { LayoutShell } from "@/components/layout-shell"
import { getAllNotes } from "@/lib/vault"
import Link from "next/link"
import { NoteRow } from "@/components/note-row"

// ---------------------------------------------------------------------------
// Homepage copy lives here, in one place, so it can be rewritten without
// touching the layout below. Edit the strings; the structure takes care of
// itself. Prose is intentionally a draft — written to be replaced in John's
// own voice.
// ---------------------------------------------------------------------------

const INTRO: string[] = [
  "I'm John — a researcher and builder working on verification: how you make a credible claim about something that happened in the physical world, and have a party who doesn't trust you believe it. For most of the past decade I've approached that question through geography — where something is, and whether its location can be proven.",
  "The work has run through arms control and maritime security, a master's at UCL on verifiable sensor networks, national mapping infrastructure at Ordnance Survey, a carbon-market venture, and ongoing research at the University of Maryland. I'm now turning it toward what I take to be its most consequential application: the verification problems at the center of AI safety, and the international agreements that will govern advanced AI.",
]

interface Work {
  title: string
  href?: string
  body: string
}

const SELECTED_WORK: Work[] = [
  {
    title: "Astral & the Location Protocol",
    href: "https://astral.global",
    body: "Verifiable location-based services, and an open standard for sharing location claims and proofs across decentralized systems. Supported by a National Science Foundation grant.",
  },
  {
    title: "University of Maryland",
    body: "Research affiliate in the Department of Geography, working on proof-of-location and provenance verification across the geospatial data stack.",
  },
  {
    title: "Toucan Protocol",
    href: "https://toucan.earth",
    body: "Co-founded. Infrastructure for tokenizing carbon credits; settled over $4 billion in trades and brought roughly 4% of Verra's circulating supply on-chain at launch.",
  },
  {
    title: "Ordnance Survey",
    body: "Helped launch the OS Data Hub, opening the UK's national mapping data to developers under a £1B licensing arrangement.",
  },
]

const WORKING_ON_NOW: string[] = [
  "I'm moving into AI safety. My wager is that verifiable claims about the physical world — proving where something happened, without disclosing what should stay private — are a prerequisite for credible agreements between parties who don't trust each other, and that this sits among the harder unsolved problems in governing advanced AI.",
  "I've spent years building the spatial side of it. I'd like to bring that to bear where the stakes are highest, and to do it as part of a team rather than on my own.",
]

const eyebrowStyle = {
  fontFamily: "var(--font-ui)",
} as const

export default async function HomePage() {
  const notes = await getAllNotes()

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.lastTended).getTime() - new Date(a.lastTended).getTime())
    .slice(0, 4)

  return (
    <LayoutShell noteSlugs={notes.map((n) => n.slug)}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <section className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6">Hey, I'm John.</h1>
          {INTRO.map((para, i) => (
            <p key={i} className="text-lg text-foreground leading-relaxed mb-4">
              {para}
            </p>
          ))}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <a href="https://twitter.com/johnx25bd" className="underline hover:text-foreground transition-colors">
              Twitter
            </a>
            <a href="https://github.com/johnx25bd" className="underline hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/johnx25bd" className="underline hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <a href="mailto:john@johnx.co" className="underline hover:text-foreground transition-colors">
              john@johnx.co
            </a>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-lg tracking-[0.15em] opacity-60" style={eyebrowStyle}>
            Selected work
          </h2>
          <div className="space-y-0">
            {SELECTED_WORK.map((work) => (
              <div key={work.title} className="py-5 border-b border-border/50 last:border-0">
                <div className="font-medium text-foreground mb-1">
                  {work.href ? (
                    <a href={work.href} className="hover:text-primary transition-colors">
                      {work.title}
                    </a>
                  ) : (
                    work.title
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{work.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-lg tracking-[0.15em] opacity-60" style={eyebrowStyle}>
            What I'm working on now
          </h2>
          {WORKING_ON_NOW.map((para, i) => (
            <p key={i} className="text-lg text-foreground leading-relaxed mb-4">
              {para}
            </p>
          ))}
        </section>

        <section className="mb-16">
          <div className="flex items-baseline justify-between">
            <h2 className="section-header text-lg tracking-[0.15em] opacity-60" style={eyebrowStyle}>
              Writing
            </h2>
            <Link
              href="/notes"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              style={eyebrowStyle}
            >
              All notes →
            </Link>
          </div>
          <div className="space-y-0">
            {recentNotes.map((note) => (
              <NoteRow key={note.slug} note={note} showStatus={false} />
            ))}
          </div>
        </section>
      </div>
    </LayoutShell>
  )
}
