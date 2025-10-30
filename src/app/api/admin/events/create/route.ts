import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sanityWriteClient } from "@/lib/sanity.server";
import { getPretix } from "@/lib/pretix/client";
import type { PretixEvent } from "@/lib/pretix/types";
import { env } from "@/lib/env";

const organizerBase = `/organizers/${env.PRETIX_ORGANIZER_SLUG}`;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!sanityWriteClient) {
    return NextResponse.json(
      { message: "Sanity write client unavailable. Set SANITY_WRITE_TOKEN." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const { pretixSlug } = body ?? {};
  if (typeof pretixSlug !== "string" || !pretixSlug.trim()) {
    return NextResponse.json({ message: "Invalid Pretix slug" }, { status: 400 });
  }

  const event = await getPretix<PretixEvent>(`${organizerBase}/events/${pretixSlug}/`).catch(() => null);
  if (!event) {
    return NextResponse.json({ message: "Pretix event not found" }, { status: 404 });
  }

  const documentId = `event-${pretixSlug}`;
  const now = new Date().toISOString();

  await sanityWriteClient.createIfNotExists({
    _id: documentId,
    _type: "event",
    title: event.name?.en ?? pretixSlug,
    slug: {
      _type: "slug",
      current: pretixSlug,
    },
    start: event.date_from,
    end: event.date_to ?? null,
    venue: event.location ?? "",
    description: [],
    ticketingSource: "pretix",
    pretixEventId: pretixSlug,
    published: false,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    success: true,
    eventId: documentId,
  });
}
