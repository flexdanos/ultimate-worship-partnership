"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useRef, useState } from "react";
import { TIER_LABELS } from "@/lib/tiers";
import type { PartnerTier } from "@/lib/tiers";
import { pledgeFormSchema } from "@/lib/pledges/schema";
import {
  ZELLE_DETAILS,
  CASH_APP_DETAILS,
  MOBILE_MONEY_DETAILS,
} from "@/lib/pledges/payment-details";
import { AuthTabs } from "@/components/site-auth/auth-tabs";

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

type PaymentMethod = "zelle" | "cash_app" | "mobile_money";

interface PledgeFormProps {
  tier: PartnerTier;
  defaultAmount: number;
}

export function PledgeForm({ tier, defaultAmount }: PledgeFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("zelle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(formData: FormData): string | null {
    const parsed = pledgeFormSchema.safeParse({
      amount: formData.get("amount"),
      tier: formData.get("tier"),
      paymentMethod: formData.get("paymentMethod"),
      transactionReference: formData.get("transactionReference"),
      payerPhone: formData.get("payerPhone"),
      note: formData.get("note"),
    });
    if (!parsed.success) return parsed.error.issues[0]?.message ?? "Invalid input";

    const reference = (formData.get("transactionReference") as string) ?? "";
    const file = formData.get("file");
    const hasFile = file instanceof File && file.size > 0;
    if (!reference.trim() && !hasFile) {
      return "Provide a transaction reference/ID or upload proof of payment.";
    }
    return null;
  }

  async function submitPledge(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pledges/create", {
        method: "POST",
        body: formData,
      });

      if (res.status === 401) {
        // Session expired mid-fill — keep the typed data, prompt re-auth, resubmit after.
        setPendingFormData(formData);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    submitPledge(formData);
  }

  function handleReauthSuccess() {
    const formData = pendingFormData;
    setPendingFormData(null);
    if (formData) submitPledge(formData);
  }

  if (success) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <h2 className="mb-2 text-xl font-bold">Pledge recorded</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Thank you! Your pledge has been recorded and is pending verification.
          We&apos;ll confirm it once our team matches it to your payment.
        </p>
        <Link
          href="/my-pledges"
          className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          View My Pledges
        </Link>
      </div>
    );
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Amount (USD)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="1"
            required
            defaultValue={defaultAmount}
            className={inputClass}
            placeholder="50"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Partnership Tier</label>
          <input type="hidden" name="tier" value={tier} />
          <input
            value={TIER_LABELS[tier]}
            disabled
            readOnly
            className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Change your tier from the{" "}
            <Link href="/partner-form" className="underline hover:text-foreground">
              partnership form
            </Link>
            .
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Payment Method</label>
          <div className="flex gap-4">
            {(
              [
                { value: "zelle", label: "Zelle" },
                { value: "cash_app", label: "Cash App" },
                { value: "mobile_money", label: "Mobile Money" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.value}
                  checked={paymentMethod === option.value}
                  onChange={() => setPaymentMethod(option.value)}
                  className="accent-primary"
                />
                {option.label}
              </label>
            ))}
          </div>

          {paymentMethod === "zelle" ? (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Recipient name:</span>{" "}
                {ZELLE_DETAILS.recipientName}
              </p>
              <p>
                <span className="text-muted-foreground">Phone number:</span>{" "}
                {ZELLE_DETAILS.phoneNumber}
              </p>
            </div>
          ) : paymentMethod === "cash_app" ? (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Cashtag:</span>{" "}
                {CASH_APP_DETAILS.cashtag}
              </p>
              <p>
                <span className="text-muted-foreground">Account name:</span>{" "}
                {CASH_APP_DETAILS.accountName}
              </p>
              <p>
                <span className="text-muted-foreground">Phone number:</span>{" "}
                {CASH_APP_DETAILS.phoneNumber}
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Provider:</span>{" "}
                {MOBILE_MONEY_DETAILS.provider}
              </p>
              <p>
                <span className="text-muted-foreground">Account name:</span>{" "}
                {MOBILE_MONEY_DETAILS.accountName}
              </p>
              <p>
                <span className="text-muted-foreground">Number:</span>{" "}
                {MOBILE_MONEY_DETAILS.phoneNumber}
              </p>
            </div>
          )}
        </div>

        {paymentMethod === "mobile_money" && (
          <div>
            <label className="mb-1 block text-sm font-medium">
              Phone number you paid from
            </label>
            <input
              name="payerPhone"
              type="tel"
              className={inputClass}
              placeholder="+233 555 000 000"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Transaction Reference / ID{" "}
            <span className="text-muted-foreground">(or upload proof below)</span>
          </label>
          <input
            name="transactionReference"
            type="text"
            className={inputClass}
            placeholder="e.g. TXN123456"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Proof of Payment{" "}
            <span className="text-muted-foreground">(optional — image or PDF)</span>
          </label>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="block w-full text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Note <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea name="note" rows={2} className={inputClass} />
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
          {isSubmitting ? "Recording pledge…" : "Record My Pledge"}
        </button>
      </form>

      <Dialog.Root open={!!pendingFormData} onOpenChange={() => {}}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 shadow-lg">
            <Dialog.Title className="mb-1 text-lg font-bold">
              Please sign in again
            </Dialog.Title>
            <Dialog.Description className="mb-6 text-sm text-muted-foreground">
              Your session expired. Sign in to submit the pledge you just filled in
              — nothing you typed will be lost.
            </Dialog.Description>
            <AuthTabs defaultTab="sign-in" onSuccess={handleReauthSuccess} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
