import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "export",
  images: {
    unoptimized: true, // Required for static exports in Next.js
  },
};

export default nextConfig;
