import Stripe from "stripe";
import { serverConfig } from "@/server/config";

export const stripe = new Stripe(serverConfig.stripeSecretKey, {
  apiVersion: "2024-06-20",
});
