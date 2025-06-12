import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Development experience enhancements
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure proper static file handling
  trailingSlash: false,
  // Environment variable validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
