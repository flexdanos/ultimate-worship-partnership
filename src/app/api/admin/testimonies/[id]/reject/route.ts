import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonies } from "@/drizzle/schema/testimonies";
import { getUser } from "@/lib/auth/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [updated] = await db
    .update(testimonies)
    .set({
      status: "rejected",
      reviewedByEmail: user.email,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(testimonies.id, params.id), eq(testimonies.status, "pending")))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "This testimony has already been reviewed" },
      { status: 409 }
    );
  }

  return NextResponse.json({ testimony: updated });
}
