import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { partners } from "./partners";
import { subscriptions } from "./subscriptions";

export const paymentEventTypeEnum = pgEnum("payment_event_type", [
  "renewal_succeeded",
  "renewal_failed",
  "subscription_created",
  "subscription_cancelled",
  "subscription_updated",
  "payment_refunded",
  "dispute_created",
]);

export const paymentEvents = pgTable("payment_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id").references(() => partners.id, {
    onDelete: "set null",
  }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id, {
    onDelete: "set null",
  }),

  // Stripe event identifiers
  stripeEventId: text("stripe_event_id").notNull().unique(),
  stripeInvoiceId: text("stripe_invoice_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),

  eventType: paymentEventTypeEnum("event_type").notNull(),

  /** Amount in smallest currency unit */
  amountCents: integer("amount_cents"),
  currency: text("currency").default("usd"),

  /** Raw Stripe event payload stored for audit / replay */
  rawPayload: jsonb("raw_payload"),

  /** Human-readable failure reason from Stripe (if applicable) */
  failureReason: text("failure_reason"),

  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PaymentEvent = typeof paymentEvents.$inferSelect;
export type NewPaymentEvent = typeof paymentEvents.$inferInsert;
