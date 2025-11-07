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
    ],
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
