import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPartnerAndCheckout } from "@/app/(public)/partner-form/actions";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  country: z.string().min(1),
  tier: z.enum(["friend_of_worship", "worship_partner", "altar_builder"]),
  interval: z.enum(["monthly", "yearly"]),
  testimony: z.string().optional(),
  prayerRequest: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const baseUrl = request.nextUrl.origin;
    const checkoutUrl = await createPartnerAndCheckout(data, baseUrl);

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[POST /api/partners/create]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
