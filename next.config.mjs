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
    ]
  },
}

export default nextConfig