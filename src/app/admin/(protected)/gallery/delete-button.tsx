"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("Delete this image?")) return;

    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError("Failed");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="shrink-0 rounded-md bg-red-600/90 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
    >
      {isPending ? "…" : (error ?? "Delete")}
    </button>
  );
}
