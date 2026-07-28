import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteUsers } from "@/drizzle/schema/site-users";
import { signUpSchema } from "@/lib/site-auth/schemas";
import { hashPassword } from "@/lib/site-auth/password";
import { createSessionForUser, SESSION_COOKIE_NAME } from "@/lib/site-auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const existing = await db
      .select({ id: siteUsers.id })
      .from(siteUsers)
      .where(eq(siteUsers.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const [user] = await db
      .insert(siteUsers)
      .values({ name: parsed.data.name.trim(), email, passwordHash })
      .returning({ id: siteUsers.id, name: siteUsers.name, email: siteUsers.email });

    const { token, expiresAt } = await createSessionForUser(user.id);

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    return response;
  } catch (err) {
    console.error("[POST /api/auth/sign-up]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
