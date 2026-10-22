import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [
      { source: '/services', destination: '/api/services' },
      { source: '/bookings', destination: '/api/bookings' },
      { source: '/bookings/:id', destination: '/api/bookings/:id' },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
