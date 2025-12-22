import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getReleases } from "@/server/sanity";
import { urlFor } from "@/lib/sanity.server";
import { MediaEmbed } from "@/components/media/media-embed";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { buildCanonical } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const url = buildCanonical(`/${locale}/music`);
  return {
    title: "Music",
    description: "AER Berlin releases, mixes, and live recordings.",
    alternates: { canonical: url },
    openGraph: {
      url,
      title: "Music | AER BERLIN",
      description: "Listen to AER Berlin releases, mixes, and archives.",
    },
  };
}

export default async function MusicPage({ params }: { params: Promise<{ locale: string }> }) {
  const [{ locale }, t] = await Promise.all([
    params,
    getTranslations("music"),
  ]);
  const releases = await getReleases();

  return (
    <SubpageFrame
      title={t("title")}
      description={<p>LIVE. CAPTURED. ARCHIVED.</p>}
      marqueeText="// MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC //"
    >
      <div className="aer-grid aer-grid--two">
        {releases.map((release) => (
          <article key={release._id} className="aer-release aer-panel">
            {release.cover?.asset ? (
              <figure className="aer-release__cover w-full">
                <Image
                  src={urlFor(release.cover).width(1000).height(1000).quality(85).url()}
                  alt={release.title}
                  fill
                  sizes="(max-width: 1200px) 50vw, 560px"
                />
              </figure>
            ) : null}
            <div className="aer-release__embeds">
              {release.links?.soundcloud ? (
                <MediaEmbed url={release.links.soundcloud} title={release.title} />
              ) : null}
              {release.links?.bandcamp ? (
                <MediaEmbed url={release.links.bandcamp} title={release.title} />
              ) : null}
              {release.links?.spotify ? (
                <MediaEmbed url={release.links.spotify} title={release.title} />
              ) : null}
              {release.links?.youtube ? (
                <MediaEmbed url={release.links.youtube} title={release.title} />
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <MusicStructuredData releases={releases} locale={locale} />
    </SubpageFrame>
  );
}

function MusicStructuredData({ releases, locale }: { releases: Awaited<ReturnType<typeof getReleases>>; locale: string }) {
  const items = releases.map((release, index) => {
    const cover = release.cover?.asset
      ? urlFor(release.cover).width(1000).height(1000).quality(85).url()
      : undefined;
    const links = release.links ?? {};
    const sameAs = [links.soundcloud, links.bandcamp, links.spotify, links.youtube].filter(
      (link): link is string => Boolean(link),
    );
    const url = links.soundcloud || links.spotify || links.bandcamp || links.youtube || absoluteUrl(`/${locale}/music`);

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MusicAlbum",
        name: release.title,
        image: cover,
        url,
        sameAs: sameAs.length ? sameAs : undefined,
      },
    };
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AER Berlin releases",
    itemListElement: items,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
