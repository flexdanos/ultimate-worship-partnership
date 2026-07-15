import { db } from "@/lib/db";
import { subscriptions } from "../../../../drizzle/schema/subscriptions";
import { partners } from "../../../../drizzle/schema/partners";
import { desc, eq } from "drizzle-orm";
import { formatDate, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Subscriptions | Admin" };

export default async function SubscriptionsPage() {
  const rows = await db
    .select({
      sub: subscriptions,
      partnerFirstName: partners.firstName,
      partnerLastName: partners.lastName,
      partnerEmail: partners.email,
    })
    .from(subscriptions)
    .leftJoin(partners, eq(subscriptions.partnerId, partners.id))
    .orderBy(desc(subscriptions.createdAt));

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    past_due: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    unpaid: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    incomplete: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {rows.length} total
        </span>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Partner</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Interval</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">
                  Current Period End
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  Stripe Subscription
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No subscriptions yet.
                  </td>
                </tr>
              ) : (
                rows.map(({ sub, partnerFirstName, partnerLastName, partnerEmail }) => (
                  <tr
                    key={sub.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {partnerFirstName} {partnerLastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {partnerEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(sub.amountCents, sub.currency)}
                    </td>
                    <td className="px-4 py-3 capitalize">{sub.interval}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[sub.status] ?? ""
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(sub.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://dashboard.stripe.com/subscriptions/${sub.stripeSubscriptionId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-primary underline-offset-4 hover:underline"
                      >
                        {sub.stripeSubscriptionId.slice(0, 20)}…
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
