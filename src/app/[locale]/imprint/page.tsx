import { getTranslations } from "next-intl/server";
import type { PortableTextBlock } from "sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

const fallbackImprintContent = (contactEmail: string): PortableTextBlock[] => [
  {
    _key: "imprint-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-intro-span",
        _type: "span",
        marks: [],
        text: "aer berlin is a volunteer-run trance collective based in Berlin. We curate accessible, high-intensity nights and reinvest every euro into artists, crews, and community infrastructure.",
      },
    ],
  },
  {
    _key: "imprint-intro-2",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-intro-2-span",
        _type: "span",
        marks: [],
        text: "Our collective operates on a non-profit basis to keep clubbing affordable while upholding professional standards for safety, inclusion, and labor conditions.",
      },
    ],
  },
  {
    _key: "imprint-responsible-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-responsible-heading-span",
        _type: "span",
        marks: [],
        text: "Responsible entity",
      },
    ],
  },
  {
    _key: "imprint-responsible-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-responsible-body-name",
        _type: "span",
        marks: ["strong"],
        text: "aer berlin GbR i.G.",
      },
      {
        _key: "imprint-responsible-body-rest",
        _type: "span",
        marks: [],
        text: " — volunteer cultural initiative focused on trance and experimental club culture.",
      },
    ],
  },
  {
    _key: "imprint-address",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "imprint-address-span",
        _type: "span",
        marks: [],
        text: "Postal address: Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Germany",
      },
    ],
  },
  {
    _key: "imprint-contact",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "imprint-contact-span",
        _type: "span",
        marks: [],
        text: `Email: ${contactEmail}`,
      },
    ],
  },
  {
    _key: "imprint-board",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "imprint-board-span",
        _type: "span",
        marks: [],
        text: "Represented by the volunteer organizing board of aer berlin.",
      },
    ],
  },
  {
    _key: "imprint-nonprofit",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-nonprofit-span",
        _type: "span",
        marks: [],
        text: "The collective is in the process of formalizing non-profit registration. Surplus revenue is allocated exclusively to production costs, fair artist fees, and community projects.",
      },
    ],
  },
  {
    _key: "imprint-editorial-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-editorial-heading-span",
        _type: "span",
        marks: [],
        text: "Editorial responsibility",
      },
    ],
  },
  {
    _key: "imprint-editorial-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-editorial-body-span",
        _type: "span",
        marks: [],
        text: "Responsible for editorial content in accordance with Section 18 (2) MStV: the aer berlin organizing board. Please use the contact email above for press and regulatory inquiries.",
      },
    ],
  },
  {
    _key: "imprint-dispute-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-dispute-heading-span",
        _type: "span",
        marks: [],
        text: "Dispute resolution",
      },
    ],
  },
  {
    _key: "imprint-dispute-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-dispute-body-span",
        _type: "span",
        marks: [],
        text: "The European Commission provides a platform for online dispute resolution (ODR) at https://ec.europa.eu/consumers/odr. We are not obligated or willing to participate in consumer dispute resolution proceedings before a dispute resolution body.",
      },
    ],
  },
  {
    _key: "imprint-liability-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-liability-heading-span",
        _type: "span",
        marks: [],
        text: "Liability for content",
      },
    ],
  },
  {
    _key: "imprint-liability-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-liability-body-span",
        _type: "span",
        marks: [],
        text: "As a service provider we are responsible for our own content on these pages under general law (Section 7 (1) TMG). Obligations to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity remain unaffected. Liability in this respect is only possible from the time of knowledge of a concrete infringement. Upon becoming aware of any such violations, we will remove the content immediately.",
      },
    ],
  },
  {
    _key: "imprint-links-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-links-heading-span",
        _type: "span",
        marks: [],
        text: "Liability for links",
      },
    ],
  },
  {
    _key: "imprint-links-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-links-body-span",
        _type: "span",
        marks: [],
        text: "Our site contains links to external websites. We have no influence over the content of these third-party sites and therefore cannot assume liability for them. Responsibility for linked pages lies solely with the respective provider. We review linked content for legal infringements at the time of linking and remove links promptly if we become aware of any violations.",
      },
    ],
  },
  {
    _key: "imprint-copyright-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "imprint-copyright-heading-span",
        _type: "span",
        marks: [],
        text: "Copyright",
      },
    ],
  },
  {
    _key: "imprint-copyright-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "imprint-copyright-body-span",
        _type: "span",
        marks: [],
        text: "The content and works created by the site operators are subject to German copyright law. Reproduction, editing, distribution, and any use outside the limits of copyright law require written consent from aer berlin. Downloads and copies are permitted only for private, non-commercial use. Third-party content is marked as such. Should you become aware of a copyright infringement, please notify us so we can remove the content immediately.",
      },
    ],
  },
];

export default async function ImprintPage() {
  const navT = await getTranslations("navigation");
  const page = await getPageBySlug("impressum");
  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));
  const content = page?.body && page.body.length > 0 ? page.body : fallbackImprintContent(siteConfig.contactEmail);
  return (
    <SubpageFrame
      title="Imprint"
      marqueeText="IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//IMPRINT//"
      navigation={navigation}
    >
      <div className="aer-panel">
        <PortableTextContent value={content} className="aer-panel__content space-y-4 text-sm" />
      </div>
    </SubpageFrame>
  );
}
