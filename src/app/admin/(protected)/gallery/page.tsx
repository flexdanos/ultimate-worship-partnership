import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { galleryImages } from "@/drizzle/schema/gallery";
import { getGalleryPublicUrl } from "@/lib/storage/gallery";
import { UploadForm } from "./upload-form";
import { AdminGalleryGrid } from "./gallery-grid";

export const metadata = { title: "Gallery | Admin" };

export default async function AdminGalleryPage() {
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
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {items.length} total
        </span>
      </div>

      <div className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Upload image</h2>
        <UploadForm />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground shadow-sm">
          No images yet. Upload one above.
        </div>
      ) : (
        <AdminGalleryGrid images={items} />
      )}
    </div>
  );
}
