import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const GALLERY_BUCKET = "gallery";

let _adminClient: ReturnType<typeof createClient> | undefined;

function getSupabaseAdminClient() {
  if (_adminClient) return _adminClient;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Supabase admin credentials are not set");
  }

  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  return _adminClient;
}

async function ensureGalleryBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets.some((bucket) => bucket.name === GALLERY_BUCKET)) return;

  const { error: createError } = await supabase.storage.createBucket(
    GALLERY_BUCKET,
    { public: true }
  );
  if (createError && !createError.message.includes("already exists")) {
    throw createError;
  }
}

/** Uploads a gallery image to Supabase Storage and returns its storage path. */
export async function uploadGalleryImage(file: File): Promise<string> {
  await ensureGalleryBucket();
  const supabase = getSupabaseAdminClient();

  const ext = file.name.split(".").pop();
  const path = ext ? `${randomUUID()}.${ext}` : randomUUID();

  const { error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;
  return path;
}

/** Deletes a gallery image from Supabase Storage. */
export async function deleteGalleryImage(storagePath: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(GALLERY_BUCKET)
    .remove([storagePath]);
  if (error) throw error;
}

/** Builds the public URL for a gallery image's storage path. */
export function getGalleryPublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${base}/storage/v1/object/public/${GALLERY_BUCKET}/${storagePath}`;
}
