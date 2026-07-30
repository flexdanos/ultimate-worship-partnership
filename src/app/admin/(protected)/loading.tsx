import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 p-4">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 p-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
