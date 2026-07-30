import { pgTable, text, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { partners } from "./partners";

export const testimonySourceEnum = pgEnum("testimony_source", [
  "partner",
  "admin",
]);

export const testimonyStatusEnum = pgEnum("testimony_status", [
  "pending",
  "approved",
  "rejected",
]);

/**
 * The moderatable, publishable record shown on the public Testimonies page.
 * Two sources:
 *  - "partner": mirrors a partner's own testimony draft (see partners.testimony),
 *    kept in sync on create/update, always starts "pending".
 *  - "admin": written directly by an admin in /admin/testimonies-moderation,
 *    published immediately ("approved").
 */
export const testimonies = pgTable("testimonies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country"),
  quote: text("quote").notNull(),

  source: testimonySourceEnum("source").notNull(),
  status: testimonyStatusEnum("status").notNull().default("pending"),

  /** Set when source is "partner" — the originating partner record. */
  partnerId: uuid("partner_id").references(() => partners.id, {
    onDelete: "set null",
  }),

  reviewedByEmail: text("reviewed_by_email"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Testimony = typeof testimonies.$inferSelect;
export type NewTestimony = typeof testimonies.$inferInsert;
