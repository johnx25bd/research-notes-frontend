import type { Metadata } from "next"
import { LayoutShell } from "@/components/layout-shell"
import { DeckRequestForm } from "@/components/deck-request-form"

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI strategy, education, agentic system design, and prototyping for teams building with AI -- with deep roots in geospatial and location intelligence.",
  openGraph: {
    type: "website",
    title: "Working with me",
    description:
      "Strategy, education, system design, prototyping, due diligence, and fractional technical leadership for teams building with AI and agentic systems.",
    url: "/services",
  },
}

const services = [
  {
    title: "AI strategy",
    summary:
      "Where AI genuinely earns its place in your product or operations, and where it doesn't. A clear, honest view of what to build, in what order, and why.",
    question:
      "Where in this would a language model genuinely change the answer, and where would a classical system be cheaper and more reliable?",
  },
  {
    title: "Education and sensemaking",
    summary:
      "I help you and your team build a clear picture of what's actually happening in AI and why it matters for your work, so you can decide from understanding rather than from pressure.",
    question:
      "Which capability claims should we take seriously this quarter, and which can we wait out without falling behind?",
  },
  {
    title: "Agentic system design",
    summary:
      "Architecture for systems that use language models to reason, plan, and act -- tool use, retrieval, evaluation, and the guardrails that keep them reliable.",
    question:
      "How do we keep an agent's tool use reliable when the long tail of production looks nothing like our eval set?",
  },
  {
    title: "Rapid prototyping",
    summary:
      "Working prototypes, quickly -- so you can put something real in front of users or investors instead of arguing about a slide.",
    question:
      "What is the smallest version of this that would actually teach us what we need to know next?",
  },
  {
    title: "Technical due diligence",
    summary:
      "An assessment of the technical substance of a product, team, or codebase -- for founders sharpening their own thinking, or investors who need a second opinion.",
    question:
      "Is this product genuinely model-bound, or is the demo doing most of the work?",
  },
  {
    title: "Fractional technical leadership",
    summary:
      "A part-time technical lead or AI architect, for when you need senior judgment in the room but not a full-time hire yet.",
    question:
      "Who in our room can push back when a vendor or a model lab tells us what their roadmap will deliver?",
  },
]

const shapes = [
  {
    title: "Discovery engagement",
    meta: "one to two weeks · fixed fee",
    body: "A written diagnosis and a roadmap -- what the real problem is, what's feasible, what to build first, and what to ignore for now. Concrete enough to act on or hand to a developer. The natural first step when you know AI should help but aren't yet sure how.",
  },
  {
    title: "Fractional",
    meta: "one to two days a week · three-month minimum",
    body: "Ongoing senior technical judgment -- architecture decisions, code and design review, prototyping, hiring input, and acting as the AI lead in the room. The deliverable is momentum and good decisions, not a single artifact. For when you have real work in flight and need someone senior shaping it every week, but a full-time hire is premature.",
  },
  {
    title: "Project, fixed fee",
    meta: "scoped outcome · agreed price",
    body: "The thing itself -- a working prototype, a production integration, a due-diligence report -- built to an agreed specification. For when the problem is well enough understood, often after a discovery engagement, that we can name the outcome and fix the price.",
  },
]

// .section-header sets font-size: 1.35rem unlayered, which beats the text-xs
// utility; force the eyebrow size inline so the labels stay small.
const capStyle = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.8125rem",
  letterSpacing: "0.06em",
} as const

export default function ServicesPage() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <section className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-6 animate-fade-in-up">
            Working with me
          </h1>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I work with teams building with AI and agentic systems -- from early-stage startups to
            established organizations -- who have a real problem and a sense that these tools should
            be part of the answer, but who don't yet have the in-house depth to design the system,
            judge the trade-offs, or build the first version.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I'm most useful when the stakes are technical and the path is still uncertain -- when you
            need someone who has built these systems to tell you honestly what's feasible and what
            the smallest valuable first step looks like.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Alongside the consulting, I take a smaller number of research and advisory engagements
            on verified geospatial systems -- provenance, integrity, and trust in spatial
            information. That practice sits next to a lot of current AI safety work.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header mb-3" style={capStyle}>
            What I do
          </h2>
          <div className="space-y-0">
            {services.map((service) => (
              <div key={service.title} className="py-5 border-b border-border/50 last:border-0">
                <div className="font-medium text-foreground mb-1">{service.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.summary}</p>
                <p
                  className="text-sm italic text-muted-foreground/75 mt-2 leading-relaxed"
                  style={{ fontFamily: "var(--font-lora)" }}
                >
                  {service.question}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="section-header mb-3" style={capStyle}>
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
            short call to work out which one -- if any -- actually fits, and what a fair scope and
            price look like for your problem.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header mb-3" style={capStyle}>
            Where to start
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            If you would like a sense of how I think about this work before we talk, I put together a
            short deck -- <em>Building with agents</em> -- a pass through foundational concepts in
            agentic systems, to help build an accurate mental model.
          </p>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            Drop your email and I will send you the link.
          </p>
          <DeckRequestForm />
        </section>

        <section className="mb-16">
          <h2 className="section-header mb-3" style={capStyle}>
            About
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            I'm a geospatial technologist and researcher based in London. I co-founded Toucan
            Protocol, spent time at Ordnance Survey, hold an MSc from UCL's Centre for Advanced
            Spatial Analysis, and am a Research Affiliate at the University of Maryland's Department
            of Geography.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            Geospatial and location intelligence are my specialism, not a limit. The work itself --
            finding where AI fits, making it reliable, building the first version -- applies well
            beyond them.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="section-header mb-3" style={capStyle}>
            Get in touch
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-6">
            If any of this sounds like your problem, I'd like to hear about it. The right starting
            point is almost always a short conversation -- tell me what you're working on and where
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
