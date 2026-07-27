import { NextRequest, NextResponse } from "next/server";
import { destroySessionByToken, SESSION_COOKIE_NAME } from "@/lib/site-auth/session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroySessionByToken(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
