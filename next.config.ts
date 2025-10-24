import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Helps Next.js find the correct project root in monorepos with multiple lockfiles
  outputFileTracingRoot: __dirname,
  // Disable experimental features that might cause webpack issues
  experimental: {
    optimizePackageImports: [],
  },
  // Disable webpack optimizations that might cause chunk issues
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

export default nextConfig;
