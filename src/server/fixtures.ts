import type {
  SanityArtist,
  SanityEvent,
  SanityGalleryItem,
  SanityPage,
  SanityRelease,
} from "@/lib/sanity.types";

export const mockArtists: SanityArtist[] = [
  {
    _id: "artist-dj-freya",
    name: "DJ Freya",
    slug: "dj-freya",
    role: "Resident",
    tags: ["Resident", "Trance"],
    socials: {
      instagram: "https://instagram.com/aerberlin",
      soundcloud: "https://soundcloud.com/aerberlin",
    },
    portrait: undefined,
    gallery: [],
    bio: [],
  },
  {
    _id: "artist-lumen",
    name: "Lumen",
    slug: "lumen",
    tags: ["Guest"],
    socials: {
      soundcloud: "https://soundcloud.com/aerberlin",
    },
    portrait: undefined,
    gallery: [],
    bio: [],
  },
];

export const mockEvents: SanityEvent[] = [
  {
    _id: "event-wired-002",
    title: "WIRED 002: Neon Convergence",
    slug: "wired-002",
    start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60 * 6).toISOString(),
    venue: "Rummels Bucht",
    address: "Eichenstraße 4, Berlin",
    description: [],
    ticketingSource: "pretix",
    pretixEventId: "wired-002",
    externalTicketUrl: undefined,
    tags: ["Trance", "Rave"],
    ageLimit: "18+",
    published: true,
    poster: undefined,
    lineup: mockArtists,
    gallery: [],
    accentColor: "#C4FF17",
    tiers: [
      {
        name: "Phase 1",
        description: "Early crawler admission",
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
    _id: "event-solstice",
    title: "Secret Solstice Ceremony",
    slug: "secret-solstice",
    start: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    venue: "Secret Warehouse",
    description: [],
    ticketingSource: "pretix",
    pretixEventId: "secret-solstice",
    published: true,
    poster: undefined,
    lineup: [mockArtists[0]],
    gallery: [],
    tags: ["Warehouse"],
  },
  {
    _id: "event-archive",
    title: "Archive: Resonance",
    slug: "archive-resonance",
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    venue: "Griessmühle",
    description: [],
    ticketingSource: "pretix",
    pretixEventId: "archive-resonance",
    published: true,
    poster: undefined,
    lineup: [mockArtists[1]],
    gallery: [],
    tags: ["Archive"],
  },
];

export const mockReleases: SanityRelease[] = [
  {
    _id: "release-emerald",
    title: "Emerald Vector",
    slug: "emerald-vector",
    date: new Date().toISOString(),
    cover: undefined,
    description: [],
    credits: [],
    links: {
      soundcloud: "https://soundcloud.com/aerberlin/emerald-vector",
      spotify: "https://open.spotify.com/album/mock",
    },
    tracks: [
      { title: "Emerald Vector", duration: "05:32" },
      { title: "Accelerant", duration: "06:14" },
    ],
  },
];

export const mockGallery: SanityGalleryItem[] = [
  {
    _id: "gallery-1",
    media: {
      _type: "image",
      asset: {
        _ref: "image-abc",
        _type: "reference",
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
