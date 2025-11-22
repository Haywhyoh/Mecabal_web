import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'mecabal.com',
      },
      {
        protocol: 'https',
        hostname: 'api.mecabal.com',
      },
      {
        protocol: 'https',
        hostname: '6unny.nyc3.cdn.digitaloceanspaces.com',
      },
      // Allow any DigitalOcean Spaces CDN subdomain (use specific pattern)
      {
        protocol: 'https',
        hostname: '*.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
