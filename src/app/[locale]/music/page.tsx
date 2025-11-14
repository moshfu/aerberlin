import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getReleases } from "@/server/sanity";
import { urlFor } from "@/lib/sanity.server";
import { MediaEmbed } from "@/components/media/media-embed";
import { SubpageFrame } from "@/components/layout/subpage-frame";

export default async function MusicPage() {
  const [t] = await Promise.all([
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
    </SubpageFrame>
  );
}
