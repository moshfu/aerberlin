export const siteConfig = {
  name: "aer berlin",
  slug: "aerberlin",
  defaultLocale: "en" as const,
  locales: ["en"] as const,
  description:
    "aer berlin curates transcendent trance experiences across Berlin — immersive nights, forward-thinking lineups, and inclusive dancefloors.",
  brand: {
    tagline: "immersive trance collective",
    accent: "#FF102A",
    logo: "/media/aer-logo.jpg",
  },
  social: {
    instagram: "https://instagram.com/aer.berlin",
    soundcloud: "https://soundcloud.com/aerberlin",
    bandcamp: "https://aerberlin.bandcamp.com",
    spotify: "https://open.spotify.com/user/aerberlin",
    youtube: "https://youtube.com/@aerberlin",
    tiktok: "https://www.tiktok.com/@aerberlin",
  },
  contactEmail: "admin@aerberlin.de",
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
