import { db } from "@/lib/db";
import { partners } from "../../../../../drizzle/schema/partners";
import { subscriptions } from "../../../../../drizzle/schema/subscriptions";
import { paymentEvents } from "../../../../../drizzle/schema/payment-events";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard | Admin" };

async function getStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPartnersResult,
    activePartnersResult,
    activeSubscriptionsResult,
    recentRevenueResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(partners),
    db
      .select({ count: count() })
      .from(partners)
      .where(eq(partners.status, "active")),
    db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(paymentEvents)
      .where(
        and(
          eq(paymentEvents.eventType, "renewal_succeeded"),
          gte(paymentEvents.occurredAt, thirtyDaysAgo)
        )
      ),
  ]);

  return {
    totalPartners: totalPartnersResult[0]?.count ?? 0,
    activePartners: activePartnersResult[0]?.count ?? 0,
    activeSubscriptions: activeSubscriptionsResult[0]?.count ?? 0,
    recentRevenueCents: Number(recentRevenueResult[0]?.total ?? 0),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      label: "Total Partners",
      value: stats.totalPartners.toLocaleString(),
      description: "All time",
    },
    {
      label: "Active Partners",
      value: stats.activePartners.toLocaleString(),
      description: "Currently active",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      description: "Live Stripe subscriptions",
    },
    {
      label: "Revenue (30 days)",
      value: formatCurrency(stats.recentRevenueCents),
      description: "Successful renewals",
    },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Quick Links</h2>
        <ul className="space-y-2 text-sm">
          {[
            { href: "/admin/partners", label: "View all partners" },
            { href: "/admin/subscriptions", label: "View subscriptions" },
            {
              href: "/admin/testimonies-moderation",
              label: "Moderate testimonies",
            },
            { href: "/admin/reports", label: "Financial reports" },
          ].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-primary underline-offset-4 hover:underline"
              >
                {link.label} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
