/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow cross-origin requests from local network IPs during development
  allowedDevOrigins: ['26.168.204.43', 'localhost', '127.0.0.1'],
  images: {
    domains: ['localhost', 'images.unsplash.com', 'picsum.photos', 'loremflickr.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig
