import { cache } from "react";
import { serverConfig } from "@/server/config";
import {
  artistBySlugQuery,
  artistsQuery,
  eventBySlugQuery,
  eventsQuery,
  galleryQuery,
  homepageQuery,
  pageBySlugQuery,
  releasesQuery,
} from "@/lib/sanity.queries";
import { sanityClient } from "@/lib/sanity.server";
import type {
  SanityArtist,
  SanityEvent,
  SanityGalleryItem,
  SanityPage,
  SanityRelease,
} from "@/lib/sanity.types";
import {
  mockArtists,
  mockEvents,
  mockGallery,
  mockPages,
  mockReleases,
} from "@/server/fixtures";

const useMockContent = serverConfig.useMockSanity;

async function fetchOrFallback<T>(fetcher: () => Promise<T>, fallback: () => T): Promise<T> {
  if (useMockContent) {
    return fallback();
  }
  try {
    return await fetcher();
  } catch (error) {
    if (serverConfig.nodeEnv !== "production") {
      console.warn("Sanity fetch failed, serving mock data", error);
      return fallback();
    }
    throw error;
  }
}

export const getHomepageData = cache(async () => {
  return fetchOrFallback(
    () =>
      sanityClient.fetch(homepageQuery) as Promise<{
        events: SanityEvent[];
        pastEvents: SanityEvent[];
        latestRelease: SanityRelease | null;
      }>,
    () => ({
      events: mockEvents.filter((event) => new Date(event.start) >= new Date()).slice(0, 2),
      pastEvents: mockEvents.filter((event) => new Date(event.start) < new Date()),
      latestRelease: mockReleases[0] ?? null,
    }),
  );
});

export async function getEvents() {
  return fetchOrFallback(
    () => sanityClient.fetch(eventsQuery) as Promise<SanityEvent[]>,
    () => mockEvents,
  );
}

export async function getEventBySlug(slug: string) {
  if (useMockContent) {
    return mockEvents.find((event) => event.slug === slug) ?? null;
  }
  return sanityClient.fetch(eventBySlugQuery, { slug }) as Promise<SanityEvent | null>;
}

export async function getArtists() {
  // Do not memoize: we want Sanity edits (like name size/stretch tweaks) to show up immediately.
  return fetchOrFallback(
    () => sanityClient.fetch(artistsQuery) as Promise<SanityArtist[]>,
    () => mockArtists,
  );
}

export async function getArtistBySlug(slug: string) {
  if (useMockContent) {
    return mockArtists.find((artist) => artist.slug === slug) ?? null;
  }
  return sanityClient.fetch(artistBySlugQuery, { slug }) as Promise<SanityArtist | null>;
}

export const getReleases = cache(async () => {
  return fetchOrFallback(
    () => sanityClient.fetch(releasesQuery) as Promise<SanityRelease[]>,
    () => mockReleases,
  );
});

export const getGalleryItems = cache(async () => {
  return fetchOrFallback(
    () => sanityClient.fetch(galleryQuery) as Promise<SanityGalleryItem[]>,
    () => mockGallery,
  );
});

export const getPageBySlug = cache(async (slug: string) => {
  if (useMockContent) {
    return mockPages.find((page) => page.slug === slug) ?? null;
  }
  return sanityClient.fetch(pageBySlugQuery, { slug }) as Promise<SanityPage | null>;
});
