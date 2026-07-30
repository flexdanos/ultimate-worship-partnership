import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { testimonies } from "@/drizzle/schema/testimonies";
import { getUser } from "@/lib/auth/server";

const schema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  quote: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const [testimony] = await db
      .insert(testimonies)
      .values({
        name: data.name,
        country: data.country || null,
        quote: data.quote,
        source: "admin",
        status: "approved",
        reviewedByEmail: user.email,
        reviewedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ testimony });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[POST /api/admin/testimonies/create]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
