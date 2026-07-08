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
    ]
  },
}

export default nextConfig