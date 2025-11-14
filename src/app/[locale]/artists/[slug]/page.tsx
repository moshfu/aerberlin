import { cache } from "react";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";
import { urlFor } from "@/lib/sanity.server";
import { getArtistBySlug, getArtists } from "@/server/sanity";
import { absoluteUrl } from "@/lib/utils";
import type { SanityArtist, SanityRelease } from "@/lib/sanity.types";

interface ArtistPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const revalidate = 120;

export async function generateStaticParams() {
  const artists = await getArtists();
  return artists.flatMap((artist) =>
    siteConfig.locales.map((locale) => ({
      locale,
      slug: artist.slug,
    })),
  );
}

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) {
    return {};
  }
  const title = `${artist.name} · ${siteConfig.name}`;
  const imageUrl = artist.portrait?.asset
    ? urlFor(artist.portrait).width(1200).height(1500).quality(85).url()
    : "/og.jpg";
  const description = artist.tags?.join(", ") ?? artist.role ?? undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArtistPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const [artist, allArtists] = await Promise.all([getArtistBySlug(slug), getArtists()]);
  if (!artist) {
    notFound();
  }

  const [t] = await Promise.all([getTranslations("artists")]);
  const marquee = artist.marqueeText ?? `${artist.name.toUpperCase()} // LIVE TRANSMISSIONS`;
  const role = artist.role ?? t("title");
  const portrait = artist.portrait?.asset
    ? urlFor(artist.portrait).width(960).height(1200).quality(85).url()
    : null;
  const tags = artist.tags ?? [];

  const ordered = [...allArtists].sort((a, b) => a.name.localeCompare(b.name));
  const idx = ordered.findIndex((entry) => entry.slug === artist.slug);
  const hasNeighbours = ordered.length > 1 && idx !== -1;
  const prevArtist = hasNeighbours
    ? ordered[(idx - 1 + ordered.length) % ordered.length]
    : null;
  const nextArtist = hasNeighbours ? ordered[(idx + 1) % ordered.length] : null;

  const socialEntries = [
    artist.socials?.soundcloud ? { label: "SoundCloud", href: artist.socials.soundcloud } : null,
    artist.socials?.bandcamp ? { label: "Bandcamp", href: artist.socials.bandcamp } : null,
    artist.socials?.spotify ? { label: "Spotify", href: artist.socials.spotify } : null,
    artist.socials?.instagram ? { label: "Instagram", href: artist.socials.instagram } : null,
    artist.socials?.youtube ? { label: "YouTube", href: artist.socials.youtube } : null,
  ].filter((entry): entry is SocialLink => Boolean(entry));

  const featuredReleases = artist.featuredReleases?.length
    ? artist.featuredReleases
        .filter((release) => (release?.release || release?.url))
        .slice(0, 3)
    : artist.featuredReleaseUrl
      ? [{ title: undefined, url: artist.featuredReleaseUrl }]
      : [];

  return (
    <>
      <SubpageFrame
        title={artist.name}
        description={<p>{role}</p>}
        marqueeText={marquee}
        meta={
          tags.length ? (
            <div className="aer-tag-strip">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null
        }
      >
        <div className="aer-artist-layout">
          <aside className="aer-artist-media">
            {portrait ? (
              <figure className="aer-portrait">
                <Image
                  src={portrait}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 540px"
                />
              </figure>
            ) : null}
            <div className="aer-social-links aer-social-links--filled">
              {socialEntries.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  className="aer-nav-button aer-nav-button--compact"
                >
                  {entry.label}
                </a>
              ))}
              <a
                href="mailto:booking@aerberlin.de"
                className="aer-nav-button aer-nav-button--compact"
              >
                Booking
              </a>
            </div>
            {artist.pressKit?.url ? (
              <a
                href={artist.pressKit.url}
                target="_blank"
                rel="noreferrer"
                className="aer-nav-button aer-nav-button--compact"
              >
                Download press kit
              </a>
            ) : null}
          </aside>

          <div className="aer-artist-content">
            <article className="aer-panel">
              <div className="aer-panel__meta">About</div>
              <PortableTextContent
                value={artist.bio ?? []}
                className="aer-panel__content space-y-4"
              />
            </article>

            {featuredReleases.length ? (
              <section className="aer-featured-release-grid">
                {featuredReleases.map((release, index) => (
                  <FeaturedReleaseCard
                    key={release.release?._id ?? release.url ?? `featured-${index}`}
                    release={release}
                  />
                ))}
              </section>
            ) : null}

            {artist.gallery?.length ? (
              <section className="aer-grid aer-grid--masonry">
                {artist.gallery.map((image) => (
                  <figure key={image.asset._ref} className="aer-gallery-thumb">
                    <Image
                      src={urlFor(image).width(1000).height(800).quality(80).url()}
                      alt={`${artist.name} gallery`}
                      width={1000}
                      height={800}
                      className="aer-gallery-thumb__img"
                    />
                  </figure>
                ))}
              </section>
            ) : null}
          </div>
        </div>
      </SubpageFrame>

      <StructuredData artist={artist} socials={socialEntries.map((entry) => entry.href)} />
      {hasNeighbours ? (
        <nav className="aer-artist-switch" aria-label="Switch artist">
          {prevArtist ? (
            <Link
              href={`/artists/${prevArtist.slug}`}
              aria-label={`Previous artist: ${prevArtist.name}`}
            >
              {"<"}
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {nextArtist ? (
            <Link
              href={`/artists/${nextArtist.slug}`}
              aria-label={`Next artist: ${nextArtist.name}`}
            >
              {">"}
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      ) : null}
    </>
  );
}

function StructuredData({ artist, socials }: { artist: SanityArtist; socials: string[] }) {
  const sameAs = socials.length ? socials : undefined;
  const image = artist.portrait?.asset
    ? urlFor(artist.portrait).width(1200).height(1500).quality(80).url()
    : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    url: absoluteUrl(`/artists/${artist.slug}`),
    genre: artist.tags ?? undefined,
    image,
    sameAs,
    member: artist.role,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  );
}

interface SocialLink {
  label: string;
  href: string;
}

type StreamingPlatform = "spotify" | "soundcloud" | "bandcamp" | "youtube" | "external";
type StreamingPlatformWithLink = Exclude<StreamingPlatform, "external">;

interface FeaturedReleaseLink {
  title?: string;
  url?: string;
  platform?: StreamingPlatform;
  release?: SanityRelease;
}

async function FeaturedReleaseCard({ release }: { release: FeaturedReleaseLink }) {
  const resolvedRelease = release.release;
  const resolvedTitle = release.title ?? resolvedRelease?.title ?? undefined;
  const normalizedTitle = resolvedTitle?.trim();
  const showHeading =
    !!normalizedTitle && normalizedTitle.toLowerCase() !== "featured release";

  const listen = resolveListenLink(release);
  const cover = await resolveCoverImage(release, resolvedRelease);

  return (
    <article className="aer-panel aer-featured-release">
      <span className="aer-featured-release__label">Featured Release</span>
      {showHeading ? <h3 className="aer-featured-release__title">{resolvedTitle}</h3> : null}
      <div className="aer-featured-release__thumb">
        {cover ? (
          <Image
            src={cover.url}
            alt={resolvedTitle ?? "Featured release artwork"}
            width={640}
            height={640}
            sizes="(max-width: 640px) 70vw, 240px"
            className="aer-featured-release__image"
            unoptimized={cover.unoptimized}
            priority={false}
          />
        ) : (
          <span className="aer-featured-release__fallback" aria-hidden="true" />
        )}
      </div>
      {listen ? (
        <div className="aer-featured-release__actions">
          <a
            className="aer-nav-button aer-nav-button--compact aer-featured-release__cta"
            href={listen.href}
            target="_blank"
            rel="noreferrer"
          >
            {listen.label}
          </a>
        </div>
      ) : null}
    </article>
  );
}

function resolveListenLink(entry: FeaturedReleaseLink): { href: string; label: string } | null {
  const platformOrder: Array<{ key: StreamingPlatformWithLink; label: string }> = [
    { key: "spotify", label: "Listen on Spotify" },
    { key: "soundcloud", label: "Listen on SoundCloud" },
    { key: "bandcamp", label: "Open on Bandcamp" },
    { key: "youtube", label: "Watch on YouTube" },
  ];

  const selectFromRelease = (platform: StreamingPlatform | undefined): { href: string; label: string } | null => {
    const releaseLinks = entry.release?.links;
    if (!releaseLinks) {
      return null;
    }

    if (platform && platform !== "external") {
      const target = platform as StreamingPlatformWithLink;
      const href = releaseLinks[target];
      if (href) {
        const found = platformOrder.find((item) => item.key === target);
        return found ? { href, label: found.label } : { href, label: "Listen" };
      }
      return null;
    }

    for (const item of platformOrder) {
      const href = releaseLinks[item.key];
      if (href) {
        return { href, label: item.label };
      }
    }

    return null;
  };

  if (entry.platform === "external" && entry.url) {
    return { href: entry.url, label: "Listen" };
  }

  const releaseLink = selectFromRelease(entry.platform);
  if (releaseLink) {
    return releaseLink;
  }

  if (entry.url) {
    const provider = detectProvider(entry.url);
    if (provider) {
      const found = platformOrder.find((item) => item.key === provider);
      if (found) {
        return { href: entry.url, label: found.label };
      }
    }
    return { href: entry.url, label: "Listen" };
  }

  return null;
}

function detectProvider(url: string): StreamingPlatformWithLink | null {
  try {
    const host = new URL(url).hostname;
    if (host.includes("spotify.")) return "spotify";
    if (host.includes("soundcloud.")) return "soundcloud";
    if (host.includes("bandcamp.")) return "bandcamp";
    if (host.includes("youtube.") || host.includes("youtu.be")) return "youtube";
    return null;
  } catch {
    return null;
  }
}

type CoverInfo = { url: string; unoptimized?: boolean };

const fetchProviderThumbnail = cache(async (provider: StreamingPlatformWithLink, url: string): Promise<string | null> => {
  let endpoint: string | null = null;
  switch (provider) {
    case "soundcloud":
      endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`;
      break;
    case "spotify":
      endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      break;
    case "bandcamp":
      endpoint = `https://bandcamp.com/oembed?format=json&url=${encodeURIComponent(url)}`;
      break;
    case "youtube":
      endpoint = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
      break;
    default:
      endpoint = null;
  }

  if (!endpoint) return null;

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 60 * 60 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch (error) {
    console.error("oEmbed cover fetch failed", provider, error);
    return null;
  }
});

async function resolveCoverImage(entry: FeaturedReleaseLink, release?: SanityRelease): Promise<CoverInfo | null> {
  if (release?.cover?.asset) {
    return {
      url: urlFor(release.cover).width(640).height(640).quality(80).url(),
    };
  }

  const linkCandidates: string[] = [];

  if (entry.platform && entry.platform !== "external") {
    const candidate = release?.links?.[entry.platform as StreamingPlatformWithLink];
    if (candidate) linkCandidates.push(candidate);
  }

  if (release?.links) {
    for (const key of Object.keys(release.links) as StreamingPlatformWithLink[]) {
      const href = release.links[key];
      if (href) linkCandidates.push(href);
    }
  }

  if (entry.url) {
    linkCandidates.push(entry.url);
  }

  const seen = new Set<string>();
  for (const candidate of linkCandidates) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    const provider = detectProvider(candidate);
    if (!provider) continue;
    const thumbnail = await fetchProviderThumbnail(provider, candidate);
    if (thumbnail) {
      return { url: thumbnail, unoptimized: true };
    }
  }

  return null;
}
