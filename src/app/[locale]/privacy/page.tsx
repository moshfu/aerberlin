import type { PortableTextBlock } from "sanity";
import { SubpageFrame } from "@/components/layout/subpage-frame";
import { PortableTextContent } from "@/components/portable-text/portable-text";
import { getPageBySlug } from "@/server/sanity";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = buildCanonical(`/${locale}/privacy`);
  return {
    title: "Privacy",
    description: "Privacy policy and data protection information for AER Berlin.",
    alternates: { canonical },
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-snippet": 0,
        "max-image-preview": "none",
        "max-video-preview": 0,
      },
    },
  };
}

const fallbackPrivacyContent = (contactEmail: string): PortableTextBlock[] => [
  {
    _key: "privacy-updated",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-updated-span", _type: "span", marks: [], text: "Letzte Aktualisierung: 23.02.2025" }],
  },
  {
    _key: "privacy-controller-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-controller-heading-span", _type: "span", marks: [], text: "Verantwortliche Stelle" }],
  },
  {
    _key: "privacy-controller-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-controller-body-span", _type: "span", marks: [], text: "Skylar Estevens, Nicolas Funke und Moritz Funk betreiben die aer berlin GbR i.G. und verantworten die Verarbeitung personenbezogener Daten." }],
  },
  {
    _key: "privacy-controller-address",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [{ _key: "privacy-controller-address-span", _type: "span", marks: [], text: "Postanschrift: Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Deutschland" }],
  },
  {
    _key: "privacy-controller-email",
    _type: "block",
    style: "normal",
    listItem: "bullet",
    markDefs: [],
    children: [{ _key: "privacy-controller-email-span", _type: "span", marks: [], text: `Email: ${contactEmail}` }],
  },
  {
    _key: "privacy-controller-dpo",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-controller-dpo-span", _type: "span", marks: [], text: "Ein gesonderter Datenschutzbeauftragter ist nicht benannt; die genannten Verantwortlichen koordinieren sämtliche Datenschutzanfragen." }],
  },
  {
    _key: "privacy-general-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-general-heading-span", _type: "span", marks: [], text: "1. Allgemeines" }],
  },
  {
    _key: "privacy-general-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-general-body-span", _type: "span", marks: [], text: "Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der DSGVO, des BDSG und weiterer einschlägiger Normen. Änderungen dieser Erklärung nehmen wir vor, sobald technische oder rechtliche Entwicklungen dies erfordern." }],
  },
  {
    _key: "privacy-legal-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-legal-heading-span", _type: "span", marks: [], text: "2. Rechtsgrundlagen" }],
  },
  {
    _key: "privacy-legal-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-legal-body-span", _type: "span", marks: [], text: "Wir stützen die Verarbeitung auf Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), lit. b DSGVO (Vertragserfüllung), lit. c DSGVO (rechtliche Pflichten) sowie lit. f DSGVO (berechtigtes Interesse an einem sicheren Betrieb und der Darstellung unseres Angebots)." }],
  },
  {
    _key: "privacy-logs-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-logs-heading-span", _type: "span", marks: [], text: "3. Server-Logs" }],
  },
  {
    _key: "privacy-logs-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-logs-body-span", _type: "span", marks: [], text: "Beim Besuch der Website speichern wir IP-Adresse, Zeitstempel, Browser- und Systeminformationen sowie Referrer für maximal 14 Tage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Sicherheit und Stabilität)." }],
  },
  {
    _key: "privacy-consent-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-consent-heading-span", _type: "span", marks: [], text: "4. Cookies & Consent" }],
  },
  {
    _key: "privacy-consent-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-consent-body-span", _type: "span", marks: [], text: "Unser Bannerdialog speichert deine Einwilligung in einem essentiellen Cookie. Analyse-Cookies setzen wir nur nach ausdrücklicher Zustimmung und können jederzeit über den Footer widerrufen werden." }],
  },
  {
    _key: "privacy-ticketing-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-ticketing-heading-span", _type: "span", marks: [], text: "5. Ticketing & Checkout" }],
  },
  {
    _key: "privacy-ticketing-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-ticketing-body-span", _type: "span", marks: [], text: "Ticketkäufe werden über Pretix (rapidtix GmbH, Berlin) verarbeitet. Erfasst werden Name, E-Mail, Ticketkategorie, Rechnungs- und Zahlungsstatus sowie freiwillige Hinweise. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Zahlungsdaten verbleiben bei Pretix und den angebundenen Zahlungsdienstleistern." }],
  },
  {
    _key: "privacy-plugins-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-plugins-heading-span", _type: "span", marks: [], text: "6. Eingebettete Inhalte" }],
  },
  {
    _key: "privacy-instagram",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-instagram-span", _type: "span", marks: [], text: "Instagram (Instagram LLC., USA): Beim Laden eingebetteter Inhalte werden Daten an Instagram übertragen, ggf. mit Drittlandsübermittlung. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Informationen: https://help.instagram.com/155833707900388." }],
  },
  {
    _key: "privacy-soundcloud",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-soundcloud-span", _type: "span", marks: [], text: "SoundCloud (SoundCloud Limited, Berlin): Beim Abspielen eines Widgets erhält SoundCloud deine IP-Adresse und Nutzungsdaten. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). https://soundcloud.com/pages/privacy." }],
  },
  {
    _key: "privacy-spotify",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-spotify-span", _type: "span", marks: [], text: "Spotify (Spotify AB, Schweden): Eingebettete Player kommunizieren direkt mit Spotify. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). https://www.spotify.com/de/legal/privacy-policy/." }],
  },
  {
    _key: "privacy-tiktok",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-tiktok-span", _type: "span", marks: [], text: "TikTok (TikTok Technology Limited, Irland): Beim Anzeigen von Clips können Daten an TikTok übertragen werden, ggf. auch in Drittstaaten. Rechtsgrundlage: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). https://www.tiktok.com/legal/page/eea/privacy-policy/de." }],
  },
  {
    _key: "privacy-external-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-external-heading-span", _type: "span", marks: [], text: "7. Externe Links" }],
  },
  {
    _key: "privacy-external-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-external-body-span", _type: "span", marks: [], text: "Für Inhalte verlinkter Seiten sind ausschließlich die jeweiligen Betreiber verantwortlich. Bei Kenntnis rechtswidriger Inhalte entfernen wir Links unverzüglich." }],
  },
  {
    _key: "privacy-rights-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-rights-heading-span", _type: "span", marks: [], text: "8. Rechte der betroffenen Personen" }],
  },
  {
    _key: "privacy-rights-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-rights-body-span", _type: "span", marks: [], text: "Du hast die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Zudem kannst du dich bei der Berliner Beauftragten für Datenschutz und Informationsfreiheit beschweren." }],
  },
  {
    _key: "privacy-deletion-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-deletion-heading-span", _type: "span", marks: [], text: "9. Speicherdauer" }],
  },
  {
    _key: "privacy-deletion-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-deletion-body-span", _type: "span", marks: [], text: "Wir löschen personenbezogene Daten, sobald der Zweck entfällt und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Rechnungsunterlagen werden gemäß § 147 AO zehn Jahre gespeichert." }],
  },
  {
    _key: "privacy-changes-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-changes-heading-span", _type: "span", marks: [], text: "10. Änderungen" }],
  },
  {
    _key: "privacy-changes-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-changes-body-span", _type: "span", marks: [], text: "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um neue Dienstleistungen oder gesetzliche Anforderungen abzubilden." }],
  },
  {
    _key: "privacy-contact-heading",
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: "privacy-contact-heading-span", _type: "span", marks: [], text: "11. Kontakt" }],
  },
  {
    _key: "privacy-contact-body",
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: "privacy-contact-body-span", _type: "span", marks: [], text: `Fragen zum Datenschutz richtest du an ${contactEmail} oder an die im Impressum genannten Kontaktdaten.` }],
  },
];

export default async function PrivacyPage() {
  const page = await getPageBySlug("datenschutz");
  const content = page?.body && page.body.length > 0 ? page.body : fallbackPrivacyContent(siteConfig.contactEmail);
  return (
    <SubpageFrame
      title="Privacy Policy"
      marqueeText="PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//PRIVACY//"
    >
      <div className="aer-panel">
        <PortableTextContent value={content} className="aer-panel__content space-y-4 text-sm" />
      </div>
    </SubpageFrame>
  );
}
