import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Standard-Limit ist 1MB, das reicht nicht für Kartenbilder
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
