import type { Metadata } from "next"
import { LayoutShell } from "@/components/layout-shell"

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI strategy, agentic system design, and rapid prototyping for early-stage companies in geospatial, location intelligence, and AI-adjacent domains.",
  openGraph: {
    type: "website",
    title: "Working with me",
    description:
      "AI and agentic systems for early-stage companies. Strategy, system design, prototyping, due diligence, and fractional technical leadership.",
    url: "/services",
  },
}

const services = [
  {
    title: "AI strategy",
    summary:
      "Where AI genuinely earns its place in your product or operations, and where it doesn't. A clear, honest view of what to build, in what order, and why.",
  },
  {
    title: "Education and sensemaking",
    summary:
      "I help you and your team build a clear picture of what's actually happening in AI and why it matters for your work, so you can decide from understanding rather than from pressure.",
  },
  {
    title: "Agentic system design",
    summary:
      "Architecture for systems that use language models to reason, plan, and act—tool use, retrieval, evaluation, and the guardrails that keep them reliable.",
  },
  {
    title: "Rapid prototyping",
    summary:
      "Working prototypes, quickly—so you can put something real in front of users or investors instead of arguing about a slide.",
  },
  {
    title: "Technical due diligence",
    summary:
      "An assessment of the technical substance of a product, team, or codebase—for founders sharpening their own thinking, or investors who need a second opinion.",
  },
  {
    title: "Fractional technical leadership",
    summary:
      "A part-time technical lead or AI architect, for when you need senior judgment in the room but not a full-time hire yet.",
  },
]

const shapes = [
  {
    title: "Discovery engagement",
    meta: "one to two weeks · fixed fee · mostly asynchronous",
    body: "A written diagnosis and a roadmap—what the real problem is, what's feasible, what to build first, and what to ignore for now. Concrete enough to act on or hand to a developer. The natural first step when you know AI should help but aren't yet sure how.",
  },
  {
    title: "Fractional",
    meta: "one to two days a week · billed monthly · three-month minimum",
    body: "Ongoing senior technical judgment—architecture decisions, code and design review, prototyping, hiring input, and acting as the AI lead in the room. The deliverable is momentum and good decisions, not a single artifact. For when you have real work in flight and need someone senior shaping it every week, but a full-time hire is premature.",
  },
  {
    title: "Project, fixed fee",
    meta: "scoped outcome · milestones · price agreed up front",
    body: "The thing itself—a working prototype, a production integration, a due-diligence report—built to an agreed specification. For when the problem is well enough understood, often after a discovery engagement, that we can name the outcome and fix the price.",
  },
]

// .section-header sets font-size: 1.35rem unlayered, which beats the text-xs
// utility; force the eyebrow size inline so the labels stay small.
const capStyle = { fontFamily: "var(--font-ui)", fontSize: "0.75rem" } as const

export default function ServicesPage() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <section className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 animate-fade-in-up">
            Working with me
          </h1>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I work with early-stage teams in geospatial, location intelligence, and AI-adjacent
            domains—people who have a real problem and a sense that AI or agentic systems should be
            part of the answer, but who don't yet have the in-house depth to design the system,
            judge the trade-offs, or build the first version.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            I'm most useful when the stakes are technical and the path is still uncertain—when you
            need someone who has built these systems to tell you honestly what's feasible, what's
            hype, and what the smallest valuable first step looks like.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={capStyle}>
            What I do
          </h2>
          <div className="space-y-0">
            {services.map((service) => (
              <div key={service.title} className="py-4 border-b border-border/50 last:border-0">
                <div className="font-medium text-foreground mb-1">{service.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.summary}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={capStyle}>
            How we'd work together
          </h2>
          <div className="space-y-0">
            {shapes.map((shape) => (
              <div key={shape.title} className="py-5 border-b border-border/50 last:border-0">
                <div className="font-medium text-foreground">{shape.title}</div>
                <p
                  className="text-xs text-muted-foreground mt-1 lowercase tracking-[0.04em]"
                  style={{ fontFamily: "var(--font-ui)", fontVariant: "small-caps" }}
                >
                  {shape.meta}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">{shape.body}</p>
              </div>
            ))}
          </div>
          <p className="text-base text-muted-foreground leading-relaxed mt-6">
            These aren't rigid, and they aren't priced off a menu. We almost always start with a
            short call to work out which one—if any—actually fits, and what a fair scope and price
            look like for your problem.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={capStyle}>
            About
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I'm a geospatial technologist and researcher based in London. I co-founded Toucan
            Protocol, spent time at Ordnance Survey, hold an MSc from UCL's Centre for Advanced
            Spatial Analysis, and am a Research Affiliate at the University of Maryland's Department
            of Geography.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            My work sits where geospatial data, machine learning, and agentic systems meet—which is
            exactly where a lot of early-stage companies are now trying to find their footing.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header text-xs mb-4" style={capStyle}>
            Get in touch
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            If any of this sounds like your problem, I'd like to hear about it. The right starting
            point is almost always a short conversation—tell me what you're working on and where
            you're stuck.
          </p>
          <a
            href="mailto:john@johnx.co?subject=Working%20together"
            className="text-lg underline underline-offset-2 hover:text-primary transition-colors"
          >
            john@johnx.co
          </a>
        </section>
      </div>
    </LayoutShell>
  )
}
