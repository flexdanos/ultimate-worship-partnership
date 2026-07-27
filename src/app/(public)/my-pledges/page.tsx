import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pledges } from "@/drizzle/schema/pledges";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";
import { TIER_LABELS } from "@/lib/stripe/tiers";
import type { PartnerTier } from "@/lib/stripe/tiers";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "My Pledges | My Ultimate Worship" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  verified: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
};

export default async function MyPledgesPage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  const rows = await db
    .select()
    .from(pledges)
    .where(eq(pledges.userId, user.id))
    .orderBy(desc(pledges.createdAt));

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Pledges</h1>
          <p className="mt-1 text-muted-foreground">
            Every pledge you&apos;ve recorded, and its verification status.
          </p>
        </div>
        <Link
          href="/give"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          Give Again
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          You haven&apos;t recorded a pledge yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((pledge) => (
            <div key={pledge.id} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {formatCurrency(pledge.amountCents, pledge.currency.toUpperCase())}
                    {" · "}
                    {TIER_LABELS[pledge.tier as PartnerTier]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pledge.paymentMethod === "bank_transfer"
                      ? "Bank Transfer"
                      : "Mobile Money"}{" "}
                    · Submitted {formatDate(pledge.createdAt)}
                  </p>
                  {pledge.transactionReference && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ref: {pledge.transactionReference}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[pledge.status]}`}
                >
                  {pledge.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
