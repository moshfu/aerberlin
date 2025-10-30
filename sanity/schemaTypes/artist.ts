import { defineArrayMember, defineField, defineType } from "sanity";

export const artist = defineType({
  name: "artist",
  title: "Artists",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", title: "Name", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "name", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "role", type: "string", title: "Role" }),
    defineField({
      name: "shortDescription",
      type: "text",
      title: "Short description",
      rows: 2,
      description: "Shown underneath the artist name on the artists overview page.",
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
    defineField({ name: "marqueeText", type: "string", title: "Marquee text (moving band)" }),
    defineField({
      name: "featuredReleases",
      title: "Featured releases (up to 3)",
      type: "array",
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
    defineField({ name: "featuredReleaseUrl", type: "url", title: "(Deprecated) Single featured release URL" }),
    defineField({ name: "tags", type: "array", title: "Tags", of: [{ type: "string" }] }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "socials",
      title: "Socials",
      type: "object",
      fields: [
        { name: "instagram", type: "url", title: "Instagram" },
        { name: "soundcloud", type: "url", title: "SoundCloud" },
        { name: "bandcamp", type: "url", title: "Bandcamp" },
        { name: "spotify", type: "url", title: "Spotify" },
        { name: "youtube", type: "url", title: "YouTube" },
      ],
    }),
    defineField({ name: "pressKit", title: "Press kit", type: "file" }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "portrait",
    },
  },
});
