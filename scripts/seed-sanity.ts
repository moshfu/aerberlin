import { createClient } from "@sanity/client";
import { config as loadEnv } from "dotenv";
import { nanoid } from "nanoid";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

async function seed() {
  const { env } = await import("../src/lib/env");

  if (!env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN required to seed data");
  }

  const client = createClient({
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    token: env.SANITY_WRITE_TOKEN,
    apiVersion: env.SANITY_API_VERSION,
    useCdn: false,
  });

  const ptBlock = (text: string, style: "normal" | "h2" | "h3" | "h4" = "normal", listItem?: "bullet") => ({
    _key: nanoid(),
    _type: "block",
    style,
    ...(listItem ? { listItem } : {}),
    markDefs: [],
    children: [
      {
        _key: nanoid(),
        _type: "span",
        marks: [],
        text,
      },
    ],
  });

  const contactEmail = "support@aerberlin.de";

  const artists = [
    {
      _id: "artist-funk4",
      _type: "artist",
      name: "FUNK4",
      slug: { current: "funk4" },
      role: "Resident",
      tags: ["Trance", "Techno"],
      socials: {
        instagram: "https://www.instagram.com/funk4official/",
        soundcloud: "https://soundcloud.com/funk4official",
      },
      bio: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Berlin-based selector FUNK4 channels the collective's high-energy signature into hypnotic trance and hard-edged techno. With a SoundCloud mantra of \"//: dj funk4 — trance • techno • melodic,\" her sets pivot between crystalline euphoria and thunderous baselines built for peak-hour lockstep.",
            },
          ],
        },
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Expect acid streaks, shimmering pads, and rave nostalgia reframed for the present—crafted meticulously for dancers who refuse to leave the floor.",
            },
          ],
        },
      ],
    },
    {
      _id: "artist-funic",
      _type: "artist",
      name: "FUNIC",
      slug: { current: "funic" },
      role: "Resident",
      tags: ["Progressive", "Trance"],
      socials: {
        instagram: "https://www.instagram.com/funicmusic/",
        soundcloud: "https://soundcloud.com/funicmusic",
      },
      bio: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "FUNIC sculpts luminous progressive trance and widescreen techno narratives direct from Berlin. Their SoundCloud cuts drift from glistening pads into muscular low-end, mirroring the collective's mission to keep ecstatic club music accessible and future-facing.",
            },
          ],
        },
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "On the floor, FUNIC leans into long-form builds, heady breakbeats, and late-night catharsis—an evolving story written for the trance faithful of aer berlin.",
            },
          ],
        },
      ],
    },
    {
      _id: "artist-5kyy",
      _type: "artist",
      name: "5KYY",
      slug: { current: "5kyy" },
      role: "Resident",
      tags: ["Techno", "Rave"],
      socials: {
        instagram: "https://www.instagram.com/5kyy1arr/",
        soundcloud: "https://soundcloud.com/skylar-ashton",
      },
      bio: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "5KYY (Skylar Ashton) is a Berlin resident DJ with a SoundCloud trail of high-voltage rave weapons and genre-fluid edits. Their feed of bootlegs and originals—29 releases deep and counting—melds ferocious kicks with emotional synth work.",
            },
          ],
        },
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "From sweat-drenched basements to open-air sunrises, 5KYY drives the dancefloor with fast-paced blends, pitched-up vocals, and no-prisoners transitions built to keep hearts racing.",
            },
          ],
        },
      ],
    },
  ];

  const events = [
    {
      _id: "event-aer-001",
      _type: "event",
      title: "AER 001",
      slug: { current: "aer-001" },
      start: new Date("2025-07-28T13:00:00.000Z").toISOString(),
      end: new Date("2025-07-28T20:00:00.000Z").toISOString(),
      venue: "Park am Gleisdreieck",
      marqueeText: "AER 001 // PARK AM GLEISDREIECK // OPEN AIR",
      ticketingSource: "pretix",
      pretixEventId: "aer-001",
      description: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Open-air daytime session under the U-Bahn with FUNK4 and FUNIC steering the trance continuum.",
            },
          ],
        },
      ],
      lineup: [
        { _type: "reference", _ref: artists[0]._id },
        { _type: "reference", _ref: artists[1]._id },
      ],
      published: true,
      tags: ["Trance", "Open-air"],
    },
    {
      _id: "event-aer-002",
      _type: "event",
      title: "AER 002",
      slug: { current: "aer-002" },
      start: new Date("2025-12-12T20:00:00.000Z").toISOString(),
      end: new Date("2025-12-13T02:00:00.000Z").toISOString(),
      venue: "Secret Location (TBD)",
      marqueeText: "AER 002 // SECRET LOCATION // WINTER NIGHT",
      ticketingSource: "pretix",
      pretixEventId: "aer-002",
      description: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Winter warehouse drop with the full resident roster. Coordinates announced to ticket holders 24 hours out.",
            },
          ],
        },
      ],
      lineup: [
        { _type: "reference", _ref: artists[0]._id },
        { _type: "reference", _ref: artists[1]._id },
        { _type: "reference", _ref: artists[2]._id },
      ],
      published: true,
      tags: ["Trance"],
    },
  ];

  const releases = [
    {
      _id: "release-emerald",
      _type: "release",
      title: "Emerald Vector",
      slug: { current: "emerald-vector" },
      date: new Date().toISOString().split("T")[0],
      links: {
        soundcloud: "https://soundcloud.com/aerberlin/emerald-vector",
        bandcamp: "https://aerberlin.bandcamp.com/emerald-vector",
      },
    },
    {
      _id: "release-refraction",
      _type: "release",
      title: "Refraction",
      slug: { current: "refraction" },
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString().split("T")[0],
      links: {
        spotify: "https://open.spotify.com/album/refraction",
      },
    },
  ];

  const missionBody = [
    ptBlock(
      "aer berlin exists to keep trance culture accessible, future-facing, and rooted in collective care. We build nights around precision sound, immersive lighting, and thoughtfully curated artists from Berlin and beyond."
    ),
    ptBlock(
      "Our programming is guided by the energy of the dancefloor. Every gathering should feel like a transmission—sonic storytelling that invites both ecstatic release and mindful participation."
    ),
    ptBlock("What drives us", "h3"),
    ptBlock("Accessible entry with tiered ticketing and solidarity passes so cost never blocks community members.", "normal", "bullet"),
    ptBlock("Artist care through fair fees, advance planning, and rider support that respects the labor of DJs, VJs, and crews.", "normal", "bullet"),
    ptBlock("Community infrastructure via partnerships with mutual-aid initiatives and knowledge sharing across collectives.", "normal", "bullet"),
    ptBlock("Sustainable futures focused on low-waste production, responsible vendors, and energy-conscious staging.", "normal", "bullet"),
    ptBlock("How we operate", "h3"),
    ptBlock(
      "Every event is assembled by a volunteer core team—stage managers, designers, care workers, and engineers dedicated to safer, inclusive nightlife."
    ),
    ptBlock(
      "We publish transparent budgets when possible, reinvest surpluses into gear maintenance and community causes, and invite collaborators to co-create with us."
    ),
    ptBlock("Getting involved", "h3"),
    ptBlock(
      "If you align with our mission—whether as an artist, care team member, visual collaborator, or production specialist—reach out. We are always building new constellations."
    ),
  ];

  const inclusivityBody = [
    ptBlock(
      "The dancefloor is a shared commons. aer berlin commits to an environment where queer, trans, Black, Indigenous, people of color, disabled ravers, and newcomers feel genuinely safe, celebrated, and resourced."
    ),
    ptBlock(
      "All crew, artists, and collaborators receive training in consent culture, active bystander intervention, and accessibility. We partner with peer-led initiatives to keep our standards accountable."
    ),
    ptBlock("House guidelines", "h3"),
    ptBlock("Consent is mandatory—ask before touching, filming, or photographing. Respect a no the first time.", "normal", "bullet"),
    ptBlock("Zero tolerance for racism, sexism, transphobia, ableism, fatphobia, xenophobia, or harassment in any form.", "normal", "bullet"),
    ptBlock("If you see something concerning, find a member of the care team immediately. We act swiftly to de-escalate and support those affected.", "normal", "bullet"),
    ptBlock("Accessibility needs? Let us know in advance so we can coordinate support, quiet space, or companion tickets where possible.", "normal", "bullet"),
    ptBlock("Support & contact", "h3"),
    ptBlock(`Reach out to ${contactEmail} before or after events if you experienced harm or have feedback on our safety processes.`),
    ptBlock(
      "Clubbing thrives when everyone can move without fear. Help us uphold that standard, look out for one another, and celebrate responsibly."
    ),
  ];

  const imprintBody = [
    ptBlock(
      "aer berlin is a volunteer-run trance collective based in Berlin. We curate accessible, high-intensity nights and reinvest every euro into artists, crews, and community infrastructure."
    ),
    ptBlock(
      "Our collective operates on a non-profit basis to keep clubbing affordable while upholding professional standards for safety, inclusion, and labor conditions."
    ),
    ptBlock("Responsible entity", "h2"),
    {
      ...ptBlock("aer berlin GbR i.G.", "normal"),
      children: [
        {
          _key: nanoid(),
          _type: "span",
          marks: ["strong"],
          text: "aer berlin GbR i.G.",
        },
        {
          _key: nanoid(),
          _type: "span",
          marks: [],
          text: " — volunteer cultural initiative focused on trance and experimental club culture.",
        },
      ],
    },
    ptBlock("Postal address: Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Germany", "normal", "bullet"),
    ptBlock(`Email: ${contactEmail}`, "normal", "bullet"),
    ptBlock("Represented by the volunteer organising board of aer berlin.", "normal", "bullet"),
    ptBlock(
      "The collective is in the process of formalising non-profit registration. Surplus revenue is allocated exclusively to production costs, fair artist fees, and community projects."
    ),
    ptBlock("Editorial responsibility", "h2"),
    ptBlock(
      "Responsible for editorial content in accordance with Section 18 (2) MStV: the aer berlin organising board. Please use the contact email above for press and regulatory enquiries."
    ),
    ptBlock("Dispute resolution", "h2"),
    ptBlock(
      "The European Commission provides a platform for online dispute resolution (ODR) at https://ec.europa.eu/consumers/odr. We are not obligated or willing to participate in consumer dispute resolution proceedings before a dispute resolution body."
    ),
    ptBlock("Liability for content", "h2"),
    ptBlock(
      "As a service provider we are responsible for our own content on these pages under general law (Section 7 (1) TMG). Obligations to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity remain unaffected. Liability in this respect is only possible from the time of knowledge of a concrete infringement. Upon becoming aware of any such violations, we will remove the content immediately."
    ),
    ptBlock("Liability for links", "h2"),
    ptBlock(
      "Our site contains links to external websites. We have no influence over the content of these third-party sites and therefore cannot assume liability for them. Responsibility for linked pages lies solely with the respective provider. We review linked content for legal infringements at the time of linking and remove links promptly if we become aware of any violations."
    ),
  ];

  const privacyBody = [
    ptBlock("Last updated: 23 February 2025"),
    ptBlock("Controller", "h2"),
    ptBlock(
      "Skylar Estevens, Nicolas Funke, and Moritz Funk operate the aer berlin GbR i.G. and are jointly responsible for processing personal data in connection with this website and our events."
    ),
    ptBlock("Postal address: Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Germany", "normal", "bullet"),
    ptBlock(`Email: ${contactEmail}`, "normal", "bullet"),
    ptBlock(
      "A dedicated data protection officer has not been appointed. The named controllers coordinate all privacy-related enquiries and will respond without undue delay."
    ),
    ptBlock("1. General information", "h2"),
    ptBlock(
      "We process personal data exclusively within the framework of the GDPR, the German Federal Data Protection Act (BDSG), and other applicable regulations. We update this privacy notice whenever technical or legal developments require it."
    ),
    ptBlock("2. Legal bases", "h2"),
    ptBlock(
      "Processing is based on Article 6 (1) lit. a GDPR (consent), lit. b GDPR (performance of a contract), lit. c GDPR (legal obligations), and lit. f GDPR (legitimate interests in secure operations and the presentation of our activities)."
    ),
    ptBlock("3. Server logs", "h2"),
    ptBlock(
      "When you visit our website we store IP address, timestamp, browser and operating system information, and referrer URLs for up to 14 days. This serves system security and troubleshooting. The legal basis is Article 6 (1) lit. f GDPR."
    ),
    ptBlock("4. Cookies and consent management", "h2"),
    ptBlock(
      "Our consent banner stores your decision in an essential cookie. Analytics cookies or marketing pixels are only set after you grant explicit consent and can be revoked at any time via the footer settings."
    ),
    ptBlock("5. Ticketing and checkout", "h2"),
    ptBlock(
      "Tickets are processed through Pretix (rapidtix GmbH, Berlin). We receive name, email address, ticket category, invoice data, and optional notes. The legal basis is Article 6 (1) lit. b GDPR. Payment information remains with Pretix and the connected payment providers."
    ),
    ptBlock("6. Embedded media and social plugins", "h2"),
    ptBlock(
      "Instagram (Instagram LLC, USA): Loading embedded posts transfers data to Instagram, potentially to servers in third countries. Legal basis: consent pursuant to Article 6 (1) lit. a GDPR. Privacy information: https://help.instagram.com/155833707900388."
    ),
    ptBlock(
      "SoundCloud (SoundCloud Limited, Berlin): When you play a widget, SoundCloud receives your IP address and usage data. Legal basis: consent pursuant to Article 6 (1) lit. a GDPR. Privacy information: https://soundcloud.com/pages/privacy."
    ),
    ptBlock(
      "Spotify (Spotify AB, Sweden): Embedded players communicate directly with Spotify and can set cookies. Legal basis: consent pursuant to Article 6 (1) lit. a GDPR. Privacy information: https://www.spotify.com/en/legal/privacy-policy/."
    ),
    ptBlock(
      "TikTok (TikTok Technology Limited, Ireland): Displaying clips may transfer data to TikTok, including to third countries. Legal basis: consent pursuant to Article 6 (1) lit. a GDPR. Privacy information: https://www.tiktok.com/legal/page/eea/privacy-policy/en."
    ),
    ptBlock("7. External links", "h2"),
    ptBlock(
      "We are not responsible for external websites linked from our pages. The respective providers are solely liable for their content. We review links for legal issues at the time of linking and remove them promptly if violations become known."
    ),
    ptBlock("8. Rights of data subjects", "h2"),
    ptBlock(
      "You have the right to access, rectification, erasure, restriction of processing, data portability, and the right to object to processing. You may lodge a complaint with the Berlin Commissioner for Data Protection and Freedom of Information."
    ),
    ptBlock("9. Storage duration", "h2"),
    ptBlock(
      "We retain personal data only for as long as the respective purpose requires and statutory retention obligations permit. Accounting records must be stored for ten years in accordance with Section 147 of the German Fiscal Code."
    ),
  ];

  const termsBody = [
    ptBlock(
      "These terms and conditions govern participation in events, ticket sales, and community offerings curated by aer berlin. By purchasing a ticket or entering one of our events you accept the following provisions."
    ),
    ptBlock("1. Scope and contact", "h2"),
    ptBlock(
      "aer berlin GbR i.G., Lise-Meitner-Straße 39-41, Work Box 20, 10589 Berlin, Germany, organises cultural events and community formats. All correspondence relating to these terms can be sent to the contact email stated below."
    ),
    ptBlock(`Email: ${contactEmail}`, "normal", "bullet"),
    ptBlock("2. Ticketing and pricing", "h2"),
    ptBlock(
      "Tickets are sold exclusively via Pretix. Prices are calculated to cover production costs, fair fees for artists and crews, and solidarity funds. We do not aim to generate profit."
    ),
    ptBlock("A purchase contract is concluded once Pretix confirms payment.", "normal", "bullet"),
    ptBlock(
      "Solidarity and reduced tickets are offered when capacity allows. Please choose standard pricing if you have the means so we can keep concessions accessible.",
      "normal",
      "bullet"
    ),
    ptBlock("Commercial resale, scalping, or transferring tickets at inflated prices is prohibited. Contact us for name changes if you can no longer attend.", "normal", "bullet"),
    ptBlock("3. Admission and participation", "h2"),
    ptBlock(
      "Entrance is only granted to persons aged 18 or over. Valid photo ID and a valid ticket or guest list confirmation must be presented at the door."
    ),
    ptBlock("Venue security and our care team may refuse admission to ensure community safety. Tickets will be refunded if refusal occurs for reasons unrelated to house rules.", "normal", "bullet"),
    ptBlock("Attendees agree to follow the inclusivity statement and respect the safer space guidelines communicated on site.", "normal", "bullet"),
    ptBlock("4. House guidelines", "h2"),
    ptBlock(
      "We uphold a zero-tolerance policy for discrimination, harassment, violence, or non-consensual behaviour. Individuals violating these principles may be removed without refund."
    ),
    ptBlock("Photography or filming without consent is prohibited. Respect artists' and dancers' privacy.", "normal", "bullet"),
    ptBlock("If you witness harmful behaviour, alert staff or the care team immediately so we can intervene.", "normal", "bullet"),
    ptBlock("5. Health and safety", "h2"),
    ptBlock(
      "We provide free water access where possible, maintain safe sound levels, and collaborate with venues to uphold fire safety regulations. Please follow crew instructions during emergencies."
    ),
    ptBlock(
      "Open flames, weapons, and substances classified as illegal under German law are not permitted on site. Violations may be reported to authorities.",
      "normal",
      "bullet"
    ),
    ptBlock("6. Ticket refunds and cancellations", "h2"),
    ptBlock(
      "Refund requests are handled through Pretix according to their refund policy. We may offer partial or full refunds in cases of event cancellation or significant programme changes."
    ),
    ptBlock(
      "If an event must be rescheduled, purchased tickets remain valid for the new date. If you cannot attend the new date, contact us within 14 days for a refund option.",
      "normal",
      "bullet"
    ),
    ptBlock("7. Liability", "h2"),
    ptBlock(
      "We are liable only for intent and gross negligence. Liability for slight negligence is limited to essential contractual obligations and capped at the foreseeable damage typical for the contract."
    ),
    ptBlock("Attending our events is at your own risk. We are not liable for lost or stolen items unless caused by our intent or gross negligence.", "normal", "bullet"),
    ptBlock("8. Final provisions", "h2"),
    ptBlock(
      "German law applies. Should individual clauses of these terms be invalid, the remaining provisions remain in effect. We may update these terms as legal or operational requirements evolve."
    ),
  ];

  const pages = [
    {
      _id: "page-about",
      _type: "page",
      title: "About",
      slug: { current: "about" },
      body: [
        ptBlock("aer berlin curates trance-forward programming across Berlin and beyond, focusing on precise sound, immersive staging, and intentional community spaces."),
        ptBlock(
          "We are volunteer-run, reinvesting revenue into equipment, artist fees, accessibility measures, and mutual-aid projects that sustain nightlife culture."
        ),
      ],
    },
    {
      _id: "page-mission",
      _type: "page",
      title: "Mission",
      slug: { current: "mission" },
      body: missionBody,
    },
    {
      _id: "page-inclusivity",
      _type: "page",
      title: "Inclusivity",
      slug: { current: "inclusivity" },
      body: inclusivityBody,
    },
    {
      _id: "page-impressum",
      _type: "page",
      title: "Impressum",
      slug: { current: "impressum" },
      body: imprintBody,
    },
    {
      _id: "page-privacy",
      _type: "page",
      title: "Privacy Policy",
      slug: { current: "datenschutz" },
      body: privacyBody,
    },
    {
      _id: "page-terms",
      _type: "page",
      title: "Terms & Conditions",
      slug: { current: "agb" },
      body: termsBody,
    },
  ];

  type SeedDoc = { _id: string; _type: string } & Record<string, unknown>;
  const docs: SeedDoc[] = [...artists, ...events, ...releases, ...pages];

  await Promise.all(
    docs.map((doc) =>
      client
        .createOrReplace(doc)
        .then(() => console.log(`Seeded ${doc._id}`))
        .catch((error) => console.error(`Failed to seed ${doc._id}`, error)),
    ),
  );

  console.log("Sanity dataset seeded.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
