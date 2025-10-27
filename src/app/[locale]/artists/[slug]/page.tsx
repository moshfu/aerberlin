import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";
import { urlFor } from "@/lib/sanity.server";
import { getArtistBySlug, getArtists } from "@/server/sanity";
import { absoluteUrl } from "@/lib/utils";
import type { SanityArtist } from "@/lib/sanity.types";

interface ArtistPageProps {
  params: { locale: string; slug: string };
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
  const artist = await getArtistBySlug(params.slug);
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

export default async function ArtistPage({ params: { slug } }: ArtistPageProps) {
  const artist = await getArtistBySlug(slug);
  if (!artist) {
    notFound();
  }

  const [t, navT] = await Promise.all([
    getTranslations("artists"),
    getTranslations("navigation"),
  ]);
  const tags = artist.tags ?? [];
  const marquee = `${artist.name.toUpperCase()} // LIVE TRANSMISSIONS`;
  const role = artist.role ?? t("title");
  const portrait = artist.portrait?.asset
    ? urlFor(artist.portrait).width(1400).height(1700).quality(85).url()
    : null;

  const socialEntries = [
    artist.socials?.soundcloud ? { label: "SoundCloud", href: artist.socials.soundcloud } : null,
    artist.socials?.bandcamp ? { label: "Bandcamp", href: artist.socials.bandcamp } : null,
    artist.socials?.spotify ? { label: "Spotify", href: artist.socials.spotify } : null,
    artist.socials?.instagram ? { label: "Instagram", href: artist.socials.instagram } : null,
    artist.socials?.youtube ? { label: "YouTube", href: artist.socials.youtube } : null,
  ].filter((entry): entry is { label: string; href: string } => Boolean(entry));

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <>
      <SubpageFrame
        title={artist.name}
        eyebrow="Profile"
        description={<p>{role}</p>}
        marqueeText={marquee}
        navigation={navigation}
        meta={
          tags.length ? (
            <div className="aer-tag-strip">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null
        }
        footnote="Profile content syncs directly from Sanity."
      >
        <div className="aer-grid aer-grid--two">
          <div className="aer-grid">
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
            {artist.pressKit?.url ? (
              <a
                href={artist.pressKit.url}
                target="_blank"
                rel="noreferrer"
                className="aer-rail__cta"
              >
                Download press kit
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>

          <article className="aer-panel">
            <div className="aer-panel__meta">Biography</div>
            <PortableTextContent
              value={artist.bio ?? []}
              className="aer-panel__content space-y-4"
            />
          </article>
        </div>

        {socialEntries.length ? (
          <section className="aer-panel">
            <div className="aer-panel__meta">Channels</div>
            <div className="aer-list">
              {socialEntries.map((entry) => (
                <a
                  key={entry.label}
                  href={entry.href}
                  target="_blank"
                  rel="noreferrer"
                  className="aer-list__item"
                >
                  <span className="aer-list__label">{entry.label}</span>
                  <span className="aer-list__value">{formatSocialHref(entry.href)}</span>
                </a>
              ))}
            </div>
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
      </SubpageFrame>

      <StructuredData artist={artist} socials={socialEntries.map((entry) => entry.href)} />
    </>
  );
}

function formatSocialHref(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");
    return `${host}${path}`;
  } catch {
    return url.replace(/^https?:\/\//, "");
  }
}

function StructuredData({
  artist,
  socials,
}: {
  artist: SanityArtist;
  socials: string[];
}) {
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
