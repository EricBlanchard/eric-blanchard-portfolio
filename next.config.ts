import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

function csp(options: { allowEval: boolean; frameAncestors: string }): string {
  return [
    "default-src 'self'",
    // Next.js inlines its bootstrap scripts, so 'unsafe-inline' is needed without nonces.
    // Nonces would force per-request rendering, which this site avoids on purpose.
    `script-src 'self' 'unsafe-inline'${options.allowEval ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${options.frameAncestors}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp({ allowEval: isDev, frameAncestors: "'none'" }) },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

/** Storybook frames its own preview and evaluates story code. */
const storybookHeaders = [
  { key: "Content-Security-Policy", value: csp({ allowEval: true, frameAncestors: "'self'" }) },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    inlineCss: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/storybook/:path*", headers: storybookHeaders },
    ];
  },
  async redirects() {
    return [
      { source: "/storybook", destination: "/storybook/index.html", permanent: false },
      {
        source: "/reports/coverage",
        destination: "/reports/coverage/index.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
