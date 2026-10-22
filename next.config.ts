import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const r2Host = process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null;

const nextConfig: NextConfig = {
  // Cache Components is off for the MVP: every page reads the session or the
  // database, and plain dynamic rendering keeps that simple. Revisit later.
  cacheComponents: false,
  poweredByHeader: false,
  // The dev badge covers the bottom tab bar on phones; error overlays still show.
  devIndicators: false,
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    localPatterns: [{ pathname: "/api/files/**" }, { pathname: "/**", search: "" }],
    remotePatterns: r2Host ? [{ protocol: "https", hostname: r2Host }] : [],
  },
  experimental: {
    serverActions: {
      // Photos are compressed in the browser (~300 KB each), 8 max per listing.
      bodySizeLimit: "12mb",
    },
  },
};

export default withNextIntl(nextConfig);
