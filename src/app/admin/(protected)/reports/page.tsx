import { db } from "@/lib/db";
import { paymentEvents } from "../../../../../drizzle/schema/payment-events";
import { partners } from "../../../../../drizzle/schema/partners";
import { pledges } from "../../../../../drizzle/schema/pledges";
import { sql, count, eq, and, gte, desc } from "drizzle-orm";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MonthlyRevenueChart } from "./monthly-revenue-chart";
import { PartnersTierChart } from "./partners-tier-chart";

export const metadata = { title: "Reports | Admin" };

type MonthlyRow = { month: string; month_num: number; total_cents: number };

type RevenueActivity = {
  id: string;
  label: string;
  amountCents: number;
  currency: string;
  date: Date;
  detail: string;
};

async function getReportData() {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01`);

  const [
    annualPaymentRevenueResult,
    annualPledgeRevenueResult,
    paymentMonthlyBreakdown,
    pledgeMonthlyBreakdown,
    tierBreakdown,
    recentEvents,
    recentVerifiedPledges,
  ] = await Promise.all([
    // Annual revenue total from Stripe renewals
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(paymentEvents)
      .where(
        and(
          eq(paymentEvents.eventType, "renewal_succeeded"),
          gte(paymentEvents.occurredAt, yearStart)
        )
      ),

    // Annual revenue total from admin-verified pledges
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(pledges)
      .where(
        and(eq(pledges.status, "verified"), gte(pledges.reviewedAt, yearStart))
      ),

    // Renewal revenue by month (current year)
    db.execute<MonthlyRow>(sql`
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

    // Verified pledge revenue by month (current year)
    db.execute<MonthlyRow>(sql`
      SELECT
        to_char(reviewed_at, 'Month') AS month,
        EXTRACT(MONTH FROM reviewed_at) AS month_num,
        coalesce(sum(amount_cents), 0) AS total_cents
      FROM pledges
      WHERE status = 'verified'
        AND EXTRACT(YEAR FROM reviewed_at) = ${currentYear}
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

    // Recent admin-verified pledges
    db
      .select()
      .from(pledges)
      .where(eq(pledges.status, "verified"))
      .orderBy(desc(pledges.reviewedAt))
      .limit(10),
  ]);

  const monthlyTotals = new Map<number, { month: string; total_cents: number }>();
  for (const row of [...paymentMonthlyBreakdown, ...pledgeMonthlyBreakdown]) {
    const key = Number(row.month_num);
    const existing = monthlyTotals.get(key);
    monthlyTotals.set(key, {
      month: row.month,
      total_cents: (existing?.total_cents ?? 0) + Number(row.total_cents),
    });
  }
  const monthlyBreakdown = Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);

  const activity: RevenueActivity[] = [
    ...recentEvents.map((ev) => ({
      id: ev.id,
      label: ev.eventType.replace(/_/g, " "),
      amountCents: ev.amountCents ?? 0,
      currency: ev.currency ?? "usd",
      date: ev.occurredAt,
      detail: `${ev.stripeEventId.slice(0, 24)}…`,
    })),
    ...recentVerifiedPledges.map((pledge) => ({
      id: pledge.id,
      label: "verified pledge",
      amountCents: pledge.amountCents,
      currency: pledge.currency,
      date: pledge.reviewedAt ?? pledge.updatedAt,
      detail: pledge.transactionReference ?? "—",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return {
    annualRevenueCents:
      Number(annualPaymentRevenueResult[0]?.total ?? 0) +
      Number(annualPledgeRevenueResult[0]?.total ?? 0),
    monthlyBreakdown,
    tierBreakdown,
    activity,
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
        <div className="px-6 pt-6">
          <MonthlyRevenueChart data={data.monthlyBreakdown} />
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
        <div className="px-6 pt-6">
          <PartnersTierChart data={data.tierBreakdown} />
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

      {/* Recent revenue activity */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">Recent Revenue Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {data.activity.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No revenue activity yet.
                  </td>
                </tr>
              ) : (
                data.activity.map((row) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="px-4 py-3 capitalize">{row.label}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(row.amountCents, row.currency)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.detail}
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
