import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getArtists } from "@/server/sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { urlFor } from "@/lib/sanity.server";
import { absoluteUrl, cn } from "@/lib/utils";
import { buildCanonical } from "@/lib/seo";
import type { SanityArtist } from "@/lib/sanity.types";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = buildCanonical(`/${locale}/artists`);
  return {
    title: "AER Artists & Residents",
    description: "Meet the AER Kollektiv Berlin residents, guests, and sonic conspirators shaping our music.",
    keywords: ["aer artists", "aer kollektiv artists", "aer berlin collective", "aer music roster", "berlin electronic artists"],
    alternates: { canonical: url },
    openGraph: {
      url,
      title: "AER Kollektiv Berlin Artists",
      description: "Explore the AER Kollektiv Berlin roster of residents and guests.",
    },
    twitter: {
      title: "AER Artists",
      description: "AER Kollektiv Berlin residents, guests, and collaborators.",
    },
  };
}

export default async function ArtistsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ locale: string }>;
}) {
  const [search, { locale }] = await Promise.all([searchParams, params]);
  const [t, general] = await Promise.all([
    getTranslations("artists"),
    getTranslations("general"),
  ]);
  const artists = await getArtists();

  const filterParam = typeof search.filter === "string" ? search.filter : "all";
  const filter = filterParam === "residents" || filterParam === "guests" ? filterParam : "all";
  const filtered = artists.filter((artist) => {
    const role = artist.role?.toLowerCase();
    if (filter === "residents") {
      return role === "resident";
    }
    if (filter === "guests") {
      return role === "guest";
    }
    return true;
  });

  return (
    <>
      <SubpageFrame
        title={t("title")}
        marqueeText="// ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS //"
        description={<p>Residents. Guest. Sonic conspirators.</p>}
        actions={
          <nav className="aer-chipset flex flex-wrap gap-3" aria-label="Artist filters">
            <FilterLink label={t("filters.all")} value="all" active={filter === "all"} />
            <FilterLink label={t("filters.residents")} value="residents" active={filter === "residents"} />
            <FilterLink label={t("filters.guests")} value="guests" active={filter === "guests"} />
          </nav>
        }
      >
        <div className="aer-grid aer-grid--two">
          {filtered.map((artist) => (
            <ArtistTile key={artist._id} artist={artist} readMoreLabel={general("readMore")} />
          ))}
        </div>
      </SubpageFrame>

      <ArtistsStructuredData locale={locale} artists={filtered} />
    </>
  );
}

function ArtistsStructuredData({ locale, artists }: { locale: string; artists: SanityArtist[] }) {
  const baseUrl = absoluteUrl(`/${locale}/artists`);
  const itemList = artists.slice(0, 30).map((artist, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(`/${locale}/artists/${artist.slug}`),
    name: artist.name,
    genre: artist.tags ?? undefined,
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AER Kollektiv Berlin artists",
    description: "Roster of AER Kollektiv Berlin residents, guests, and collaborators.",
    url: baseUrl,
    itemListElement: itemList,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Artists",
        item: baseUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb),
        }}
      />
    </>
  );
}

function FilterLink({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <Link
      href={
        value === "all"
          ? { pathname: "/artists" }
          : { pathname: "/artists", query: { filter: value } }
      }
      className={cn("aer-nav-button aer-nav-button--compact", active && "is-active")}
    >
      {label}
    </Link>
  );
}

function ArtistTile({
  artist,
  readMoreLabel,
}: {
  artist: SanityArtist;
  readMoreLabel: string;
}) {
  const role = artist.role?.trim();
  const rawTags = [role, ...(artist.tags ?? [])].filter(Boolean);
  const tags = Array.from(
    new Map(rawTags.map((tag) => [tag!.toLowerCase(), tag!])),
  ).map(([, tag]) => tag);
  const portrait = artist.portrait?.asset
    ? urlFor(artist.portrait).width(640).height(640).quality(80).url()
    : null;

  // Heuristic: auto scale X based on name length if no manual size provided
  const nameLength = artist.name.length;
  const autoScaleX = Math.max(0.7, Math.min(1.6, 18 / Math.max(8, nameLength)));
  const scaleX = Math.min(1.6, Math.max(0.6, artist.nameSize ?? autoScaleX));
  const scaleY = Math.min(1.6, Math.max(1, artist.nameStretchY ?? 1.25));

  const nameStyle: CSSProperties & Record<"--artist-scale-x" | "--artist-scale-y" | "--artist-scale-width", string | number> = {
    "--artist-scale-x": scaleX,
    "--artist-scale-y": scaleY,
    "--artist-scale-width": `${(1 / scaleX) * 100}%`,
  };

  return (
    <Link
      href={`/artists/${artist.slug}`}
      className="group block focus-visible:outline-none"
      aria-label={`${artist.name} — ${readMoreLabel}`}
    >
      <article className="aer-panel aer-artist transition-colors duration-200 group-hover:border-[rgba(255,255,255,0.32)] group-focus-visible:border-[rgba(255,255,255,0.32)]">
        <header className="aer-artist__headline">
          <div className="aer-artist__intro">
            <h3
              className="aer-artist__name"
              style={nameStyle}
            >
              {artist.name}
            </h3>
            {artist.shortDescription ? (
              <p className="aer-artist__desc">{artist.shortDescription}</p>
            ) : null}
            {tags.length ? (
              <div className="aer-tag-strip aer-artist__tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="aer-artist__media">
            <div className="aer-artist__thumb">
              {portrait ? (
                <Image src={portrait} alt={artist.name} fill sizes="180px" />
              ) : (
                <span>{artist.name.slice(0, 3).toUpperCase()}</span>
              )}
            </div>
            <span className="aer-nav-button aer-nav-button--compact aer-artist__readmore">
              {readMoreLabel}
            </span>
          </div>
        </header>
      </article>
    </Link>
  );
}
