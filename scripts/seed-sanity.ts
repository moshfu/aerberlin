import { createClient } from "@sanity/client";
import { nanoid } from "nanoid";
import { env } from "../src/lib/env";

const client = createClient({
  projectId: env.SANITY_PROJECT_ID,
  dataset: env.SANITY_DATASET,
  token: env.SANITY_WRITE_TOKEN,
  apiVersion: env.SANITY_API_VERSION,
  useCdn: false,
});

async function seed() {
  if (!env.SANITY_WRITE_TOKEN) {
    throw new Error("SANITY_WRITE_TOKEN required to seed data");
  }

  const artists = [
    {
      _id: "artist-dj-funk4",
      _type: "artist",
      name: "funk4",
      slug: { current: "dj-funk4" },
      role: "Resident",
      tags: ["Resident", "Trance"],
      socials: {
        instagram: "https://instagram.com/funk4official",
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
              text: "Resident DJ blending euphoria and breakbeats across sunrise sets.",
            },
          ],
        },
      ],
    },
    {
      _id: "artist-lumen",
      _type: "artist",
      name: "Lumen",
      slug: { current: "lumen" },
      role: "Guest",
      tags: ["Guest", "Psy"],
      socials: {
        soundcloud: "https://soundcloud.com/lumen",
        instagram: "https://instagram.com/lumen",
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
              text: "Vienna-based producer serving crystalline psy trance for the afters.",
            },
          ],
        },
      ],
    },
  ];

  const events = [
    {
      _id: "event-wired-october",
      _type: "event",
      title: "WIRED 002: Neon Convergence",
      slug: { current: "wired-002" },
      start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14 + 1000 * 60 * 60 * 8).toISOString(),
      venue: "Rummels Bucht",
      address: "Eichenstraße 4, Berlin",
      ticketingSource: "pretix",
      pretixEventId: "wired-002",
      description: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Our subterranean mainstay returns with holographic lasers, strobes and a line-up curated for stamina dancers.",
            },
          ],
        },
      ],
      lineup: artists.map((artist) => ({ _type: "reference", _ref: artist._id })),
      published: true,
      tags: ["Rave", "Trance"],
    },
    {
      _id: "event-secret-solstice",
      _type: "event",
      title: "Secret Solstice",
      slug: { current: "secret-solstice" },
      start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      venue: "Secret Warehouse",
      ticketingSource: "pretix",
      pretixEventId: "secret-solstice",
      description: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "Sunrise ceremony with four-point sound and immersive visuals.",
            },
          ],
        },
      ],
      lineup: [{ _type: "reference", _ref: artists[0]._id }],
      published: true,
      tags: ["Secret", "Warehouse"],
    },
    {
      _id: "event-archive",
      _type: "event",
      title: "Archive: Resonance",
      slug: { current: "archive-resonance" },
      start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      venue: "Griessmuehle",
      ticketingSource: "pretix",
      pretixEventId: "archive-resonance",
      description: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "A throwback marathon bridging acid trance and cutting-edge techno.",
            },
          ],
        },
      ],
      lineup: [{ _type: "reference", _ref: artists[1]._id }],
      published: true,
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

  const pages = [
    {
      _id: "page-about",
      _type: "page",
      title: "About",
      slug: { current: "about" },
      body: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "aer berlin is a trance collective shaping inclusive, high-energy experiences across Europe.",
            },
          ],
        },
      ],
    },
    {
      _id: "page-impressum",
      _type: "page",
      title: "Impressum",
      slug: { current: "impressum" },
      body: [
        {
          _key: nanoid(),
          _type: "block",
          style: "normal",
          children: [
            {
              _key: nanoid(),
              _type: "span",
              text: "aer berlin Kultur UG, Krumme Str. 123, 10627 Berlin",
            },
          ],
        },
      ],
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
