import { getTranslations } from "next-intl/server";
import type { PortableTextBlock } from "sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";

export const revalidate = 600;

const fallbackTermsContent = (contactEmail: string): PortableTextBlock[] => [
  {
    _key: "terms-intro",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-intro-span",
        _type: "span",
        marks: [],
        text: "These terms and conditions govern participation in events, ticket sales, and community offerings curated by aer berlin. By purchasing a ticket or entering one of our events you accept the following provisions.",
      },
    ],
  },
  {
    _key: "terms-scope-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-scope-heading-span",
        _type: "span",
        marks: [],
        text: "1. Scope and contact",
      },
    ],
  },
  {
    _key: "terms-scope-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-scope-body-span",
        _type: "span",
        marks: [],
        text: "aer berlin GbR i.G., Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Germany, organizes cultural events and community formats. All correspondence relating to these terms can be sent to the contact email stated below.",
      },
    ],
  },
  {
    _key: "terms-scope-contact",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-scope-contact-span",
        _type: "span",
        marks: [],
        text: `Email: ${contactEmail}`,
      },
    ],
  },
  {
    _key: "terms-tickets-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-tickets-heading-span",
        _type: "span",
        marks: [],
        text: "2. Ticketing and pricing",
      },
    ],
  },
  {
    _key: "terms-tickets-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-tickets-body-span",
        _type: "span",
        marks: [],
        text: "Tickets are sold exclusively via Pretix. Prices are calculated to cover production costs, fair fees for artists and crews, and solidarity funds. We do not aim to generate profit.",
      },
    ],
  },
  {
    _key: "terms-tickets-conditions",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-tickets-conditions-span",
        _type: "span",
        marks: [],
        text: "A purchase contract is concluded once Pretix confirms payment.",
      },
    ],
  },
  {
    _key: "terms-tickets-subsidy",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-tickets-subsidy-span",
        _type: "span",
        marks: [],
        text: "Solidarity and reduced tickets are offered when capacity allows. Please choose standard pricing if you have the means so we can keep concessions accessible.",
      },
    ],
  },
  {
    _key: "terms-tickets-resale",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-tickets-resale-span",
        _type: "span",
        marks: [],
        text: "Commercial resale, scalping, or transferring tickets at inflated prices is prohibited. Contact us for name changes if you can no longer attend.",
      },
    ],
  },
  {
    _key: "terms-entry-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-entry-heading-span",
        _type: "span",
        marks: [],
        text: "3. Admission and participation",
      },
    ],
  },
  {
    _key: "terms-entry-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-entry-body-span",
        _type: "span",
        marks: [],
        text: "Entrance is only granted to persons aged 18 or over. Valid photo ID and a valid ticket or guest list confirmation must be presented at the door.",
      },
    ],
  },
  {
    _key: "terms-entry-policy",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-entry-policy-span",
        _type: "span",
        marks: [],
        text: "Venue security and our care team may refuse admission to ensure community safety. Tickets will be refunded if refusal occurs for reasons unrelated to house rules.",
      },
    ],
  },
  {
    _key: "terms-entry-conduct",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-entry-conduct-span",
        _type: "span",
        marks: [],
        text: "Attendees agree to follow the inclusivity statement and respect the safer space guidelines communicated on site.",
      },
    ],
  },
  {
    _key: "terms-safety-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-safety-heading-span",
        _type: "span",
        marks: [],
        text: "4. Health, safety, and wellbeing",
      },
    ],
  },
  {
    _key: "terms-safety-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-safety-body-span",
        _type: "span",
        marks: [],
        text: "We prioritize safer spaces, consent, and accessibility. Please inform our care team if you need support or witness concerning behavior. We reserve the right to remove persons who endanger others or violate house rules.",
      },
    ],
  },
  {
    _key: "terms-refunds-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-refunds-heading-span",
        _type: "span",
        marks: [],
        text: "5. Cancellations, changes, and refunds",
      },
    ],
  },
  {
    _key: "terms-refunds-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-refunds-body-span",
        _type: "span",
        marks: [],
        text: "If an event has to be cancelled or rescheduled, ticket holders can request a refund or transfer to the new date. Refunds are processed through Pretix using the original payment method.",
      },
    ],
  },
  {
    _key: "terms-refunds-conditions",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-refunds-conditions-span",
        _type: "span",
        marks: [],
        text: "Individual refunds are generally not possible less than 24 hours before the event unless you provide an accessibility or health-related reason. We aim to reallocate cancelled tickets to the waiting list.",
      },
    ],
  },
  {
    _key: "terms-liability-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-liability-heading-span",
        _type: "span",
        marks: [],
        text: "6. Liability",
      },
    ],
  },
  {
    _key: "terms-liability-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-liability-body-span",
        _type: "span",
        marks: [],
        text: "To the maximum extent permitted under German and EU law, aer berlin excludes liability for damage caused by simple negligence. Mandatory statutory liability (including under the German Product Liability Act) remains unaffected. We accept liability without limitation only for intent and gross negligence, as well as for injury to life, body, or health and for breaches of essential contractual obligations (cardinal duties). In the latter cases, liability is limited to the foreseeable, typically occurring damage.",
      },
    ],
  },
  {
    _key: "terms-liability-items",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [
      {
        _key: "terms-liability-items-span",
        _type: "span",
        marks: [],
        text: "We are not responsible for items lost in cloakrooms managed by third-party venues unless required by mandatory law.",
      },
    ],
  },
  {
    _key: "terms-media-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-media-heading-span",
        _type: "span",
        marks: [],
        text: "7. Photography and recordings",
      },
    ],
  },
  {
    _key: "terms-media-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-media-body-span",
        _type: "span",
        marks: [],
        text: "Professional photography or video is only permitted with our prior consent. We may document events to amplify artists and highlight community work, always with respect for privacy. Inform us if you object to being photographed and we will assist.",
      },
    ],
  },
  {
    _key: "terms-privacy-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-privacy-heading-span",
        _type: "span",
        marks: [],
        text: "8. Data protection",
      },
    ],
  },
  {
    _key: "terms-privacy-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-privacy-body-span",
        _type: "span",
        marks: [],
        text: "Information on the collection and processing of personal data is available in our Privacy Policy. By purchasing a ticket you acknowledge those provisions.",
      },
    ],
  },
  {
    _key: "terms-final-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [
      {
        _key: "terms-final-heading-span",
        _type: "span",
        marks: [],
        text: "9. Final provisions",
      },
    ],
  },
  {
    _key: "terms-final-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: "terms-final-body-span",
        _type: "span",
        marks: [],
        text: "German law applies. Should individual provisions of these terms be or become invalid, the validity of the remaining provisions shall remain unaffected. We may update these terms to reflect operational or legal changes; the version displayed at the time of your ticket purchase applies.",
      },
    ],
  },
];

export default async function TermsPage() {
  const navT = await getTranslations("navigation");
  const page = await getPageBySlug("agb");
  const navigation = siteConfig.navigation.map((item) => ({
    href: item.href,
    label: navT(item.key),
  }));
  const content = page?.body && page.body.length > 0 ? page.body : fallbackTermsContent(siteConfig.contactEmail);
  return (
    <SubpageFrame
      title="Terms & Conditions"
      marqueeText="TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//TERMS//"
      navigation={navigation}
    >
      <div className="aer-panel">
        <PortableTextContent value={content} className="aer-panel__content space-y-4 text-sm" />
      </div>
    </SubpageFrame>
  );
}
