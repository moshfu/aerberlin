import { cache } from "react";
import { env } from "@/lib/env";
import { getPretix, getPretixList, postPretix } from "@/lib/pretix/client";
import type {
  PretixEvent,
  PretixProduct,
  PretixQuotaAvailability,
} from "@/lib/pretix/types";
import { mockEvents } from "@/server/fixtures";

const organizerBase = `/organizers/${env.PRETIX_ORGANIZER_SLUG}`;
const useMockPretix = env.USE_MOCK_PRETIX === "true";

export const getPretixEvents = cache(async () => {
  if (useMockPretix) {
    return mockEvents
      .filter((event) => event.pretixEventId)
      .map((event) => ({
        slug: event.pretixEventId as string,
        name: { en: event.title },
        date_from: event.start,
        date_to: event.end,
        location: event.venue,
        is_public: true,
        plugins: [],
      })) satisfies PretixEvent[];
  }
  return getPretixList<PretixEvent>(`${organizerBase}/events/`);
});

export async function getPretixProducts(eventSlug: string) {
  if (useMockPretix) {
    const event = mockEvents.find(
      (item) => item.pretixEventId === eventSlug || item.slug === eventSlug,
    );
    if (!event) return [];
    return (
      event.tiers?.map((tier, index) => ({
        id: Number(tier.pretixProductId ?? index + 1),
        name: { en: tier.name },
        description: { en: tier.description ?? "" },
        default_price: (tier.price ?? 20).toString(),
        category: null,
        min_per_order: 1,
        max_per_order: 6,
        active: true,
        sales_channels: [],
      })) ?? []
    ) satisfies PretixProduct[];
  }
  return getPretixList<PretixProduct>(
    `${organizerBase}/events/${eventSlug}/items/`,
  );
}

export async function getPretixProductAvailability(
  eventSlug: string,
  itemId: number,
) {
  if (useMockPretix) {
    return {
      item: itemId,
      available: 42,
      total_capacity: 200,
      blocked: 0,
    } satisfies PretixQuotaAvailability;
  }
  return getPretix<PretixQuotaAvailability>(
    `${organizerBase}/events/${eventSlug}/items/${itemId}/availability/`,
  );
}

export async function getPretixCatalog(eventSlug: string) {
  if (useMockPretix) {
    const event = mockEvents.find(
      (item) => item.pretixEventId === eventSlug || item.slug === eventSlug,
    );
    const products = await getPretixProducts(eventSlug);
    return {
      event: {
        slug: eventSlug,
        name: { en: event?.title ?? eventSlug },
        date_from: event?.start ?? new Date().toISOString(),
        date_to: event?.end,
        location: event?.venue,
        is_public: true,
        plugins: [],
      } as PretixEvent,
      products: products.map((product) => ({
        product,
        availability: {
          item: product.id,
          available: 30,
          total_capacity: 200,
          blocked: 0,
        } satisfies PretixQuotaAvailability,
      })),
    };
  }
  const [event, products] = await Promise.all([
    getPretix<PretixEvent>(`${organizerBase}/events/${eventSlug}/`),
    getPretixProducts(eventSlug),
  ]);

  const availabilityEntries = await Promise.all(
    products.map(async (product) => {
      try {
        const availability = await getPretixProductAvailability(
          eventSlug,
          product.id,
        );
        return { id: product.id, availability };
      } catch (error) {
        console.warn("Pretix availability fallback", error);
        return {
          id: product.id,
          availability: {
            item: product.id,
            available: product.active ? 50 : 0,
            total_capacity: null,
            blocked: 0,
          } as PretixQuotaAvailability,
        };
      }
    }),
  );

  return {
    event,
    products: products.map((product) => ({
      product,
      availability: availabilityEntries.find((entry) => entry.id === product.id)
        ?.availability,
    })),
  };
}

export async function scanPretixTicket(eventSlug: string, secret: string) {
  if (useMockPretix) {
    return {
      status: "ok",
      redeemed: false,
      attendee: "Mock User",
      order: "MOCK123",
    };
  }
  return postPretix<{
    status: string;
    reason?: string;
    redeemed: boolean;
    attendee?: string;
    order?: string;
  }>(
    `${organizerBase}/events/${eventSlug}/checkinlists/${env.PRETIX_CHECKIN_LIST_ID}/positions/scan/`,
    {
      secret,
      source_type: "qr",
      force: false,
    },
  );
}
