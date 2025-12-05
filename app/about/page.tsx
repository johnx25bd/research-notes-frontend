import { LayoutShell } from "@/components/layout-shell"

export default function AboutPage() {
  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-normal text-foreground mb-4 animate-fade-in-up">About this garden</h1>
        <p className="text-lg text-muted-foreground mb-12">A space for ideas to grow at their own pace.</p>

        <div className="prose text-foreground">
          <p>
            This is a digital garden—a collection of notes that grow and evolve over time. Unlike a traditional blog,
            these notes are not organized chronologically. Instead, they form a network of interconnected ideas.
          </p>

          <h2>What is a digital garden?</h2>
          <p>
            A digital garden is a different way of thinking about online presence. It's not a blog, not a portfolio—it's
            a network of evolving ideas. Notes exist at various stages of completion, and that's intentional.
          </p>

          <h2>How to explore</h2>
          <p>There are several ways to navigate this garden:</p>
          <ul>
            <li>Follow the links within notes to discover related ideas</li>
            <li>Use the Map to browse all notes</li>
            <li>Check backlinks to see how notes connect</li>
            <li>Try the random note button for serendipitous discovery</li>
          </ul>

          <h2>Note statuses</h2>
          <p>Each note has a status indicating its maturity:</p>
          <ul>
            <li>
              <strong>Seed</strong> — A nascent idea, barely formed
            </li>
            <li>
              <strong>Budding</strong> — Taking shape but not complete
            </li>
            <li>
              <strong>Evergreen</strong> — Mature, well-developed, and relatively stable
            </li>
          </ul>

          <p>Feel free to wander, wonder, and make your own connections.</p>
        </div>
      </div>
    </LayoutShell>
  )
}
