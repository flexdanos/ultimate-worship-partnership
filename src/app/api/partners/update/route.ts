import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/site-auth/session";
import { findPartnerByEmail, updatePartner } from "@/app/(public)/partner-form/actions";

const schema = z.object({
  tier: z.enum(["friend_of_worship", "worship_partner", "altar_builder"]),
  interval: z.enum(["monthly", "yearly"]),
  testimony: z.string().optional(),
  prayerRequest: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const existing = await findPartnerByEmail(user.email);
    if (!existing) {
      return NextResponse.json(
        { error: "No partnership record found for this account." },
        { status: 404 }
      );
    }

    const partner = await updatePartner(user.email, data);
    return NextResponse.json({ partner });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[POST /api/partners/update]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
