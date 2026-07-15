import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Shadcn UI utility: merges Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in cents to a human-readable currency string */
export function formatCurrency(
  amountCents: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amountCents / 100);
}

/** Format a Date to a short readable string */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}
