/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Production optimizations
  compress: true,

  // ✅ Enable ESLint checks during builds for better code quality
  // This prevents bugs from reaching production
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ Enable TypeScript checks during builds
  // Type errors will be caught early, preventing runtime bugs
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization configuration
  images: {
    // Allow loading images from backend API
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '*.elb.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.elb.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Standalone output for Amplify (optimized deployment)
  output: 'standalone',

  // Turbopack (for development)
  turbopack: {},

  // Environment variables validation (these must be set in Amplify Console)
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
