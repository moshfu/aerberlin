import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Events",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", type: "slug", title: "Slug", options: { source: "title", maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: "start", type: "datetime", title: "Start", validation: (Rule) => Rule.required() }),
    defineField({ name: "end", type: "datetime", title: "End" }),
    defineField({ name: "venue", type: "string", title: "Venue" }),
    defineField({ name: "address", type: "string", title: "Address" }),
    defineField({ name: "geo", type: "geopoint", title: "Geo coordinates" }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Poster",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alt" }] }],
    }),
    defineField({
      name: "ticketingSource",
      title: "Ticketing Source",
      type: "string",
      options: {
        list: [
          { title: "Pretix", value: "pretix" },
          { title: "External", value: "external" },
        ],
        layout: "radio",
      },
      initialValue: "pretix",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "pretixEventId", title: "Pretix Event ID", type: "string" }),
    defineField({ name: "externalTicketUrl", title: "External Ticket URL", type: "url" }),
    defineField({
      name: "lineup",
      title: "Lineup",
      type: "array",
      of: [{ type: "reference", to: [{ type: "artist" }] }],
    }),
    defineField({ name: "ageLimit", title: "Age Limit", type: "string" }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "accentColor", title: "Accent Color", type: "string" }),
    defineField({
      name: "tiers",
      title: "Ticket tiers",
      type: "array",
      of: [
        defineField({
          name: "tier",
          type: "object",
          fields: [
            { name: "name", type: "string", title: "Name" },
            { name: "description", type: "text", title: "Description" },
            { name: "price", type: "number", title: "Price" },
            { name: "currency", type: "string", title: "Currency", initialValue: "EUR" },
            { name: "pretixProductId", type: "string", title: "Pretix Product ID" },
          ],
        }),
      ],
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      start: "start",
      media: "poster",
    },
    prepare(selection) {
      const { title, start, media } = selection;
      return {
        title,
        subtitle: start ? new Date(start).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }) : "",
        media,
      };
    },
  },
});
