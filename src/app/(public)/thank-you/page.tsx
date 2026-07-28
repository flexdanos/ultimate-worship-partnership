import Link from "next/link";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thank You | My Ultimate Worship",
};

export default async function ThankYouPage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl">🙏</div>
      <h1 className="mb-4 text-3xl font-bold">Thank You for Partnering!</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Your support means the world to us. You&apos;ll receive a confirmation
        email shortly. Together we are carrying the sound of heaven to the
        nations.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
      >
        Back to Home
      </Link>
    </div>
  );
}
