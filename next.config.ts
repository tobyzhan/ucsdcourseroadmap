import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for pdf-parse (uses Node.js canvas/fs internals)
  turbopack: {},
  serverExternalPackages: ['pdf-parse'],
};

export default nextConfig;
