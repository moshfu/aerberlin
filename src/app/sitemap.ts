import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getArtists, getEvents } from "@/server/sanity";
import { buildCanonical, getSiteUrl } from "@/lib/seo";

const staticPaths = [
  "/",
  `/${siteConfig.defaultLocale}`,
  `/${siteConfig.defaultLocale}/about`,
  `/${siteConfig.defaultLocale}/artists`,
  `/${siteConfig.defaultLocale}/events`,
  `/${siteConfig.defaultLocale}/music`,
  `/${siteConfig.defaultLocale}/gallery`,
  `/${siteConfig.defaultLocale}/tickets`,
  `/${siteConfig.defaultLocale}/imprint`,
  `/${siteConfig.defaultLocale}/privacy`,
  `/${siteConfig.defaultLocale}/terms`,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();
  const resolveUpdatedAt = (input: unknown) => {
    if (!input || typeof input !== "object") return undefined;
    const record = input as { _updatedAt?: string; updatedAt?: string };
    return record.updatedAt ?? record._updatedAt;
  };
  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: buildCanonical(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" || path === `/${siteConfig.defaultLocale}` ? 1 : 0.6,
  }));

  try {
    const [artists, events] = await Promise.all([getArtists(), getEvents()]);

    entries.push(
      ...artists
        .filter((artist) => artist.slug && !artist.instagramRedirectOnly)
        .map((artist) => ({
          url: buildCanonical(`/${siteConfig.defaultLocale}/artists/${artist.slug}`),
        lastModified: resolveUpdatedAt(artist) ? new Date(resolveUpdatedAt(artist)!) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        })),
    );

    entries.push(
      ...events.map((event) => ({
        url: buildCanonical(`/${siteConfig.defaultLocale}/events/${event.slug}`),
        lastModified: resolveUpdatedAt(event) ? new Date(resolveUpdatedAt(event)!) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch (error) {
    console.warn("Sitemap generation fell back to static entries", error);
  }

  // De-duplicate in case any URLs repeat.
  const uniqueByUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    uniqueByUrl.set(entry.url, entry);
  }

  return Array.from(uniqueByUrl.values()).map((entry) => ({
    ...entry,
    // Normalize host to the current site URL.
    url: entry.url.replace(/^https?:\/\/[^/]+/, baseUrl),
  }));
}
