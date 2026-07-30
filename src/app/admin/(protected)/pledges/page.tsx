import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import {
  Banknote,
  Building2,
  Inbox,
  Paperclip,
  Smartphone,
} from "lucide-react";
import { db } from "@/lib/db";
import { pledges } from "@/drizzle/schema/pledges";
import { siteUsers } from "@/drizzle/schema/site-users";
import { getPledgeProofSignedUrl } from "@/lib/storage/pledge-proofs";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/tiers";
import type { PartnerTier } from "@/lib/tiers";
import { PledgeReviewActions } from "./pledge-review-actions";

export const metadata = { title: "Pledges | Admin" };

type StatusFilter = "pending" | "verified" | "rejected";

export default async function AdminPledgesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status: StatusFilter =
    searchParams.status === "verified" || searchParams.status === "rejected"
      ? searchParams.status
      : "pending";

  const [rows, pendingCount, verifiedCount, rejectedCount] = await Promise.all([
    db
      .select({
        id: pledges.id,
        amountCents: pledges.amountCents,
        currency: pledges.currency,
        tier: pledges.tier,
        paymentMethod: pledges.paymentMethod,
        transactionReference: pledges.transactionReference,
        payerPhone: pledges.payerPhone,
        proofStoragePath: pledges.proofStoragePath,
        note: pledges.note,
        status: pledges.status,
        reviewedByEmail: pledges.reviewedByEmail,
        reviewedAt: pledges.reviewedAt,
        createdAt: pledges.createdAt,
        userName: siteUsers.name,
        userEmail: siteUsers.email,
      })
      .from(pledges)
      .innerJoin(siteUsers, eq(pledges.userId, siteUsers.id))
      .where(eq(pledges.status, status))
      .orderBy(desc(pledges.createdAt)),
    db.select({ count: count() }).from(pledges).where(eq(pledges.status, "pending")),
    db.select({ count: count() }).from(pledges).where(eq(pledges.status, "verified")),
    db.select({ count: count() }).from(pledges).where(eq(pledges.status, "rejected")),
  ]);

  const rowsWithProofUrl = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      proofUrl: row.proofStoragePath
        ? await getPledgeProofSignedUrl(row.proofStoragePath)
        : null,
    }))
  );

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "pending", label: "Pending", count: pendingCount[0]?.count ?? 0 },
    { value: "verified", label: "Verified", count: verifiedCount[0]?.count ?? 0 },
    { value: "rejected", label: "Rejected", count: rejectedCount[0]?.count ?? 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Pledges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review manual bank transfer / Mobile Money pledges and mark them
          verified once payment is confirmed.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/pledges?status=${tab.value}`}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              status === tab.value
                ? "bg-amber-500 text-slate-900"
                : "border text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                status === tab.value
                  ? "bg-slate-900/15 text-slate-900"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {rowsWithProofUrl.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No {status} pledges.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rowsWithProofUrl.map((row) => {
            const metaItems = [
              {
                label: "Method",
                value:
                  row.paymentMethod === "bank_transfer"
                    ? "Bank Transfer"
                    : "Mobile Money",
                icon: row.paymentMethod === "bank_transfer" ? Building2 : Smartphone,
              },
              row.transactionReference
                ? { label: "Reference", value: row.transactionReference }
                : null,
              row.payerPhone
                ? { label: "Payer Phone", value: row.payerPhone }
                : null,
            ].filter((item): item is NonNullable<typeof item> => item !== null);

            return (
              <div
                key={row.id}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {row.userName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold">
                        {formatCurrency(row.amountCents, row.currency)}
                        {" · "}
                        {TIER_LABELS[row.tier as PartnerTier]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.userName} ({row.userEmail}) · Submitted{" "}
                        {formatDate(row.createdAt)}
                      </p>
                    </div>
                  </div>
                  {status === "pending" && (
                    <PledgeReviewActions pledgeId={row.id} />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t pt-4">
                  {metaItems.map((item) => (
                    <div key={item.label} className="min-w-[7rem]">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {"icon" in item && item.icon && (
                          <item.icon className="h-3.5 w-3.5" />
                        )}
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                {row.proofUrl && (
                  <a
                    href={row.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-primary transition hover:bg-muted"
                  >
                    <Paperclip className="h-4 w-4" />
                    View Proof of Payment
                  </a>
                )}

                {row.note && (
                  <p className="mt-4 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Note: </span>
                    {row.note}
                  </p>
                )}

                {row.status !== "pending" && (
                  <p className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
                    <Banknote className="h-3.5 w-3.5" />
                    Reviewed by {row.reviewedByEmail}
                    {row.reviewedAt ? ` on ${formatDate(row.reviewedAt)}` : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
