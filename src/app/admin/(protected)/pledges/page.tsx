import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pledges } from "@/drizzle/schema/pledges";
import { siteUsers } from "@/drizzle/schema/site-users";
import { getPledgeProofSignedUrl } from "@/lib/storage/pledge-proofs";
import { formatCurrency, formatDate } from "@/lib/utils";
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

  const rows = await db
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
    .orderBy(desc(pledges.createdAt));

  const rowsWithProofUrl = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      proofUrl: row.proofStoragePath
        ? await getPledgeProofSignedUrl(row.proofStoragePath)
        : null,
    }))
  );

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pledges</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review manual bank transfer / Mobile Money pledges and mark them
            verified once payment is confirmed.
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {rowsWithProofUrl.length} {status}
        </span>
      </div>

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/pledges?status=${tab.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              status === tab.value
                ? "bg-amber-500 text-slate-900"
                : "border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rowsWithProofUrl.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No {status} pledges.
        </div>
      ) : (
        <div className="grid gap-4">
          {rowsWithProofUrl.map((row) => (
            <div key={row.id} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {formatCurrency(row.amountCents, row.currency.toUpperCase())}
                    {" · "}
                    {TIER_LABELS[row.tier as PartnerTier]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.userName} ({row.userEmail}) · Submitted{" "}
                    {formatDate(row.createdAt)}
                  </p>
                </div>
                {status === "pending" && <PledgeReviewActions pledgeId={row.id} />}
              </div>

              <div className="grid gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Method:</span>{" "}
                  {row.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Mobile Money"}
                </p>
                {row.payerPhone && (
                  <p>
                    <span className="text-muted-foreground">Payer phone:</span>{" "}
                    {row.payerPhone}
                  </p>
                )}
                {row.transactionReference && (
                  <p>
                    <span className="text-muted-foreground">Reference:</span>{" "}
                    {row.transactionReference}
                  </p>
                )}
                {row.proofUrl && (
                  <p>
                    <a
                      href={row.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-600 underline hover:text-amber-500"
                    >
                      View Proof of Payment
                    </a>
                  </p>
                )}
                {row.note && (
                  <p>
                    <span className="text-muted-foreground">Note:</span> {row.note}
                  </p>
                )}
                {row.status !== "pending" && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed by {row.reviewedByEmail}
                    {row.reviewedAt ? ` on ${formatDate(row.reviewedAt)}` : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
