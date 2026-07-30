"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PenLine, X } from "lucide-react";

export function WriteTestimonyForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [quote, setQuote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function reset() {
    setName("");
    setCountry("");
    setQuote("");
    setError(null);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/testimonies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, country, quote }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to publish testimony");
        return;
      }
      reset();
      router.push("/admin/testimonies-moderation?status=approved");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <PenLine className="h-4 w-4" />
        Write a Testimony
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Write a Testimony</h2>
          <p className="text-xs text-muted-foreground">
            Published immediately to the public Testimonies page.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Cancel"
          className="text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Abena K."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Country
          </label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Ghana"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/40 focus:ring-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Testimony
        </label>
        <textarea
          required
          rows={4}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Share how worship has impacted this person's life…"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none ring-primary/40 focus:ring-2"
        />
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={reset}
          disabled={isPending}
          className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Publish
        </button>
      </div>
    </form>
  );
}
