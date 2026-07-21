import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryImages } from "@/drizzle/schema/gallery";
import { getGalleryPublicUrl } from "@/lib/storage/gallery";
import { GalleryGrid } from "./gallery-grid";

export const metadata = {
  title: "Gallery | My Ultimate Worship",
  description: "Photos and moments from worship events and ministry.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await db
    .select()
    .from(galleryImages)
    .orderBy(desc(galleryImages.createdAt));

  const items = images.map((image) => ({
    id: image.id,
    alt: image.alt,
    url: getGalleryPublicUrl(image.storagePath),
    focalX: image.focalX,
    focalY: image.focalY,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Gallery</h1>
        <p className="text-lg text-muted-foreground">
          Moments captured in the presence of God.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No photos yet — check back soon.
        </p>
      ) : (
        <GalleryGrid images={items} />
      )}
    </div>
  );
}
