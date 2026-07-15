import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { partners } from "./partners";

export const billingIntervalEnum = pgEnum("billing_interval", [
  "monthly",
  "yearly",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "cancelled",
  "trialing",
  "unpaid",
  "incomplete",
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),

  // Stripe subscription references
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  stripeProductId: text("stripe_product_id").notNull(),

  // Billing details
  interval: billingIntervalEnum("interval").notNull(),
  /** Amount in the smallest currency unit (e.g. cents for USD) */
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),

  status: subscriptionStatusEnum("status").notNull().default("incomplete"),

  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
  }).notNull(),
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }).notNull(),

  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
