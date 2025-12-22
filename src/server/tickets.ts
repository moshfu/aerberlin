import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { serverConfig } from "@/server/config";
import { getPretixCatalog } from "@/server/pretix";
import type { SanityEvent } from "@/lib/sanity.types";

const useMockOrders = serverConfig.useMockStripe || serverConfig.useMockPretix;

export interface CheckoutRequestItem {
  productId: number;
  quantity: number;
}

export interface NormalizedCheckoutItem {
  productId: number;
  name: string;
  description?: string;
  unitPrice: number;
  currency: string;
  quantity: number;
}

interface CheckoutPayload {
  event: SanityEvent;
  items: NormalizedCheckoutItem[];
  locale: string;
}

const parsePretixPrice = (value: string | number | null | undefined) => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
};

export async function resolveCheckoutItems(
  event: SanityEvent,
  requestedItems: CheckoutRequestItem[],
) {
  if (!event.pretixEventId) {
    throw new Error("Missing Pretix event configuration");
  }

  if (useMockOrders) {
    const tiers = event.tiers ?? [];
    return requestedItems.map((requested) => {
      const tier =
        tiers.find((item) => Number(item.pretixProductId) === requested.productId) ?? tiers[0];
      const price = tier?.price ?? 0;
      return {
        productId: requested.productId,
        name: tier?.name ?? `Ticket ${requested.productId}`,
        description: tier?.description,
        unitPrice: price,
        currency: tier?.currency ?? "EUR",
        quantity: requested.quantity,
      };
    });
  }

  const catalog = await getPretixCatalog(event.pretixEventId);
  const currency = (catalog.event as { currency?: string })?.currency ?? "EUR";
  const productMap = new Map(
    catalog.products.map((entry) => [entry.product.id, entry.product]),
  );

  return requestedItems.map((requested) => {
    const product = productMap.get(requested.productId);
    if (!product || !product.active) {
      throw new Error(`Ticket product ${requested.productId} is unavailable`);
    }
    const price = parsePretixPrice(product.default_price);
    if (price == null) {
      throw new Error(`Ticket product ${requested.productId} is missing a price`);
    }
    if (product.max_per_order && requested.quantity > product.max_per_order) {
      throw new Error(`Quantity exceeds per-order limit for product ${requested.productId}`);
    }
    const localizedName = product.name?.en ?? Object.values(product.name ?? {})[0];
    const localizedDescription =
      product.description?.en ?? Object.values(product.description ?? {})[0];
    return {
      productId: product.id,
      name: localizedName ?? `Ticket ${product.id}`,
      description: localizedDescription,
      unitPrice: price,
      currency,
      quantity: requested.quantity,
    };
  });
}

export async function createPendingOrder(payload: CheckoutPayload) {
  if (useMockOrders) {
    return {
      id: "mock-order",
      eventSlug: payload.event.slug,
      locale: payload.locale,
      status: "PENDING",
      items: payload.items,
    };
  }
  const order = await prisma.ticketOrder.create({
    data: {
      eventSlug: payload.event.slug,
      eventTitle: payload.event.title,
      locale: payload.locale,
      status: "PENDING",
      metadata: payload.items as unknown as Prisma.InputJsonValue,
      items: {
        create: payload.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          currency: item.currency,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          pretixProductId: String(item.productId),
        })),
      },
    },
    include: {
      items: true,
    },
  });
  return order;
}

export async function createStripeCheckout(orderId: string, payload: CheckoutPayload) {
  const successUrl = `${serverConfig.nextPublicAppUrl}/tickets/success?order=${orderId}`;
  const cancelUrl = `${serverConfig.nextPublicAppUrl}/tickets?event=${payload.event.slug}`;

  if (useMockOrders) {
    return {
      id: "mock-session",
      url: cancelUrl,
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId,
      eventSlug: payload.event.slug,
      pretixEventId: payload.event.pretixEventId ?? "",
    },
    line_items: payload.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: item.currency.toLowerCase(),
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: {
          name: `${payload.event.title} – ${item.name}`,
          description: item.description,
        },
      },
    })),
  });

  await prisma.ticketOrder.update({
    where: { id: orderId },
    data: {
      stripeCheckoutSessionId: session.id,
    },
  });

  return session;
}

export async function markOrderCompleted(orderId: string, email: string, summary: Prisma.InputJsonValue) {
  if (useMockOrders) {
    return;
  }
  await prisma.ticketOrder.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      email,
      metadata: summary,
    },
  });
}
