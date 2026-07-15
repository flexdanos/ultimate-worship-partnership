import Stripe from "stripe";
import { stripe } from "./client";

/**
 * Verifies and constructs a Stripe webhook event from a raw request.
 *
 * @param rawBody  - The raw request body as a Buffer or string
 * @param signature - The `stripe-signature` header value
 */
export function constructWebhookEvent(
  rawBody: Buffer | string,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }

  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * A typed union of the Stripe event types this application handles.
 * Extend this list as you add more webhook handlers.
 */
export type HandledStripeEventType =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed"
  | "charge.dispute.created";
