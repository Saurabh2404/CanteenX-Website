import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    // Vercel Services owns public API routing in hosted deployments.
    if (process.env.VERCEL) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://127.0.0.1:5001"}/api/:path*`,
      },
    ];
  },
};
export default config;
