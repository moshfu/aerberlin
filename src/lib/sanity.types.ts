import type { PortableTextBlock } from "sanity";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
    url?: string;
  };
  alt?: string;
  caption?: string;
}

export interface EventTier {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  pretixProductId?: string;
}

export interface SanityEvent {
  _id: string;
  title: string;
  slug: string;
  start: string;
  end?: string;
  venue?: string;
  address?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  marqueeText?: string;
  description: PortableTextBlock[];
  poster?: SanityImage;
  gallery?: SanityImage[];
  ticketingSource: "pretix" | "external";
  pretixEventId?: string;
  pretixTicketShopUrl?: string;
  ticketSalesOpen?: boolean;
  externalTicketUrl?: string;
  lineup?: SanityArtist[];
  tags?: string[];
  ageLimit?: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  accentColor?: string;
  tiers?: EventTier[];
}

export interface SanitySocials {
  instagram?: string;
  soundcloud?: string;
  bandcamp?: string;
  spotify?: string;
  youtube?: string;
}

export interface SanityArtist {
  _id: string;
  name: string;
  slug: string;
  role?: string;
  shortDescription?: string;
  marqueeText?: string;
  nameSize?: number;
  nameStretchY?: number;
  tags?: string[];
  portrait?: SanityImage;
  gallery?: SanityImage[];
  bio?: PortableTextBlock[];
  socials?: SanitySocials;
  pressKit?: {
    asset: { _ref: string; _type: "reference" };
    url?: string;
  };
  featuredReleases?: Array<{
    title?: string;
    url?: string;
    platform?: "spotify" | "soundcloud" | "bandcamp" | "youtube" | "external";
    release?: SanityRelease;
  }>;
  featuredReleaseUrl?: string; // deprecated single URL
}

export interface Track {
  title: string;
  duration?: string;
}

export interface StreamingLinks {
  soundcloud?: string;
  bandcamp?: string;
  spotify?: string;
  youtube?: string;
}

export interface SanityRelease {
  _id: string;
  title: string;
  slug: string;
  date: string;
  cover?: SanityImage;
  description?: PortableTextBlock[];
  credits?: PortableTextBlock[];
  links?: StreamingLinks;
  tracks?: Track[];
}

export interface SanityGalleryItem {
  _id: string;
  title?: string;
  media: SanityImage | {
    _type: "file";
    asset: {
      _ref: string;
      _type: "reference";
      url?: string;
    };
    url?: string;
  };
  caption?: string;
  credit?: string;
  tags?: string[];
}

export interface SanityPage {
  _id: string;
  title: string;
  slug: string;
  body: PortableTextBlock[];
}

export interface HomepageSettings {
  heroPoster?: SanityImage;
  heroVideoUrl?: string;
  newsletterHeadline?: string;
  newsletterCopy?: string;
}
