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
      {
        // The demo launched under this slug and the URL has been shared, so
        // it forwards to the canonical name below.
        source: '/demos/location-evidence-evals',
        destination: '/demos/verifying-compute-location',
        permanent: true,
      },
      {
        // Same forwarding for the story view and the raw .html file paths.
        source: '/demos/location-evidence-evals/:path*',
        destination: '/demos/verifying-compute-location/:path*',
        permanent: true,
      },
      {
        // Short, speakable alias for the demo — easy to type or say aloud.
        // Temporary so the quicklink can be repointed later.
        source: '/vcl',
        destination: '/demos/verifying-compute-location',
        permanent: false,
      },
      {
        // Short, speakable alias for the RISE workshop deck, following the
        // /vcl precedent. Temporary so it can be repointed at a later design.
        source: '/rise',
        destination: '/presentations/rise-design-01',
        permanent: false,
      },
      {
        // Short, speakable alias for the Verifiable AI message house deck,
        // same precedent. Temporary so it can be repointed as the messaging
        // settles on a single house per audience.
        source: '/vai',
        destination: '/presentations/vai-message-house',
        permanent: false,
      },
      {
        // Short, speakable alias for the chip registry demo shown at UNGA.
        // Temporary so it can be repointed later. It needs no gate of its
        // own: the destination is passphrase-gated by the proxy.
        source: '/unga',
        destination: '/demos/chip-registry',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    // afterFiles: applied only after a request misses every real file under
    // public/, so bundled assets keep winning and only the clean URLs and the
    // SPA's client routes fall through to an index.html.
    return {
      afterFiles: [
        {
          source: '/presentations/ai-agents',
          destination: '/presentations/ai-agents/index.html',
        },
        {
          source: '/presentations/os-poc',
          destination: '/presentations/os-poc/index.html',
        },
        {
          source: '/presentations/rise-design-01',
          destination: '/presentations/rise-design-01/index.html',
        },
        {
          source: '/presentations/vai-message-house',
          destination: '/presentations/vai-message-house/index.html',
        },
        {
          // Standalone full-viewport interactive visualization, served as a
          // static asset with a clean URL.
          source: '/demos/verifying-compute-location',
          destination: '/demos/verifying-compute-location/index.html',
        },
        {
          // The demo's mobile scroll story (small screens are redirected to
          // it by the page itself), same clean-URL treatment.
          source: '/demos/verifying-compute-location/story',
          destination: '/demos/verifying-compute-location/story.html',
        },
        {
          // Chip registry demo (a Vite/React build), same clean-URL treatment.
          source: '/demos/chip-registry',
          destination: '/demos/chip-registry/index.html',
        },
        {
          // The demo is client-routed (react-router), so every path under it
          // that is not a real file in public/ must serve the SPA shell and let
          // the router take it from there.
          source: '/demos/chip-registry/:path*',
          destination: '/demos/chip-registry/index.html',
        },
      ],
    }
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
        source: '/demos/verifying-compute-location',
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
        source: '/demos/verifying-compute-location/:file(index\\.html|story|story\\.html)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // The RISE deck is unreleased and passphrase-gated, so keep it and
        // everything it loads out of search indexes entirely.
        source: '/presentations/rise-design-01/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Same policy for the clean URL that the rewrite above serves.
        source: '/presentations/rise-design-01',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // The message house deck is an internal working draft and is
        // passphrase-gated, so keep it out of search indexes entirely.
        source: '/presentations/vai-message-house/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Same policy for the clean URL that the rewrite above serves.
        source: '/presentations/vai-message-house',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // The chip registry demo is pre-release and passphrase-gated, so
        // keep it and everything it loads out of search indexes entirely.
        source: '/demos/chip-registry/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Same policy for the clean URL that the rewrite above serves.
        source: '/demos/chip-registry',
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