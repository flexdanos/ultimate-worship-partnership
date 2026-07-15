import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe/webhook";
import { db } from "@/lib/db";
import { partners } from "../../../../drizzle/schema/partners";
import { subscriptions } from "../../../../drizzle/schema/subscriptions";
import { paymentEvents } from "../../../../drizzle/schema/payment-events";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

/**
 * Stripe sends POST requests to this endpoint.
 * The route is public — authentication happens via webhook signature verification.
 *
 * To register this URL in Stripe:
 *   https://dashboard.stripe.com/webhooks → Add endpoint
 *   URL: https://yourdomain.com/payment-webhook
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(Buffer.from(rawBody), signature);
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const partnerId = session.metadata?.partnerId;

        if (partnerId && session.customer) {
          await db
            .update(partners)
            .set({
              status: "active",
              stripeCustomerId: session.customer as string,
              updatedAt: new Date(),
            })
            .where(eq(partners.id, partnerId));
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const partnerId = sub.metadata?.partnerId;

        if (!partnerId) break;

        const priceItem = sub.items.data[0];

        await db
          .insert(subscriptions)
          .values({
            partnerId,
            stripeSubscriptionId: sub.id,
            stripePriceId: priceItem.price.id,
            stripeProductId: priceItem.price.product as string,
            interval: priceItem.price.recurring?.interval === "year" ? "yearly" : "monthly",
            amountCents: priceItem.price.unit_amount ?? 0,
            currency: priceItem.price.currency,
            status: sub.status as "active" | "past_due" | "cancelled" | "trialing" | "unpaid" | "incomplete",
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          })
          .onConflictDoUpdate({
            target: subscriptions.stripeSubscriptionId,
            set: {
              status: sub.status as "active" | "past_due" | "cancelled" | "trialing" | "unpaid" | "incomplete",
              currentPeriodStart: new Date(sub.current_period_start * 1000),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
              updatedAt: new Date(),
            },
          });

        await logPaymentEvent(event, partnerId, null, "subscription_created");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const partnerId = sub.metadata?.partnerId;

        await db
          .update(subscriptions)
          .set({ status: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        if (partnerId) {
          await db
            .update(partners)
            .set({ status: "cancelled", updatedAt: new Date() })
            .where(eq(partners.id, partnerId));

          await logPaymentEvent(event, partnerId, null, "subscription_cancelled");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const partnerId = (invoice.subscription_details?.metadata?.partnerId) as string | undefined;
        await logPaymentEvent(event, partnerId ?? null, invoice.id, "renewal_succeeded");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const partnerId = (invoice.subscription_details?.metadata?.partnerId) as string | undefined;
        await logPaymentEvent(event, partnerId ?? null, invoice.id, "renewal_failed");
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

async function logPaymentEvent(
  event: Stripe.Event,
  partnerId: string | null,
  invoiceId: string | null,
  eventType: typeof paymentEvents.$inferInsert["eventType"]
) {
  await db.insert(paymentEvents).values({
    stripeEventId: event.id,
    stripeInvoiceId: invoiceId ?? undefined,
    partnerId: partnerId ?? undefined,
    eventType,
    rawPayload: event as unknown as Record<string, unknown>,
    occurredAt: new Date(event.created * 1000),
  });
}
