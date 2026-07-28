"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { TIER_LABELS } from "@/lib/stripe/tiers";
import type { PartnerTier } from "@/lib/stripe/tiers";
import { COUNTRIES, COUNTRY_DIAL_CODES } from "@/lib/constants/countries";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  tier: z.enum(["friend_of_worship", "worship_partner", "altar_builder"]),
  interval: z.enum(["monthly", "yearly"]),
  testimony: z.string().optional(),
  prayerRequest: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ExistingPartner {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  tier: PartnerTier;
  interval: "monthly" | "yearly";
  testimony: string;
  prayerRequest: string;
}

interface PartnerIntakeFormProps {
  defaultFirstName?: string;
  defaultLastName?: string;
  defaultEmail?: string;
  existingPartner?: ExistingPartner | null;
}

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

export function PartnerIntakeForm({
  defaultFirstName = "",
  defaultLastName = "",
  defaultEmail = "",
  existingPartner = null,
}: PartnerIntakeFormProps) {
  const isEditMode = !!existingPartner;
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const defaultTier =
    (searchParams.get("tier") as PartnerTier) ?? "friend_of_worship";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: existingPartner ?? {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: defaultEmail,
      phone: "",
      country: "",
      tier: defaultTier,
      interval: "monthly",
      testimony: "",
      prayerRequest: "",
    },
  });

  const selectedCountry = watch("country");

  useEffect(() => {
    if (isEditMode) return;
    const dialCode = selectedCountry
      ? COUNTRY_DIAL_CODES[selectedCountry]
      : undefined;
    if (!dialCode || dirtyFields.phone) return;
    setValue("phone", `+${dialCode} `);
  }, [isEditMode, selectedCountry, dirtyFields.phone, setValue]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 6000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(
        isEditMode ? "/api/partners/update" : "/api/partners/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong");
      }

      setSuccessMessage(
        isEditMode
          ? "Your partnership details have been updated."
          : "You're officially a partner with us! You can update your tier, testimony, or prayer request anytime below."
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <p>{successMessage}</p>
          {!isEditMode && (
            <Link
              href="/give"
              className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
            >
              Give Now →
            </Link>
          )}
        </div>
      )}

      {/* Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">First Name</label>
          <input
            {...register("firstName")}
            disabled={isEditMode}
            className={inputClass}
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
            disabled={isEditMode}
            className={inputClass}
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
          disabled={isEditMode}
          className={inputClass}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Country + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Country</label>
          <select
            {...register("country")}
            disabled={isEditMode}
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select your country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-xs text-destructive">
              {errors.country.message}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            type="tel"
            disabled={isEditMode}
            className={inputClass}
            placeholder="Select a country first"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">
              {errors.phone.message}
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
      <div id="testimony">
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
        {isSubmitting
          ? isEditMode
            ? "Saving…"
            : "Submitting…"
          : isEditMode
            ? "Save Changes"
            : "Become a Partner"}
      </button>
    </form>
  );
}
