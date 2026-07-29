import { db } from "@/lib/db";
import { partners } from "../../../../../drizzle/schema/partners";
import { desc } from "drizzle-orm";
import { formatDate } from "@/lib/utils";
import { TIER_LABELS } from "@/lib/tiers";
import type { PartnerTier } from "@/lib/tiers";

export const metadata = { title: "Partners | Admin" };

export default async function PartnersPage() {
  const allPartners = await db
    .select()
    .from(partners)
    .orderBy(desc(partners.createdAt));

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partners</h1>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {allPartners.length} total
        </span>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Country</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allPartners.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No partners yet.
                  </td>
                </tr>
              ) : (
                allPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">
                      {partner.firstName} {partner.lastName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {partner.email}
                    </td>
                    <td className="px-4 py-3">
                      {TIER_LABELS[partner.tier as PartnerTier]}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {partner.country ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[partner.status] ?? ""
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(partner.createdAt)}
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
