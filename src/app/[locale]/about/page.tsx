import { getTranslations } from "next-intl/server";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

export default async function AboutPage() {
  const t = await getTranslations("about");
  const about = await getPageBySlug("about");
  const mission = await getPageBySlug("mission");
  const inclusivity = await getPageBySlug("inclusivity");

  const description = siteConfig.description;
  const socialLinks = [
    { label: "Spotify", href: siteConfig.social.spotify },
    { label: "SoundCloud", href: siteConfig.social.soundcloud },
    { label: "Instagram", href: siteConfig.social.instagram },
    { label: "TikTok", href: siteConfig.social.tiktok },
  ];

  return (
    <SubpageFrame
      title={t("title")}
      eyebrow="Manifesto"
      marqueeText="ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//ABOUT//"
      description={<p>{description}</p>}
    >
      <div className="aer-social-links" aria-label="aer berlin social channels">
        {socialLinks
          .filter((link) => Boolean(link.href))
          .map((link) => (
            <a key={link.label} href={link.href ?? "#"} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
      </div>
      <div className="aer-grid aer-grid--two">
        <article className="aer-panel">
          <div className="aer-panel__meta">{t("mission")}</div>
          <h2 className="aer-panel__heading">{t("mission")}</h2>
          <PortableTextContent
            value={mission?.body ?? about?.body ?? []}
            className="aer-panel__content space-y-4"
          />
        </article>
        <article className="aer-panel">
          <div className="aer-panel__meta">{t("inclusivity")}</div>
          <h2 className="aer-panel__heading">{t("inclusivity")}</h2>
          <PortableTextContent
            value={inclusivity?.body ?? []}
            className="aer-panel__content space-y-4"
          />
        </article>
      </div>
    </SubpageFrame>
  );
}
