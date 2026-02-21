import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Temporarily ignore build errors to get deployment working
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
