import { NextResponse } from "next/server";
import { z } from "zod";
import { getEventBySlug } from "@/server/sanity";
import {
  createPendingOrder,
  createStripeCheckout,
  resolveCheckoutItems,
} from "@/server/tickets";
import { serverConfig } from "@/server/config";

const requestSchema = z.object({
  eventSlug: z.string(),
  locale: z.string().default("en"),
  items: z
    .array(
      z
        .object({
          productId: z.number(),
          quantity: z.number().int().positive(),
        })
        .passthrough(),
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    if (serverConfig.useMockStripe) {
      return NextResponse.json(
        { message: "Checkout disabled in demo mode" },
        { status: 503 },
      );
    }
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const event = await getEventBySlug(parsed.eventSlug);
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    if (event.ticketingSource !== "pretix" || !event.pretixEventId) {
      return NextResponse.json({ message: "Tickets unavailable" }, { status: 400 });
    }

    const normalizedItems = await resolveCheckoutItems(event, parsed.items);

    const order = await createPendingOrder({
      event,
      items: normalizedItems,
      locale: parsed.locale,
    });

    const session = await createStripeCheckout(order.id, {
      event,
      items: normalizedItems,
      locale: parsed.locale,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Checkout failed" }, { status: 500 });
  }
}
