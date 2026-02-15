import { defineArrayMember, defineField, defineType } from "sanity";

export const artist = defineType({
  name: "artist",
  title: "Artists",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", title: "Name", validation: (Rule) => Rule.required() }),
    defineField({
      name: "instagramRedirectOnly",
      type: "boolean",
      title: "Instagram-only guest profile",
      description: "Use a minimal guest profile and open Instagram directly from artist links.",
      initialValue: false,
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "name", maxLength: 96 },
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const redirectOnly = Boolean((context.document as { instagramRedirectOnly?: boolean } | undefined)?.instagramRedirectOnly);
          if (redirectOnly) return true;
          return value?.current ? true : "Slug is required for full artist profiles.";
        }),
    }),
    defineField({ name: "role", type: "string", title: "Role" }),
    defineField({
      name: "shortDescription",
      type: "text",
      title: "Short description",
      rows: 2,
      description: "Shown underneath the artist name on the artists overview page.",
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "nameSize",
      type: "number",
      title: "Artist name size multiplier",
      description: "1 = default. Range 0.6 – 1.6",
      validation: (Rule) => Rule.min(0.6).max(1.6),
    }),
    defineField({
      name: "nameStretchY",
      type: "number",
      title: "Artist name vertical stretch",
      description: "1 = normal height. Range 1.0 – 1.6",
      validation: (Rule) => Rule.min(1.0).max(1.6),
    }),
    defineField({
      name: "marqueeText",
      type: "string",
      title: "Marquee text (moving band)",
    }),
    defineField({
      name: "featuredReleases",
      title: "Featured releases (up to 3)",
      type: "array",
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
      of: [
        defineArrayMember({
          name: "featuredReleaseLink",
          title: "Release link",
          type: "object",
          fields: [
            defineField({
              name: "release",
              type: "reference",
              to: [{ type: "release" }],
              title: "Release",
              description: "Pick a release document to auto-fill artwork and streaming links.",
            }),
            defineField({
              name: "platform",
              type: "string",
              title: "Preferred streaming platform",
              description: "If set, the listen button will use this platform when available.",
              options: {
                list: [
                  { title: "Spotify", value: "spotify" },
                  { title: "SoundCloud", value: "soundcloud" },
                  { title: "Bandcamp", value: "bandcamp" },
                  { title: "YouTube", value: "youtube" },
                  { title: "External URL", value: "external" },
                ],
                layout: "radio",
              },
            }),
            defineField({
              name: "title",
              type: "string",
              title: "Custom title",
              description: "Optional override. Defaults to the referenced release title.",
            }),
            defineField({
              name: "url",
              type: "url",
              title: "Fallback URL",
              description: "Used if no release is referenced or the chosen platform link is missing.",
            }),
          ],
          preview: {
            select: {
              title: "title",
              platform: "platform",
              releaseTitle: "release.title",
            },
            prepare({ title, platform, releaseTitle }) {
              const resolvedTitle = title || releaseTitle || "Featured release";
              const badge = platform ? ` (${platform})` : "";
              return {
                title: resolvedTitle,
                subtitle: releaseTitle
                  ? `Linked to ${releaseTitle}${badge}`
                  : platform
                    ? `Platform: ${platform}`
                    : "Custom link",
              };
            },
          },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    // Back-compat: single featured release URL (deprecated)
    defineField({
      name: "featuredReleaseUrl",
      type: "url",
      title: "(Deprecated) Single featured release URL",
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "tags",
      type: "array",
      title: "Tags",
      of: [{ type: "string" }],
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "socials",
      title: "Socials",
      type: "object",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const redirectOnly = Boolean((context.document as { instagramRedirectOnly?: boolean } | undefined)?.instagramRedirectOnly);
          if (!redirectOnly) return true;
          const instagram = (value as { instagram?: string } | undefined)?.instagram;
          return instagram ? true : "Instagram URL is required for Instagram-only guest profiles.";
        }),
      fields: [
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "soundcloud", type: "url", title: "SoundCloud" },
        { name: "bandcamp", type: "url", title: "Bandcamp" },
        { name: "spotify", type: "url", title: "Spotify" },
        { name: "youtube", type: "url", title: "YouTube" },
        { name: "tiktok", type: "url", title: "TikTok" },
      ],
    }),
    defineField({
      name: "bookingEmail",
      title: "Booking email",
      type: "string",
      description: "Booking contact for this artist (used for the Booking button).",
      validation: (Rule) => Rule.email(),
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
    defineField({
      name: "pressKit",
      title: "Press kit",
      type: "file",
      hidden: ({ document }) => Boolean(document?.instagramRedirectOnly),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "portrait",
    },
  },
});
