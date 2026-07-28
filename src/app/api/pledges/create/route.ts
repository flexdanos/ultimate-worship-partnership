import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pledges } from "@/drizzle/schema/pledges";
import { getSessionUser } from "@/lib/site-auth/session";
import { pledgeFormSchema } from "@/lib/pledges/schema";
import { uploadPledgeProof } from "@/lib/storage/pledge-proofs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const parsed = pledgeFormSchema.safeParse({
      amount: formData.get("amount"),
      tier: formData.get("tier"),
      paymentMethod: formData.get("paymentMethod"),
      transactionReference: formData.get("transactionReference"),
      payerPhone: formData.get("payerPhone"),
      note: formData.get("note"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    const hasFile = file instanceof File && file.size > 0;
    const reference = parsed.data.transactionReference?.trim() ?? "";

    if (!reference && !hasFile) {
      return NextResponse.json(
        { error: "Provide a transaction reference/ID or upload proof of payment." },
        { status: 400 }
      );
    }

    let proofStoragePath: string | undefined;
    let proofFileName: string | undefined;
    let proofMimeType: string | undefined;

    if (hasFile) {
      const proofFile = file as File;
      if (!ALLOWED_TYPES.includes(proofFile.type)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use JPEG, PNG, WEBP, or PDF." },
          { status: 400 }
        );
      }
      if (proofFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File too large. Max size is 5MB." },
          { status: 400 }
        );
      }
      proofStoragePath = await uploadPledgeProof(proofFile);
      proofFileName = proofFile.name;
      proofMimeType = proofFile.type;
    }

    const [pledge] = await db
      .insert(pledges)
      .values({
        userId: user.id,
        amountCents: Math.round(parsed.data.amount * 100),
        tier: parsed.data.tier,
        paymentMethod: parsed.data.paymentMethod,
        transactionReference: reference || undefined,
        payerPhone: parsed.data.payerPhone?.trim() || undefined,
        proofStoragePath,
        proofFileName,
        proofMimeType,
        note: parsed.data.note?.trim() || undefined,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ pledge });
  } catch (err) {
    console.error("[POST /api/pledges/create]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
