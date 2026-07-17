"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface Props {
  partnerId: string;
}

export function ApproveTestimonyButton({ partnerId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      await fetch(`/api/admin/testimonies/${partnerId}/approve`, {
        method: "POST",
      });
      router.refresh();
    });
  }

  function handleReject() {
    startTransition(async () => {
      await fetch(`/api/admin/testimonies/${partnerId}/reject`, {
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
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-500 disabled:opacity-60"
      >
        Approve
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
