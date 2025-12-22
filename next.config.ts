import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const plausibleOrigin = parseOrigin(process.env.PLAUSIBLE_DOMAIN);
const scriptSrcDomains = [
  "https://plausible.io",
  "https://*.plausible.io",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://www.gstatic.com",
  "https://www.google.com",
  "https://js.stripe.com",
  "https://checkout.stripe.com",
]
  .concat(plausibleOrigin ? [plausibleOrigin] : [])
  .join(" ");

const connectSrcDomains = [
  "'self'",
  "https://cdn.sanity.io",
  "https://*.sanity.io",
  "https://api.soundcloud.com",
  "https://w.soundcloud.com",
  "https://plausible.io",
  "https://*.plausible.io",
  "https://www.googletagmanager.com",
  "https://www.google-analytics.com",
  "https://api.pretix.eu",
  "https://pretix.eu",
  "https://*.pretix.eu",
  "https://js.stripe.com",
  "https://api.stripe.com",
  "https://checkout.stripe.com",
];
if (plausibleOrigin) {
  connectSrcDomains.push(plausibleOrigin);
}

const imageSrcDomains = [
  "'self'",
  "data:",
  "blob:",
  "https://cdn.sanity.io",
  "https://*.sndcdn.com",
  "https://images.prismic.io",
  "https://res.cloudinary.com",
  "https://i.scdn.co",
  "https://i.ytimg.com",
];

const csp = [
  "default-src 'self';",
  `script-src 'self' 'unsafe-inline' ${scriptSrcDomains};`,
  "style-src 'self' 'unsafe-inline';",
  `img-src ${imageSrcDomains.join(" ")};`,
  "font-src 'self' data:;",
  `connect-src ${connectSrcDomains.join(" ")};`,
  "media-src 'self' data: blob:;",
  "object-src 'none';",
  "base-uri 'self';",
  "form-action 'self';",
  "frame-ancestors 'none';",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com https://w.soundcloud.com;",
  "worker-src 'self' blob:;",
  "upgrade-insecure-requests;",
].join(" ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["sonner"],
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.prismic.io" },
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.sndcdn.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);

function parseOrigin(value: string | undefined | null) {
  if (!value) {
    return null;
  }
  try {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}
