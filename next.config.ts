import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Image optimization
  images: {
    domains: ['localhost', 'mecabal.com', 'api.mecabal.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

export default nextConfig;
