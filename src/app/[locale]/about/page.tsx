import { getTranslations } from "next-intl/server";
import type { PortableTextBlock } from "sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 300;

const fallbackMissionContent = (): PortableTextBlock[] => [
  {
    _key: "mission-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "mission-intro-span",
        _type: "span",
        marks: [],
        text: "aer berlin exists to keep trance culture accessible, future-facing, and rooted in community care. We curate immersive nights that prioritise sound quality, experience design, and equitable representation of artists from Berlin and beyond.",
      },
    ],
  },
  {
    _key: "mission-intro-2",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "mission-intro-2-span",
        _type: "span",
        marks: [],
        text: "Every event is organised by a volunteer team. Revenue flows back into production, fair artist fees, safer-space infrastructure, and mutual aid projects within queer nightlife communities.",
      },
    ],
  },
  {
    _key: "mission-commit-heading",
    _type: "block",
    style: "h3",
    markDefs: [],
    children: [
      {
        _key: "mission-commit-heading-span",
        _type: "span",
        marks: [],
        text: "What drives us",
      },
    ],
  },
  {
    _key: "mission-commit-affordability",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "mission-commit-affordability-span",
        _type: "span",
        marks: [],
        text: "Affordable entry: tiered ticketing and solidarity passes keep the dancefloor open to everyone, not just those with buying power.",
      },
    ],
  },
  {
    _key: "mission-commit-artists",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "mission-commit-artists-span",
        _type: "span",
        marks: [],
        text: "Artist care: we champion underrepresented talent, insist on fair fees, and provide the technical conditions artists deserve.",
      },
    ],
  },
  {
    _key: "mission-commit-community",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "mission-commit-community-span",
        _type: "span",
        marks: [],
        text: "Community infrastructure: we collaborate with grassroots initiatives, share knowledge, and reinvest in projects that protect Berlin club culture.",
      },
    ],
  },
  {
    _key: "mission-commit-sustainability",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "mission-commit-sustainability-span",
        _type: "span",
        marks: [],
        text: "Sustainable futures: we reduce waste, partner with responsible vendors, and explore energy-efficient production techniques.",
      },
    ],
  },
  {
    _key: "mission-outro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "mission-outro-span",
        _type: "span",
        marks: [],
        text: "Our mission is simple: conjure transcendent moments where cost is not a barrier, where the dancefloor is a commons, and where trance remains a radical act of togetherness.",
      },
    ],
  },
];

const fallbackInclusivityContent = (contactEmail: string): PortableTextBlock[] => [
  {
    _key: "inclusivity-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-intro-span",
        _type: "span",
        marks: [],
        text: "The dancefloor is a shared space. aer berlin commits to an environment where queer, trans, Black, Indigenous, people of color, disabled ravers, and newcomers feel genuinely safe and celebrated.",
      },
    ],
  },
  {
    _key: "inclusivity-intro-2",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-intro-2-span",
        _type: "span",
        marks: [],
        text: "All crew, artists, and collaborators receive training in consent culture, active bystander intervention, and accessibility. We partner with peer-led initiatives to ensure our standards are continuously challenged and improved.",
      },
    ],
  },
  {
    _key: "inclusivity-guidelines-heading",
    _type: "block",
    style: "h3",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-guidelines-heading-span",
        _type: "span",
        marks: [],
        text: "House guidelines",
      },
    ],
  },
  {
    _key: "inclusivity-guidelines-consent",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-guidelines-consent-span",
        _type: "span",
        marks: [],
        text: "Consent is mandatory. Ask before you touch, photograph, or film. Respect a no the first time.",
      },
    ],
  },
  {
    _key: "inclusivity-guidelines-language",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-guidelines-language-span",
        _type: "span",
        marks: [],
        text: "Zero tolerance for racism, sexism, transphobia, ableism, fatphobia, xenophobia, or harassment in any form.",
      },
    ],
  },
  {
    _key: "inclusivity-guidelines-access",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-guidelines-access-span",
        _type: "span",
        marks: [],
        text: "We provide step-free or alternative access wherever possible, quiet zones, and supportive care teams. Let us know what you need and we will adapt.",
      },
    ],
  },
  {
    _key: "inclusivity-guidelines-photo",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-guidelines-photo-span",
        _type: "span",
        marks: [],
        text: "Photography is limited and consent-based. We encourage phone-free spaces to protect everyone on the floor.",
      },
    ],
  },
  {
    _key: "inclusivity-support-heading",
    _type: "block",
    style: "h3",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-support-heading-span",
        _type: "span",
        marks: [],
        text: "Support and reporting",
      },
    ],
  },
  {
    _key: "inclusivity-support-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-support-body-span",
        _type: "span",
        marks: [],
        text: "If you encounter harm, bias, or barriers, reach out to our care team in person or contact us after the event. We take each report seriously and follow up with accountability processes.",
      },
    ],
  },
  {
    _key: "inclusivity-support-contact",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-support-contact-span",
        _type: "span",
        marks: [],
        text: `Email: ${contactEmail}`,
      },
    ],
  },
  {
    _key: "inclusivity-outro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "inclusivity-outro-span",
        _type: "span",
        marks: [],
        text: "Clubbing thrives when everyone can move without fear. We invite you to help us uphold that standard, look out for one another, and celebrate responsibly.",
      },
    ],
  },
];

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
          <h2 className="aer-panel__heading">{t("mission")}</h2>
          <PortableTextContent
            value={
              mission?.body && mission.body.length > 0
                ? mission.body
                : about?.body && about.body.length > 0
                  ? about.body
                  : fallbackMissionContent()
            }
            className="aer-panel__content space-y-3"
          />
        </article>
        <article className="aer-panel">
          <h2 className="aer-panel__heading">{t("inclusivity")}</h2>
          <PortableTextContent
            value={
              inclusivity?.body && inclusivity.body.length > 0
                ? inclusivity.body
                : fallbackInclusivityContent(siteConfig.contactEmail)
            }
            className="aer-panel__content space-y-3"
          />
        </article>
      </div>
    </SubpageFrame>
  );
}
