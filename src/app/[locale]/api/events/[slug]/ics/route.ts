import { NextResponse } from "next/server";
import { getEventBySlug, getEvents } from "@/server/sanity";
import ical from "ical-generator";
import type { PortableTextBlock } from "sanity";

// Locale-aware wrapper for /api/events/[slug]/ics to avoid locale redirects breaking the download.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: Request, { params }: any) {
  const slug = params?.slug as string | undefined;
  if (!slug) {
    return NextResponse.json({ message: "Missing slug" }, { status: 400 });
  }
  const url = new URL(request.url);
  const orderCode = url.searchParams.get("code") ?? url.searchParams.get("order");

  let event = await getEventBySlug(slug);
  if (!event) {
    const events = await getEvents();
    event = events.find((ev) => ev.pretixEventId === slug) ?? null;
  }
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
    description: orderCode ? `${description}\nOrder: ${orderCode}` : description,
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
