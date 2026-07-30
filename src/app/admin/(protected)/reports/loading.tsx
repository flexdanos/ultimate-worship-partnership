import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-10">
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-8 w-28" />
        </div>
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="divide-y px-6">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-4 py-3"
              >
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
