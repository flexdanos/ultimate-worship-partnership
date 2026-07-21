import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  storagePath: text("storage_path").notNull(),
  alt: text("alt").notNull(),
  // Focal point as a percentage (0-100) used for CSS object-position,
  // so a crop can be centered on the part of the image that matters.
  focalX: integer("focal_x").notNull().default(50),
  focalY: integer("focal_y").notNull().default(50),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;
