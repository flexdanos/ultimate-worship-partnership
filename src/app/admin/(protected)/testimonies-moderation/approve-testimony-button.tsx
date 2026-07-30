"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Props {
  testimonyId: string;
}

export function ApproveTestimonyButton({ testimonyId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  function handleApprove() {
    setAction("approve");
    startTransition(async () => {
      await fetch(`/api/admin/testimonies/${testimonyId}/approve`, {
        method: "POST",
      });
      router.refresh();
    });
  }

  function handleReject() {
    setAction("reject");
    startTransition(async () => {
      await fetch(`/api/admin/testimonies/${testimonyId}/reject`, {
        method: "POST",
      });
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
      >
        {isPending && action === "approve" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-lg border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/20"
      >
        {isPending && action === "reject" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        Reject
      </button>
    </div>
  );
}
