import Link from "next/link";
import {
  Users,
  UserCheck,
  Wallet,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Image as ImageIcon,
  BarChart3,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { db } from "@/lib/db";
import { partners } from "../../../../../drizzle/schema/partners";
import { paymentEvents } from "../../../../../drizzle/schema/payment-events";
import { pledges } from "../../../../../drizzle/schema/pledges";
import { siteUsers } from "../../../../../drizzle/schema/site-users";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/tiers";
import type { PartnerTier } from "@/lib/tiers";
import { PledgeReviewActions } from "../pledges/pledge-review-actions";

export const metadata = { title: "Dashboard | Admin" };

async function getStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalPartnersResult,
    activePartnersResult,
    recentPaymentRevenueResult,
    recentPledgeRevenueResult,
    pendingPledgesCountResult,
    pendingPledges,
  ] = await Promise.all([
    db.select({ count: count() }).from(partners),
    db
      .select({ count: count() })
      .from(partners)
      .where(eq(partners.status, "active")),
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(paymentEvents)
      .where(
        and(
          eq(paymentEvents.eventType, "renewal_succeeded"),
          gte(paymentEvents.occurredAt, thirtyDaysAgo)
        )
      ),
    // Admin-verified pledges (Zelle / Cash App / Mobile Money) count as recognized revenue too
    db
      .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
      .from(pledges)
      .where(
        and(eq(pledges.status, "verified"), gte(pledges.reviewedAt, thirtyDaysAgo))
      ),
    db
      .select({ count: count() })
      .from(pledges)
      .where(eq(pledges.status, "pending")),
    // Oldest-first so the longest-waiting pledges surface first for review
    db
      .select({
        id: pledges.id,
        amountCents: pledges.amountCents,
        currency: pledges.currency,
        tier: pledges.tier,
        createdAt: pledges.createdAt,
        userName: siteUsers.name,
      })
      .from(pledges)
      .innerJoin(siteUsers, eq(pledges.userId, siteUsers.id))
      .where(eq(pledges.status, "pending"))
      .orderBy(pledges.createdAt)
      .limit(5),
  ]);

  const renewalCents = Number(recentPaymentRevenueResult[0]?.total ?? 0);
  const pledgeCents = Number(recentPledgeRevenueResult[0]?.total ?? 0);

  return {
    totalPartners: totalPartnersResult[0]?.count ?? 0,
    activePartners: activePartnersResult[0]?.count ?? 0,
    renewalCents,
    pledgeCents,
    recentRevenueCents: renewalCents + pledgeCents,
    pendingPledgesCount: pendingPledgesCountResult[0]?.count ?? 0,
    pendingPledges,
  };
}

type StatCard = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  href: string;
  highlight?: boolean;
};

const quickLinks = [
  {
    href: "/admin/testimonies-moderation",
    label: "Moderate Testimonies",
    icon: MessageSquare,
  },
  { href: "/admin/gallery", label: "Manage Gallery", icon: ImageIcon },
  { href: "/admin/reports", label: "Financial Reports", icon: BarChart3 },
];

export default async function DashboardPage() {
  const stats = await getStats();

  const cards: StatCard[] = [
    {
      label: "Total Partners",
      value: stats.totalPartners.toLocaleString(),
      description: "All time",
      icon: Users,
      href: "/admin/partners",
    },
    {
      label: "Active Partners",
      value: stats.activePartners.toLocaleString(),
      description: "Currently active",
      icon: UserCheck,
      href: "/admin/partners",
    },
    {
      label: "Revenue (30 days)",
      value: formatCurrency(stats.recentRevenueCents),
      description:
        stats.pledgeCents > 0
          ? `${formatCurrency(stats.renewalCents)} renewals · ${formatCurrency(stats.pledgeCents)} verified pledges`
          : "Successful renewals",
      icon: Wallet,
      href: "/admin/reports",
      highlight: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of partners and giving.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              "group rounded-xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              card.highlight && "border-primary/30 bg-primary/[0.04]"
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  card.highlight
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <card.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Needs attention */}
      {stats.pendingPledgesCount > 0 ? (
        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">
                  {stats.pendingPledgesCount} pledge
                  {stats.pendingPledgesCount === 1 ? "" : "s"} awaiting review
                </p>
                <p className="text-xs text-muted-foreground">
                  Verify manual gifts so they're recorded and counted as revenue.
                </p>
              </div>
            </div>
            <Link
              href="/admin/pledges?status=pending"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-amber-500/20">
            {stats.pendingPledges.map((pledge) => (
              <div
                key={pledge.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatCurrency(pledge.amountCents, pledge.currency)}
                    {" · "}
                    {TIER_LABELS[pledge.tier as PartnerTier]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pledge.userName} · Submitted {formatDate(pledge.createdAt)}
                  </p>
                </div>
                <PledgeReviewActions pledgeId={pledge.id} />
              </div>
            ))}
          </div>

          {stats.pendingPledgesCount > stats.pendingPledges.length && (
            <p className="mt-3 text-xs text-muted-foreground">
              +{stats.pendingPledgesCount - stats.pendingPledges.length} more
              waiting —{" "}
              <Link
                href="/admin/pledges?status=pending"
                className="font-medium text-primary hover:underline"
              >
                review them all
              </Link>
              .
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/15 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">
            All pledges are reviewed. No pending approvals right now.
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
          More to manage
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <link.icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">{link.label}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
