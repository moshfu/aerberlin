import { defineField, defineType } from "sanity";

export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery Item",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "media",
      title: "Media",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt" }],
    }),
    defineField({ name: "caption", type: "string", title: "Caption" }),
    defineField({ name: "credit", type: "string", title: "Credit" }),
    defineField({ name: "tags", type: "array", title: "Tags", of: [{ type: "string" }] }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "credit",
      media: "media",
    },
  },
});
