import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteUsers } from "@/drizzle/schema/site-users";
import { signInSchema } from "@/lib/site-auth/schemas";
import { verifyPassword } from "@/lib/site-auth/password";
import { createSessionForUser, SESSION_COOKIE_NAME } from "@/lib/site-auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const rows = await db
      .select()
      .from(siteUsers)
      .where(eq(siteUsers.email, email))
      .limit(1);

    const user = rows[0];
    const passwordMatches = user
      ? await verifyPassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createSessionForUser(user.id);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
    return response;
  } catch (err) {
    console.error("[POST /api/auth/sign-in]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
