import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { siteConfig } from "@/config/site";
import { buildCanonical, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();
const defaultLocalePath = `/${siteConfig.defaultLocale}`;
const canonicalHome = buildCanonical(defaultLocalePath);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AER Kollektiv Berlin",
    template: `%s | AER Kollektiv Berlin`,
  },
  description: siteConfig.description,
  keywords: [
    "aer kollektiv",
    "aer collective",
    "aer berlin",
    "aer music",
    "aer musik",
    "aer event",
    "berlin trance collective",
    "berlin electronic music events",
    "aer artists",
  ],
  applicationName: siteConfig.name,
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    title: "AER Kollektiv Berlin | Berlin trance collective & events",
    description: siteConfig.description,
    url: siteUrl,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} poster`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AER Kollektiv Berlin",
    description: siteConfig.description,
    images: ["/og.jpg"],
  },
  alternates: {
    canonical: canonicalHome,
    languages: {
      en: canonicalHome,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: siteConfig.brand.accent,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        {children}
        <script
          id="structured-data-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicGroup",
              name: siteConfig.name,
              alternateName: ["AER Collective", "AER Kollektiv", "AER Berlin"],
              url: canonicalHome,
              logo: buildCanonical(siteConfig.brand.logo),
              description: siteConfig.description,
              genre: ["trance", "electronic", "club"],
              foundingLocation: "Berlin, Germany",
              sameAs: [
                siteConfig.social.instagram,
                siteConfig.social.soundcloud,
                siteConfig.social.bandcamp,
                siteConfig.social.youtube,
              ].filter(Boolean),
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: siteConfig.contactEmail,
                  contactType: "customer support",
                  areaServed: "DE",
                  availableLanguage: ["en"],
                },
              ],
            }),
          }}
        />
        <script
          id="structured-data-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              alternateName: ["AER Collective", "AER Kollektiv Berlin", "AER Music"],
              url: canonicalHome,
              inLanguage: "en",
              potentialAction: {
                "@type": "SearchAction",
                target: `${canonicalHome}?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
