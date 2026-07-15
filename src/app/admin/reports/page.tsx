import { db } from "@/lib/db";
import { paymentEvents } from "../../../../drizzle/schema/payment-events";
import { partners } from "../../../../drizzle/schema/partners";
import { subscriptions } from "../../../../drizzle/schema/subscriptions";
import { sql, count, eq } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Reports | Admin" };

async function getReportData() {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01`);

  const [
    annualRevenueResult,
    monthlyBreakdown,
    tierBreakdown,
    recentEvents,
  ] = await Promise.all([
    // Annual revenue total
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(paymentEvents)
      .where(
        sql`event_type = 'renewal_succeeded' AND occurred_at >= ${yearStart}`
      ),

    // Revenue by month (current year)
    db.execute<{ month: string; total_cents: number }>(sql`
      SELECT
        to_char(occurred_at, 'Month') AS month,
        EXTRACT(MONTH FROM occurred_at) AS month_num,
        coalesce(sum(amount_cents), 0) AS total_cents
      FROM payment_events
      WHERE event_type = 'renewal_succeeded'
        AND EXTRACT(YEAR FROM occurred_at) = ${currentYear}
      GROUP BY month, month_num
      ORDER BY month_num
    `),

    // Partners by tier
    db
      .select({
        tier: partners.tier,
        count: count(),
      })
      .from(partners)
      .where(eq(partners.status, "active"))
      .groupBy(partners.tier),

    // Recent payment events
    db
      .select()
      .from(paymentEvents)
      .orderBy(sql`occurred_at DESC`)
      .limit(10),
  ]);

  return {
    annualRevenueCents: Number(annualRevenueResult[0]?.total ?? 0),
    monthlyBreakdown: monthlyBreakdown as {
      month: string;
      total_cents: number;
    }[],
    tierBreakdown,
    recentEvents,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-1 text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Annual and financial overview for {new Date().getFullYear()}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Annual Revenue ({new Date().getFullYear()})
          </p>
          <p className="mt-1 text-3xl font-bold">
            {formatCurrency(data.annualRevenueCents)}
          </p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Monthly Revenue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Month</th>
                <th className="px-4 py-3 text-left font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                    No data yet for this year.
                  </td>
                </tr>
              ) : (
                data.monthlyBreakdown.map((row) => (
                  <tr key={row.month} className="border-b last:border-0">
                    <td className="px-4 py-3">{row.month.trim()}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(Number(row.total_cents))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partners by tier */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Active Partners by Tier</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.tierBreakdown.map((row) => (
                <tr key={row.tier} className="border-b last:border-0">
                  <td className="px-4 py-3 capitalize">
                    {row.tier.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 font-medium">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent payment events */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Recent Payment Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Stripe Event</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No events yet.
                  </td>
                </tr>
              ) : (
                data.recentEvents.map((ev) => (
                  <tr key={ev.id} className="border-b last:border-0">
                    <td className="px-4 py-3 capitalize">
                      {ev.eventType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      {ev.amountCents
                        ? formatCurrency(ev.amountCents, ev.currency ?? "usd")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(ev.occurredAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {ev.stripeEventId.slice(0, 24)}…
                      </span>
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
