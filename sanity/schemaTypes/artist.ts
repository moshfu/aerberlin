import { defineField, defineType } from "sanity";

export const artist = defineType({
  name: "artist",
  title: "Artists",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", title: "Name", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "name", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "role", type: "string", title: "Role" }),
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
