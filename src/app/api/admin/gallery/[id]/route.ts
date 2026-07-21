import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { galleryImages } from "@/drizzle/schema/gallery";
import { deleteGalleryImage } from "@/lib/storage/gallery";

function parseFocal(value: unknown): number | null {
  const num = typeof value === "number" ? value : NaN;
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const focalX = parseFocal(body?.focalX);
    const focalY = parseFocal(body?.focalY);

    if (focalX === null || focalY === null) {
      return NextResponse.json(
        { error: "focalX and focalY must be numbers between 0 and 100" },
        { status: 400 }
      );
    }

    const [image] = await db
      .update(galleryImages)
      .set({ focalX, focalY })
      .where(eq(galleryImages.id, params.id))
      .returning();

    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ image });
  } catch (err) {
    console.error("[PATCH /api/admin/gallery/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [image] = await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.id, params.id));

    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await deleteGalleryImage(image.storagePath);
    await db.delete(galleryImages).where(eq(galleryImages.id, params.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/gallery/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
