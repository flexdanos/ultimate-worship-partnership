import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { galleryImages } from "@/drizzle/schema/gallery";
import { uploadGalleryImage } from "@/lib/storage/gallery";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function parseFocal(value: FormDataEntryValue | null): number {
  const num = typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(num)) return 50;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const alt = formData.get("alt");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPEG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB." },
        { status: 400 }
      );
    }
    if (typeof alt !== "string" || alt.trim().length === 0) {
      return NextResponse.json(
        { error: "Alt text is required" },
        { status: 400 }
      );
    }

    const focalX = parseFocal(formData.get("focalX"));
    const focalY = parseFocal(formData.get("focalY"));

    const storagePath = await uploadGalleryImage(file);

    const [image] = await db
      .insert(galleryImages)
      .values({ storagePath, alt: alt.trim(), focalX, focalY })
      .returning();

    return NextResponse.json({ image });
  } catch (err) {
    console.error("[POST /api/admin/gallery]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
