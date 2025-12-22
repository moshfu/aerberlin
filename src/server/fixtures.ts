import type {
  SanityArtist,
  SanityEvent,
  SanityGalleryItem,
  SanityImage,
  SanityPage,
  SanityRelease,
} from "@/lib/sanity.types";

const localImage = (path: string): SanityImage => ({
  _type: "image",
  asset: {
    _ref: `local-${path.replace(/[^a-z0-9]+/gi, "-")}`,
    _type: "reference",
    url: path,
  },
});

export const mockArtists: SanityArtist[] = [
  {
    _id: "artist-funk4",
    name: "FUNK4",
    slug: "funk4",
    role: "Resident",
    shortDescription: "Kinetic trance and techno from Berlin-based selector FUNK4.",
    tags: ["Trance", "Techno"],
    socials: {
      instagram: "https://www.instagram.com/funk4official/",
      soundcloud: "https://soundcloud.com/funk4official",
    },
    portrait: localImage("/media/hero-backdrop1.jpg"),
    gallery: [localImage("/media/hero-backdrop2.jpg")],
    featuredReleases: [],
    bio: [
      {
        _type: "block",
        _key: "funk4-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "funk4-1-span",
            marks: [],
            text: "Berlin-based selector FUNK4 distils aer berlin's kinetic trance aesthetic into precision club workouts. Her mixes glide between sinewy techno, acid flashbacks, and euphoric breakdowns that keep high-energy dancers locked in.",
          },
        ],
      },
      {
        _type: "block",
        _key: "funk4-2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "funk4-2-span",
            marks: [],
            text: "Expect crystalline pads, rave nostalgia re-scored for today, and peak-time pacing designed for long-form journeys.",
          },
        ],
      },
    ],
  },
  {
    _id: "artist-funic",
    name: "FUNIC",
    slug: "funic",
    role: "Resident",
    shortDescription: "Progressive trance and melodic techno narrated for long-form journeys.",
    tags: ["Progressive", "Trance"],
    socials: {
      instagram: "https://www.instagram.com/funicmusic/",
      soundcloud: "https://soundcloud.com/funicmusic",
    },
    portrait: localImage("/media/hero-backdrop3.jpg"),
    gallery: [localImage("/media/hero-backdrop4.jpg")],
    featuredReleases: [],
    bio: [
      {
        _type: "block",
        _key: "funic-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "funic-1-span",
            marks: [],
            text: "FUNIC sculpts widescreen progressive trance and melodic techno narratives direct from Berlin. Their studio output and club edits drift from shimmering atmospherics into muscular low-end catharsis.",
          },
        ],
      },
      {
        _type: "block",
        _key: "funic-2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "funic-2-span",
            marks: [],
            text: "On the floor, long-form blends and heady breakbeats create a patient, emotional build built for after-hours devotion.",
          },
        ],
      },
    ],
  },
  {
    _id: "artist-5kyy",
    name: "5KYY",
    slug: "5kyy",
    role: "Resident",
    shortDescription: "High-voltage rave weapons and blistering kicks built for the basement.",
    tags: ["Techno", "Rave"],
    socials: {
      instagram: "https://www.instagram.com/5kyy1arr/",
      soundcloud: "https://soundcloud.com/skylar-ashton",
    },
    portrait: localImage("/media/aer-logo.jpg"),
    gallery: [localImage("/media/aer_banner_png.png")],
    featuredReleases: [],
    bio: [
      {
        _type: "block",
        _key: "5kyy-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "5kyy-1-span",
            marks: [],
            text: "5KYY (Skylar Ashton) threads high-voltage rave weapons, pitched vocals, and blistering kicks into fast-paced sets built for sweat-drenched basements.",
          },
        ],
      },
      {
        _type: "block",
        _key: "5kyy-2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "5kyy-2-span",
            marks: [],
            text: "The Berlin resident's SoundCloud catalogue of originals and edits fuels no-prisoners transitions that keep adrenaline spiking past sunrise.",
          },
        ],
      },
    ],
  },
];

export const mockEvents: SanityEvent[] = [
  {
    _id: "event-aer-000",
    title: "AER 000",
    slug: "aer-000",
    start: new Date("2024-12-15T18:00:00.000Z").toISOString(),
    end: new Date("2024-12-16T01:00:00.000Z").toISOString(),
    venue: "Südblock",
    marqueeText: "AER 000 // SÜDBLOCK BERLIN // LAUNCH TRANSMISSION",
    description: [
      {
        _type: "block",
        _key: "aer000-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "aer000-1-span",
            marks: [],
            text: "Launch night for the collective with friends and family on the floor.",
          },
        ],
      },
    ],
    ticketingSource: "pretix",
    pretixEventId: "aer-000",
    pretixTicketShopUrl: "https://pretix.invalid/aer/aer-000",
    ticketSalesOpen: true,
    published: true,
    poster: localImage("/media/hero-backdrop1.jpg"),
    lineup: [mockArtists[0]],
    gallery: [],
    tags: ["Archive", "Trance"],
  },
  {
    _id: "event-aer-001",
    title: "AER 001",
    slug: "aer-001",
    start: new Date("2025-07-28T13:00:00.000Z").toISOString(),
    end: new Date("2025-07-28T20:00:00.000Z").toISOString(),
    venue: "Park am Gleisdreieck",
    marqueeText: "AER 001 // PARK AM GLEISDREIECK // OPEN AIR",
    description: [
      {
        _type: "block",
        _key: "aer001-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "aer001-1-span",
            marks: [],
            text: "Open-air day session with aer berlin residents at Park am Gleisdreieck.",
          },
        ],
      },
    ],
    ticketingSource: "pretix",
    pretixEventId: "aer-001",
    pretixTicketShopUrl: "https://pretix.invalid/aer/aer-001",
    ticketSalesOpen: true,
    externalTicketUrl: undefined,
    tags: ["Trance", "Open-air"],
    ageLimit: "18+",
    published: true,
    poster: localImage("/media/hero-backdrop2.jpg"),
    lineup: [mockArtists[0], mockArtists[1]],
    gallery: [],
    accentColor: "#C4FF17",
    tiers: [
      {
        name: "Phase 1",
        description: "Early bird admission",
        price: 18,
        currency: "EUR",
        pretixProductId: "101",
      },
      {
        name: "Phase 2",
        price: 24,
        currency: "EUR",
        pretixProductId: "102",
      },
    ],
  },
  {
    _id: "event-aer-002",
    title: "AER 002",
    slug: "aer-002",
    start: new Date("2025-12-12T20:00:00.000Z").toISOString(),
    end: new Date("2025-12-13T02:00:00.000Z").toISOString(),
    venue: "Secret Location (TBD)",
    marqueeText: "AER 002 // SECRET LOCATION // WINTER NIGHT",
    description: [
      {
        _type: "block",
        _key: "aer002-1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "aer002-1-span",
            marks: [],
            text: "Winter night transmission. Exact address released to ticket holders 24 hours in advance.",
          },
        ],
      },
    ],
    ticketingSource: "pretix",
    pretixEventId: "aer-002",
    pretixTicketShopUrl: "https://pretix.invalid/aer/aer-002",
    ticketSalesOpen: true,
    published: true,
    poster: localImage("/media/hero-backdrop3.jpg"),
    lineup: [mockArtists[0], mockArtists[1], mockArtists[2]],
    gallery: [],
    tags: ["Trance"],
  },
];

export const mockReleases: SanityRelease[] = [
  {
    _id: "release-emerald",
    title: "Emerald Vector",
    slug: "emerald-vector",
    date: new Date().toISOString(),
    cover: localImage("/media/aer-logo.jpg"),
    description: [],
    credits: [],
    links: {
      soundcloud: "https://soundcloud.com/aer-berlin/aer-signal-001",
    },
    tracks: [
      { title: "Emerald Vector", duration: "05:32" },
      { title: "Accelerant", duration: "06:14" },
    ],
  },
  {
    _id: "release-spectrum",
    title: "Spectrum Pulse",
    slug: "spectrum-pulse",
    date: new Date("2024-04-10T00:00:00.000Z").toISOString(),
    cover: localImage("/media/hero-backdrop2.jpg"),
    description: [],
    credits: [],
    links: {
      soundcloud: "https://soundcloud.com/aer-berlin/aer-signal-002",
    },
    tracks: [
      { title: "Spectrum Pulse", duration: "06:02" },
      { title: "Aurora Bloom", duration: "04:58" },
    ],
  },
];

export const mockGallery: SanityGalleryItem[] = [
  {
    _id: "gallery-1",
    media: {
      _type: "image",
      asset: {
        _ref: "local-gallery-frame",
        _type: "reference",
        url: "/media/hero-backdrop4.jpg",
      },
    },
    caption: "Strobe bloom at WIRED",
    credit: "aer berlin media cell",
    tags: ["live"],
  },
];


export const mockPages: SanityPage[] = [
  {
    _id: "page-about",
    title: "About",
    slug: "about",
    body: [],
  },
  {
    _id: "page-impressum",
    title: "Impressum",
    slug: "impressum",
    body: [],
  },
  {
    _id: "page-datenschutz",
    title: "Datenschutz",
    slug: "datenschutz",
    body: [],
  },
  {
    _id: "page-agb",
    title: "AGB",
    slug: "agb",
    body: [],
  },
];
