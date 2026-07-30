import { pgTable, text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { billingIntervalEnum } from "./enums";

export const partnerTierEnum = pgEnum("partner_tier", [
  "friend_of_worship",
  "worship_partner",
  "altar_builder",
]);

export const partnerStatusEnum = pgEnum("partner_status", [
  "active",
  "inactive",
  "pending",
  "cancelled",
]);

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  country: text("country"),
  tier: partnerTierEnum("tier").notNull().default("friend_of_worship"),
  interval: billingIntervalEnum("interval").notNull().default("monthly"),
  status: partnerStatusEnum("status").notNull().default("pending"),

  // Stripe references
  stripeCustomerId: text("stripe_customer_id").unique(),

  // Supabase auth link (optional — for partners who create accounts)
  supabaseUserId: uuid("supabase_user_id").unique(),

  // Testimony / notes from intake form — the partner's own editable draft.
  // The moderatable, publishable copy lives in the `testimonies` table,
  // kept in sync whenever this is saved (see partner-form/actions.ts).
  testimony: text("testimony"),
  prayerRequest: text("prayer_request"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
