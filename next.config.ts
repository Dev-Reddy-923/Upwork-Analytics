import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint and TypeScript configs are now handled differently in Next.js 16
  // They can be configured via eslint.config.mjs and tsconfig.json respectively
  experimental: {
    // optimizeCss: true, // Disabled to avoid critters dependency issue
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vercel.com',
      },
    ],
    unoptimized: false,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  generateEtags: false,
  compress: true,
  reactStrictMode: true,
  trailingSlash: false,
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
