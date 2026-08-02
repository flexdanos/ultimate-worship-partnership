import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { siteUsers } from "./site-users";
import { partnerTierEnum } from "./partners";

export const pledgePaymentMethodEnum = pgEnum("pledge_payment_method", [
  "zelle",
  "cash_app",
  "mobile_money",
]);

export const pledgeStatusEnum = pgEnum("pledge_status", [
  "pending",
  "verified",
  "rejected",
]);

/**
 * A manually-paid gift (Zelle / Cash App / Mobile Money) recorded by a
 * signed-in site user while the Stripe merchant account isn't fully live.
 * Starts "pending" and is reviewed by an admin in /admin/pledges.
 */
export const pledges = pgTable("pledges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => siteUsers.id, { onDelete: "cascade" }),

  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  tier: partnerTierEnum("tier").notNull().default("friend_of_worship"),

  paymentMethod: pledgePaymentMethodEnum("payment_method").notNull(),
  transactionReference: text("transaction_reference"),
  /** Mobile Money sender number — collected when paymentMethod is mobile_money */
  payerPhone: text("payer_phone"),

  proofStoragePath: text("proof_storage_path"),
  proofFileName: text("proof_file_name"),
  proofMimeType: text("proof_mime_type"),

  note: text("note"),

  status: pledgeStatusEnum("status").notNull().default("pending"),
  /** Admin's email at time of review (Supabase auth.users isn't modeled here, so no FK) */
  reviewedByEmail: text("reviewed_by_email"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Pledge = typeof pledges.$inferSelect;
export type NewPledge = typeof pledges.$inferInsert;
