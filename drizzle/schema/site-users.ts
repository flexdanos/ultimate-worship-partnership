import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Independent, simple email/password identity for site visitors (donors),
 * separate from Supabase Auth (which is used only for /admin login).
 */
export const siteUsers = pgTable("site_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SiteUser = typeof siteUsers.$inferSelect;
export type NewSiteUser = typeof siteUsers.$inferInsert;
