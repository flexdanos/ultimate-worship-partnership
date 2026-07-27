"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  pledgeId: string;
}

export function PledgeReviewActions({ pledgeId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleVerify() {
    startTransition(async () => {
      await fetch(`/api/admin/pledges/${pledgeId}/verify`, { method: "POST" });
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await fetch(`/api/admin/pledges/${pledgeId}/reject`, { method: "POST" });
      router.refresh();
    });
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        onClick={handleVerify}
        disabled={isPending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
      >
        Verify
      </button>
      <button
        onClick={handleReject}
        disabled={isPending}
        className="rounded-lg border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/20"
      >
        Reject
      </button>
    </div>
  );
}
