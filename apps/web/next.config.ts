import { withSentryConfig } from "@sentry/nextjs"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    optimizePackageImports: ["lucide-react", "motion/react", "@vercel/analytics", "@vercel/speed-insights", "@supabase/ssr", "@sentry/nextjs", "react-hook-form"],
  },
  transpilePackages: ["@wongdigital/db", "@wongdigital/ui"],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
  compress: true,
  headers: async () => {
    const isDev = process.env.NODE_ENV === "development"

    // Build a strict Content-Security-Policy
    const cspDirectives = [
      "default-src 'none'",
      // Scripts: self + trusted third-parties; unsafe-inline kept for Next.js inline scripts,
      // unsafe-eval allowed only in development for React DevTools / HMR
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://va.vercel-scripts.com https://connect.facebook.net`,
      // Styles: unsafe-inline required by Next.js / Tailwind runtime
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: https://*.alipay.com",
      "frame-src 'self' https://challenges.cloudflare.com https://www.facebook.com https://*.alipay.com",
      "media-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      // Hardening directives
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ]

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspDirectives.join("; "),
          },
          // Cross-origin isolation headers
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: "wong-digital",
  project: "wong-digital-store",
  silent: true,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: true,
  },
})

