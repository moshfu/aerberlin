import { cache } from "react";
import { serverConfig } from "@/server/config";
import { getPretix, getPretixList, postPretix } from "@/lib/pretix/client";
import type {
  PretixEvent,
  PretixProduct,
  PretixQuotaAvailability,
} from "@/lib/pretix/types";
import { mockEvents } from "@/server/fixtures";

const envBase = serverConfig.pretixApiUrl.replace(/\/$/, "");
const organizerIncluded = envBase.includes("/organizers/");
const organizerBase = organizerIncluded ? "" : `/organizers/${serverConfig.pretixOrganizerSlug}`;
const useMockPretix = serverConfig.useMockPretix;

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
  try {
    return await getPretixList<PretixEvent>(`${organizerBase}/events/`);
  } catch (error) {
    console.error("Pretix events fetch failed", error);
    return [];
  }
});

// Convenience lookup map by event slug.
export const getPretixEventTitles = cache(async () => {
  const events = await getPretixEvents();
  return new Map(events.map((event) => [event.slug, event.name?.en ?? event.slug]));
});

export async function getPretixCheckinListId(eventSlug: string) {
  if (useMockPretix) return serverConfig.pretixCheckinListId;
  try {
    const lists = await getPretixList<{ id: number; name: string }>(
      `${organizerBase}/events/${eventSlug}/checkinlists/`,
    );
    if (lists?.length) {
      return String(lists[0].id);
    }
  } catch (error) {
    console.error("Pretix check-in lists fetch failed", error);
  }
  return serverConfig.pretixCheckinListId;
}

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
  const listId = await getPretixCheckinListId(eventSlug);
  const lists = [listId];
  try {
    return await postPretix<{
      status: string;
      reason?: string;
      reason_explanation?: string | null;
      position?: { attendee_name?: string; order?: string };
      require_attention?: boolean;
      list?: { name?: string; id?: number };
    }>(
      `${organizerBase}/checkinrpc/redeem/`,
      {
        secret,
        source_type: "barcode",
        lists,
        force: false,
        ignore_unpaid: false,
        questions_supported: false,
      },
      { allowErrorResponses: true },
    );
  } catch (error) {
    console.error("Pretix redeem failed", error);
    return { status: "error", reason: "invalid" } as const;
  }
}
