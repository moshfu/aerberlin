import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "heroPoster", title: "Hero Poster", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroVideoUrl", title: "Hero Video URL", type: "url" }),
    defineField({ name: "newsletterHeadline", title: "Newsletter Headline", type: "string" }),
    defineField({ name: "newsletterCopy", title: "Newsletter Copy", type: "text" }),
  ],
  preview: {
    select: {
      title: "title",
      media: "heroPoster",
    },
  },
});
