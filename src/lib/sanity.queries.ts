import groq from "groq";

export const eventFields = `{
  _id,
  title,
  "slug": slug.current,
  start,
  end,
  venue,
  address,
  geo,
  marqueeText,
  ticketingSource,
  pretixEventId,
  externalTicketUrl,
  tags,
  ageLimit,
  published,
  accentColor,
  tiers[]{name, description, price, currency, pretixProductId},
  poster {
    ...,
    asset-> {
      _id,
      url,
      metadata
    }
  },
  description,
  lineup[]->{
    _id,
    name,
    "slug": slug.current,
    portrait {
      ...,
      asset-> {
        _id,
        url,
        metadata
      }
    },
    socials,
    role,
    tags
  }
}`;

export const releaseFields = `{
  _id,
  title,
  "slug": slug.current,
  date,
  cover {
    ...,
    asset-> {
      _id,
      url,
      metadata
    }
  },
  description,
  credits,
  links,
  tracks
}`;

export const artistFields = `{
  _id,
  name,
  "slug": slug.current,
  role,
  shortDescription,
  marqueeText,
  nameSize,
  nameStretchY,
  tags,
  socials,
  bio,
  featuredReleases[]{
    title,
    url,
    platform,
    release->${releaseFields}
  },
  featuredReleaseUrl,
  portrait {
    ...,
    asset-> {
      _id,
      url,
      metadata
    }
  },
  gallery[] {
    ...,
    asset-> {
      _id,
      url,
      metadata
    }
  },
  pressKit
}`;

export const galleryFields = `{
  _id,
  title,
  caption,
  credit,
  tags,
  media {
    ...,
    asset-> {
      _id,
      url,
      metadata
    }
  }
}`;

export const pageFields = `{
  _id,
  title,
  "slug": slug.current,
  body
}`;

export const homepageQuery = groq`{
  "events": *[_type == "event" && published == true && start >= now()] | order(start asc) [0...3] ${eventFields},
  "pastEvents": *[_type == "event" && published == true && start < now()] | order(start desc) [0...3] ${eventFields},
  "latestRelease": *[_type == "release"] | order(date desc) [0] ${releaseFields}
}`;

export const eventsQuery = groq`*[_type == "event" && published == true] | order(start asc) ${eventFields}`;

export const eventBySlugQuery = groq`*[_type == "event" && slug.current == $slug][0] ${eventFields}`;

export const artistsQuery = groq`*[_type == "artist"] | order(name asc) ${artistFields}`;

export const artistBySlugQuery = groq`*[_type == "artist" && slug.current == $slug][0] ${artistFields}`;

export const releasesQuery = groq`*[_type == "release"] | order(date desc) ${releaseFields}`;

export const galleryQuery = groq`*[_type == "galleryItem"] | order(_createdAt desc) ${galleryFields}`;

export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0] ${pageFields}`;
