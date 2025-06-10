import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we're using the App Router (default in Next.js 15)
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Enable React strict mode
  reactStrictMode: true,
  // Disable trailing slash
  trailingSlash: false,
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    // Ignore false positives for Lucide React icons
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
