import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export const PLEDGE_PROOFS_BUCKET = "pledge-proofs";

let _adminClient: ReturnType<typeof createClient> | undefined;

function getSupabaseAdminClient() {
  if (_adminClient) return _adminClient;

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SECRET_KEY
  ) {
    throw new Error("Supabase admin credentials are not set");
  }

  _adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false } }
  );
  return _adminClient;
}

async function ensurePledgeProofsBucket() {
  const supabase = getSupabaseAdminClient();
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  if (buckets.some((bucket) => bucket.name === PLEDGE_PROOFS_BUCKET)) return;

  // Private bucket — proofs of payment can contain bank/Mobile Money details.
  const { error: createError } = await supabase.storage.createBucket(
    PLEDGE_PROOFS_BUCKET,
    { public: false }
  );
  if (createError && !createError.message.includes("already exists")) {
    throw createError;
  }
}

/** Uploads a pledge proof-of-payment file and returns its storage path. */
export async function uploadPledgeProof(file: File): Promise<string> {
  await ensurePledgeProofsBucket();
  const supabase = getSupabaseAdminClient();

  const ext = file.name.split(".").pop();
  const path = ext ? `${randomUUID()}.${ext}` : randomUUID();

  const { error } = await supabase.storage
    .from(PLEDGE_PROOFS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;
  return path;
}

/** Deletes a pledge proof-of-payment file from storage. */
export async function deletePledgeProof(storagePath: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(PLEDGE_PROOFS_BUCKET)
    .remove([storagePath]);
  if (error) throw error;
}

/** Builds a short-lived signed URL for admin review of a proof file. */
export async function getPledgeProofSignedUrl(
  storagePath: string,
  expiresInSeconds = 600
): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(PLEDGE_PROOFS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
