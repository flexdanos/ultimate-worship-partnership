import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/drizzle/schema/sessions";
import { siteUsers } from "@/drizzle/schema/site-users";

export const SESSION_COOKIE_NAME = "mw_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a session row for the given user and returns the raw token to be
 * set as the httpOnly cookie value. Only the token's hash is ever persisted.
 */
export async function createSessionForUser(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Returns the signed-in site user for the current request (via the session
 * cookie), or null if there's no valid, unexpired session. Safe to call from
 * Server Components, layouts, and Route Handlers.
 */
export async function getSessionUser(): Promise<{
  id: string;
  name: string;
  email: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await db
    .select({
      id: siteUsers.id,
      name: siteUsers.name,
      email: siteUsers.email,
    })
    .from(sessions)
    .innerJoin(siteUsers, eq(sessions.userId, siteUsers.id))
    .where(
      and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date()))
    )
    .limit(1);

  return rows[0] ?? null;
}

/** Deletes the session row matching a raw token (used on sign-out). */
export async function destroySessionByToken(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}
