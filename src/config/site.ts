export const siteConfig = {
  name: "aer berlin",
  slug: "aerberlin",
  defaultLocale: "en" as const,
  locales: ["en"] as const,
  description:
    "AER BERLIN: Precise sets. Heavy sound. Open floor.",
  brand: {
    tagline: "LIVE. CAPTURED. ARCHIVED.",
    accent: "#FF102A",
    logo: "/media/aer-logo.jpg",
  },
  social: {
    instagram: "https://instagram.com/aer.berlin",
    soundcloud: "https://soundcloud.com/aer-berlin",
    bandcamp: "https://aerberlin.bandcamp.com",
    spotify: "",
    youtube: "https://youtube.com/@aerberlin",
    tiktok: "",
  },
  contactEmail: "support@aerberlin.de",
  navigation: [
    { key: "events", href: "/events" },
    { key: "artists", href: "/artists" },
    { key: "music", href: "/music" },
    { key: "about", href: "/about" },
  ],
  legalLinks: [
    { key: "imprint", href: "/imprint" },
    { key: "privacy", href: "/privacy" },
    { key: "terms", href: "/terms" },
  ],
};

export type Locale = (typeof siteConfig.locales)[number];
