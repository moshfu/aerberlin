import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getArtists } from "@/server/sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { urlFor } from "@/lib/sanity.server";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { SanityArtist } from "@/lib/sanity.types";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [t, general, navT] = await Promise.all([
    getTranslations("artists"),
    getTranslations("general"),
    getTranslations("navigation"),
  ]);
  const artists = await getArtists();

  const filter = typeof searchParams.filter === "string" ? searchParams.filter : "all";
  const filtered = artists.filter((artist) => {
    if (filter === "residents") {
      return artist.tags?.some((tag) => tag.toLowerCase().includes("resident"));
    }
    if (filter === "guests") {
      return artist.tags?.some((tag) => tag.toLowerCase().includes("guest"));
    }
    return true;
  });

  const sorted = filter === "a-z"
    ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    : filtered;

  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title={t("title")}
      eyebrow="Roster"
      marqueeText="// ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS //"
      description={<p>Residents, guests and sonic conspirators shaping the aer berlin orbit.</p>}
      navigation={navigation}
      actions={
        <nav className="aer-chipset" aria-label="Artist filters">
          <FilterLink label={t("filters.all")} value="all" active={filter === "all"} />
          <FilterLink label={t("filters.residents")} value="residents" active={filter === "residents"} />
          <FilterLink label={t("filters.guests")} value="guests" active={filter === "guests"} />
          <FilterLink label={t("filters.a-z")} value="a-z" active={filter === "a-z"} />
        </nav>
      }
      footnote={`${sorted.length} artist profiles. Data syncs directly from Sanity.`}
    >
      <div className="aer-grid aer-grid--two">
        {sorted.map((artist) => (
          <ArtistTile key={artist._id} artist={artist} readMoreLabel={general("readMore")} />
        ))}
      </div>
    </SubpageFrame>
  );
}

function FilterLink({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <Link
      href={{ pathname: "/artists", query: { filter: value } }}
      className={cn(active && "is-active")}
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
  const portrait = artist.portrait?.asset
    ? urlFor(artist.portrait).width(480).height(600).quality(75).url()
    : null;

  return (
    <article className="aer-panel aer-artist">
      <header className="aer-artist__headline">
        <div className="aer-artist__intro">
          <span className="aer-panel__meta">
            {artist.role ?? "aer berlin"}
          </span>
          <h3 className="aer-panel__heading">{artist.name}</h3>
        </div>
        <Link href={`/artists/${artist.slug}`} className="aer-artist__thumb">
          {portrait ? (
            <Image src={portrait} alt={artist.name} fill sizes="120px" />
          ) : (
            <span>{artist.name.slice(0, 3).toUpperCase()}</span>
          )}
        </Link>
      </header>

      {artist.tags?.length ? (
        <div className="aer-tag-strip">
          {artist.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}

      <div className="aer-artist__cta">
        <Link href={`/artists/${artist.slug}`} className="aer-rail__cta">
          {readMoreLabel}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
