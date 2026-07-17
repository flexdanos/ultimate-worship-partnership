import { db } from "@/lib/db";
import { partners } from "../../../../../drizzle/schema/partners";
import { isNotNull } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { ApproveTestimonyButton } from "./approve-testimony-button";

export const metadata = { title: "Testimonies Moderation | Admin" };

export default async function TestimoniesModeration() {
  // Pull partners who submitted a testimony
  const rows = await db
    .select({
      id: partners.id,
      firstName: partners.firstName,
      lastName: partners.lastName,
      country: partners.country,
      testimony: partners.testimony,
      createdAt: partners.createdAt,
    })
    .from(partners)
    .where(isNotNull(partners.testimony));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Testimonies Moderation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve partner testimonies before they appear publicly.
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {rows.length} pending
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
          No testimonies awaiting moderation.
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
                  <p className="font-semibold">
                    {row.firstName} {row.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {row.country ?? "Unknown"} · Submitted{" "}
                    {formatDate(row.createdAt)}
                  </p>
                </div>
                <ApproveTestimonyButton partnerId={row.id} />
              </div>
              <blockquote className="rounded-lg bg-muted/40 p-4 text-sm italic text-muted-foreground">
                &ldquo;{row.testimony}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
