import { NextResponse } from "next/server";
import { getEventBySlug } from "@/server/sanity";
import ical from "ical-generator";
import type { PortableTextBlock } from "sanity";

export async function GET(
  _request: Request,
  { params: { slug } }: { params: { slug: string } },
) {
  const event = await getEventBySlug(slug);
  if (!event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const description = Array.isArray(event.description)
    ? (event.description as PortableTextBlock[])
        .filter((block) => block._type === "block")
        .map((block) =>
          Array.isArray(block.children)
            ? block.children
                .map((child) => ("text" in child ? (child as { text?: string }).text ?? "" : ""))
                .join(" ")
            : "",
        )
        .join("\n")
    : "";

  const calendar = ical({ name: `aer berlin – ${event.title}` });
  calendar.createEvent({
    start: event.start,
    end: event.end ?? event.start,
    summary: event.title,
    description,
    location: [event.venue, event.address].filter(Boolean).join(", "),
    url: `https://aerberlin.de/events/${event.slug}`,
  });

  const body = calendar.toString();

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="aer-${event.slug}.ics"`,
    },
  });
}
