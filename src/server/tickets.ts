import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import type { SanityEvent } from "@/lib/sanity.types";

const useMockOrders =
  env.USE_MOCK_STRIPE === "true" || env.USE_MOCK_PRETIX === "true";

interface CheckoutPayload {
  event: SanityEvent;
  items: Array<{
    productId: number;
    name: string;
    price: number;
    currency: string;
    quantity: number;
  }>;
  locale: string;
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
      metadata: payload.items,
      items: {
        create: payload.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          currency: item.currency,
          unitPrice: new Prisma.Decimal(item.price),
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
  const successUrl = `${env.NEXT_PUBLIC_APP_URL}/tickets/success?order=${orderId}`;
  const cancelUrl = `${env.NEXT_PUBLIC_APP_URL}/tickets?event=${payload.event.slug}`;

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
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: `${payload.event.title} – ${item.name}`,
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
