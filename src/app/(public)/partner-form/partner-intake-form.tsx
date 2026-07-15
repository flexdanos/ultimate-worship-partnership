"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { TIER_LABELS } from "@/lib/stripe/tiers";
import type { PartnerTier } from "@/lib/stripe/tiers";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  tier: z.enum(["friend_of_worship", "worship_partner", "altar_builder"]),
  interval: z.enum(["monthly", "yearly"]),
  testimony: z.string().optional(),
  prayerRequest: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function PartnerIntakeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultTier =
    (searchParams.get("tier") as PartnerTier) ?? "friend_of_worship";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tier: defaultTier,
      interval: "monthly",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/partners/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong");
      }

      const { checkoutUrl } = await res.json();
      router.push(checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">First Name</label>
          <input
            {...register("firstName")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="John"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Last Name</label>
          <input
            {...register("lastName")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Phone + Country */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <input
            {...register("country")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="United States"
          />
          {errors.country && (
            <p className="mt-1 text-xs text-destructive">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* Tier */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Partnership Tier
        </label>
        <select
          {...register("tier")}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {(
            Object.entries(TIER_LABELS) as [PartnerTier, string][]
          ).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Interval */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Billing Interval
        </label>
        <div className="flex gap-4">
          {(["monthly", "yearly"] as const).map((interval) => (
            <label key={interval} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                {...register("interval")}
                type="radio"
                value={interval}
                className="accent-primary"
              />
              {interval.charAt(0).toUpperCase() + interval.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Testimony */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Your Testimony{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          {...register("testimony")}
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Share how worship has impacted your life..."
        />
      </div>

      {/* Prayer Request */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Prayer Request{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          {...register("prayerRequest")}
          rows={3}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="How can we pray for you?"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {isSubmitting ? "Redirecting to payment…" : "Continue to Payment →"}
      </button>
    </form>
  );
}
