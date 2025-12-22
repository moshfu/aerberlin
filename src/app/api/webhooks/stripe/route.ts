import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { serverConfig } from "@/server/config";
import { markOrderCompleted } from "@/server/tickets";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    if (!signature) throw new Error("Missing signature");
    event = stripe.webhooks.constructEvent(body, signature, serverConfig.stripeWebhookSecret);
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: Record<string, string>; customer_details?: { email?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await markOrderCompleted(orderId, session.customer_details?.email ?? "", session);
    }
  }

  return NextResponse.json({ received: true });
}
