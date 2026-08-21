/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/notes/mlx-retrospective',
        destination: 'https://www.x25bd.com/posts/retrospective-deep-learning-system-design',
        permanent: true,
      },
      {
        // Bare URL (no extension) resolves to the PDF. Temporary so a richer
        // interactive web version can take over this path later.
        source: '/cv/ai-governance',
        destination: '/cv/ai-governance.pdf',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/presentations/ai-agents',
        destination: '/presentations/ai-agents/index.html',
      },
      {
        source: '/presentations/os-poc',
        destination: '/presentations/os-poc/index.html',
      },
      {
        // Standalone full-viewport interactive visualization, served as a
        // static asset with a clean URL.
        source: '/demos/location-evidence-evals',
        destination: '/demos/location-evidence-evals/index.html',
      },
      {
        // The demo's mobile scroll story (small screens are redirected to
        // it by the page itself), same clean-URL treatment.
        source: '/demos/location-evidence-evals/story',
        destination: '/demos/location-evidence-evals/story.html',
      },
    ]
  },
  async headers() {
    return [
      {
        // Serve the CV inline in the browser, but suggest a human-readable
        // filename when the viewer saves or downloads it.
        source: '/cv/ai-governance.pdf',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline; filename="John Hoopes -- AI Governance.pdf"',
          },
        ],
      },
      {
        // Demos are unlisted: reachable by URL, kept out of search indexes,
        // matching the robots policy on the app-router demo pages.
        source: '/demos/location-evidence-evals',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Same policy for the underlying static file paths and the story's
        // clean URL.
        source: '/demos/location-evidence-evals/:file(index\\.html|story|story\\.html)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ]
  },
}

export default nextConfig