import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getArtists } from "@/server/sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { urlFor } from "@/lib/sanity.server";
import { cn } from "@/lib/utils";
import type { SanityArtist } from "@/lib/sanity.types";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [t, general] = await Promise.all([
    getTranslations("artists"),
    getTranslations("general"),
  ]);
  const artists = await getArtists();

  const filter = typeof params.filter === "string" ? params.filter : "all";
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

  const sorted = filter === "a-z"
    ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    : filtered;

  return (
    <SubpageFrame
      title={t("title")}
      marqueeText="// ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS // ARTISTS //"
      description={<p>Residents. Guest. Sonic conspirators.</p>}
      actions={
        <nav className="aer-chipset flex flex-wrap gap-3" aria-label="Artist filters">
          <FilterLink label={t("filters.all")} value="all" active={filter === "all"} />
          <FilterLink label={t("filters.residents")} value="residents" active={filter === "residents"} />
          <FilterLink label={t("filters.guests")} value="guests" active={filter === "guests"} />
          <FilterLink label={t("filters.a-z")} value="a-z" active={filter === "a-z"} />
        </nav>
      }
    >
      <div className="aer-grid aer-grid--two">
        {sorted.map((artist) => (
          <ArtistTile key={artist._id} artist={artist} readMoreLabel={general("readMore")} />
        ))}
      </div>
    </SubpageFrame>
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
  const portrait = artist.portrait?.asset
    ? urlFor(artist.portrait).width(560).height(700).quality(80).url()
    : null;

  // Heuristic: auto scale X based on name length if no manual size provided
  const nameLength = artist.name.length;
  const autoScaleX = Math.max(0.7, Math.min(1.6, 18 / Math.max(8, nameLength)));
  const scaleX = Math.min(1.6, Math.max(0.6, artist.nameSize ?? autoScaleX));
  const scaleY = Math.min(1.6, Math.max(1, artist.nameStretchY ?? 1.25));
  return (
    <article className="aer-panel aer-artist">
      <header className="aer-artist__headline">
        <div className="aer-artist__intro">
          <h3
            className="aer-artist__name"
            style={{
              transform: `scale(${scaleX}, ${scaleY})`,
              transformOrigin: "left top",
              width: `${(1 / scaleX) * 100}%`,
            }}
          >
            {artist.name}
          </h3>
          {artist.shortDescription ? (
            <p className="aer-artist__desc">{artist.shortDescription}</p>
          ) : null}
        </div>
        <div className="aer-artist__media">
          <Link href={`/artists/${artist.slug}`} className="aer-artist__thumb">
            {portrait ? (
              <Image src={portrait} alt={artist.name} fill sizes="180px" />
            ) : (
              <span>{artist.name.slice(0, 3).toUpperCase()}</span>
            )}
          </Link>
          <Link
            href={`/artists/${artist.slug}`}
            className="aer-nav-button aer-nav-button--compact aer-artist__readmore"
          >
            {readMoreLabel}
          </Link>
        </div>
      </header>
    </article>
  );
}
