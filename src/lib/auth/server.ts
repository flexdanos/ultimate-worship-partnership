import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components,
 * Server Actions, and Route Handlers.
 *
 * Reads/writes cookies via Next.js `cookies()` so the session
 * is automatically refreshed on every request.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component — safe to ignore.
            // The middleware will handle session refresh.
          }
        },
      },
    }
  );
}

/**
 * Returns the currently authenticated user from the server session,
 * or null if the user is not logged in.
 */
export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}

/**
 * Asserts that the current request is from an authenticated admin.
 * Throws a redirect to /admin/login if not authenticated.
 *
 * Usage: call at the top of any admin Server Component or Server Action.
 */
export async function requireAdmin() {
  const user = await getUser();

  if (!user) {
    // Dynamic import avoids circular dependency with Next.js navigation
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }

  return user;
}
