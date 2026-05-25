import type { NextConfig } from "next";

// Inject build timestamp so the deployed bundle can show its version
const BUILD_VERSION =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  new Date().toISOString().slice(0, 16).replace("T", " ");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VERSION,
  },
  async headers() {
    return [
      {
        // HTML pages and APIs — never cache. Forces every visit to fetch
        // the latest server-rendered HTML, which references the latest
        // hashed JS chunks.
        source: "/((?!_next/static).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
