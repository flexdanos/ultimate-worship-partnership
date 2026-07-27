import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { siteUsers } from "./site-users";

/**
 * Server-side session store for site-user auth. Only a hash of the session
 * token is stored — the raw token lives solely in the visitor's httpOnly
 * cookie (see src/lib/site-auth/session.ts).
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => siteUsers.id, { onDelete: "cascade" }),

  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
