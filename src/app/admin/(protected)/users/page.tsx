import { count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteUsers } from "@/drizzle/schema/site-users";
import { pledges } from "@/drizzle/schema/pledges";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users | Admin" };

export default async function UsersPage() {
  const rows = await db
    .select({
      id: siteUsers.id,
      name: siteUsers.name,
      email: siteUsers.email,
      createdAt: siteUsers.createdAt,
      pledgeCount: count(pledges.id),
    })
    .from(siteUsers)
    .leftJoin(pledges, eq(pledges.userId, siteUsers.id))
    .groupBy(siteUsers.id, siteUsers.name, siteUsers.email, siteUsers.createdAt)
    .orderBy(desc(siteUsers.createdAt));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everyone who has created an account on the public site.
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          {rows.length} total
        </span>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Pledges</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No users have signed up yet.
                  </td>
                </tr>
              ) : (
                rows.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      {user.pledgeCount > 0 ? (
                        user.pledgeCount
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
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
