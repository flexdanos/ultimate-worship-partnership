import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Inbox } from "lucide-react";
import { db } from "@/lib/db";
import { testimonies } from "../../../../../drizzle/schema/testimonies";
import { cn, formatDate } from "@/lib/utils";
import { ApproveTestimonyButton } from "./approve-testimony-button";
import { WriteTestimonyForm } from "./write-testimony-form";

export const metadata = { title: "Testimonies Moderation | Admin" };

type StatusFilter = "pending" | "approved" | "rejected";

export default async function TestimoniesModeration({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status: StatusFilter =
    searchParams.status === "approved" || searchParams.status === "rejected"
      ? searchParams.status
      : "pending";

  const [rows, pendingCount, approvedCount, rejectedCount] = await Promise.all([
    db
      .select()
      .from(testimonies)
      .where(eq(testimonies.status, status))
      .orderBy(desc(testimonies.createdAt)),
    db.select({ count: count() }).from(testimonies).where(eq(testimonies.status, "pending")),
    db.select({ count: count() }).from(testimonies).where(eq(testimonies.status, "approved")),
    db.select({ count: count() }).from(testimonies).where(eq(testimonies.status, "rejected")),
  ]);

  const tabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "pending", label: "Pending", count: pendingCount[0]?.count ?? 0 },
    { value: "approved", label: "Approved", count: approvedCount[0]?.count ?? 0 },
    { value: "rejected", label: "Rejected", count: rejectedCount[0]?.count ?? 0 },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Testimonies Moderation</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review partner testimonies before they appear publicly, or write and
          publish one yourself.
        </p>
      </div>

      <WriteTestimonyForm />

      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/testimonies-moderation?status=${tab.value}`}
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

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No {status} testimonies.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {row.name}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        row.source === "admin"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {row.source === "admin" ? "Admin-written" : "Partner"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.country ?? "Unknown"} · Submitted{" "}
                    {formatDate(row.createdAt)}
                  </p>
                </div>
                {status === "pending" && (
                  <ApproveTestimonyButton testimonyId={row.id} />
                )}
              </div>
              <blockquote className="rounded-lg bg-muted/40 p-4 text-sm italic text-muted-foreground">
                &ldquo;{row.quote}&rdquo;
              </blockquote>
              {status !== "pending" && (
                <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                  Reviewed by {row.reviewedByEmail}
                  {row.reviewedAt ? ` on ${formatDate(row.reviewedAt)}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
