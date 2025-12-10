/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optional: Add other Next.js config options here
  // reactStrictMode: true,
  // swcMinify: true,
}

module.exports = nextConfig
