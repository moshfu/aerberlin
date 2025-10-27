import { defineField, defineType } from "sanity";

export const release = defineType({
  name: "release",
  title: "Releases",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "date", type: "date", title: "Release Date", validation: (Rule) => Rule.required() }),
    defineField({
      name: "cover",
      title: "Cover",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string" }],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "links",
      title: "Streaming Links",
      type: "object",
      fields: [
        { name: "soundcloud", type: "url", title: "SoundCloud" },
        { name: "bandcamp", type: "url", title: "Bandcamp" },
        { name: "spotify", type: "url", title: "Spotify" },
        { name: "youtube", type: "url", title: "YouTube" },
      ],
    }),
    defineField({
      name: "tracks",
      title: "Tracks",
      type: "array",
      of: [
        defineField({
          name: "track",
          type: "object",
          fields: [
            { name: "title", type: "string", title: "Title" },
            { name: "duration", type: "string", title: "Duration" },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "cover",
    },
  },
});
