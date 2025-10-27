import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getReleases } from "@/server/sanity";
import { urlFor } from "@/lib/sanity.server";
import { MediaEmbed } from "@/components/media/media-embed";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { siteConfig } from "@/config/site";

export default async function MusicPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [t, navT] = await Promise.all([
    getTranslations("music"),
    getTranslations("navigation"),
  ]);
  const releases = await getReleases();
  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));

  return (
    <SubpageFrame
      title={t("title")}
      eyebrow="Catalog"
      description={<p>Hypersonic trance transmissions, archived drops, live edits.</p>}
      marqueeText="// MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC // MUSIC //"
      footnote={`${releases.length} releases indexed from Sanity.`}
      navigation={navigation}
    >
      <div className="aer-grid">
        {releases.map((release) => (
          <article key={release._id} className="aer-release aer-panel">
            <div className="aer-release__header">
              {release.cover?.asset ? (
                <figure className="aer-release__cover">
                  <Image
                    src={urlFor(release.cover).width(800).height(800).quality(85).url()}
                    alt={release.title}
                    fill
                    sizes="(max-width: 768px) 40vw, 240px"
                  />
                </figure>
              ) : null}
              <div className="aer-release__meta">
                <span className="aer-panel__meta">
                  {new Intl.DateTimeFormat(locale, {
                    month: "long",
                    year: "numeric",
                  }).format(new Date(release.date))}
                </span>
                <h2 className="aer-panel__heading">{release.title}</h2>
              </div>
            </div>
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
    </SubpageFrame>
  );
}
