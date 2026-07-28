/**
 * Maps each partner tier + billing interval to a Stripe Price ID.
 *
 * Replace the placeholder values with your actual Stripe Price IDs
 * from your Stripe Dashboard (or from environment variables).
 */

export type PartnerTier = "friend_of_worship" | "worship_partner" | "altar_builder";

export const TIER_PRICE_IDS: Record<
  PartnerTier,
  { monthly: string; yearly: string }
> = {
  friend_of_worship: {
    monthly: process.env.STRIPE_PRICE_FRIEND_MONTHLY ?? "price_PLACEHOLDER",
    yearly: process.env.STRIPE_PRICE_FRIEND_YEARLY ?? "price_PLACEHOLDER",
  },
  worship_partner: {
    monthly: process.env.STRIPE_PRICE_WORSHIP_MONTHLY ?? "price_PLACEHOLDER",
    yearly: process.env.STRIPE_PRICE_WORSHIP_YEARLY ?? "price_PLACEHOLDER",
  },
  altar_builder: {
    monthly: process.env.STRIPE_PRICE_ALTAR_MONTHLY ?? "price_PLACEHOLDER",
    yearly: process.env.STRIPE_PRICE_ALTAR_YEARLY ?? "price_PLACEHOLDER",
  },
};

export const TIER_LABELS: Record<PartnerTier, string> = {
  friend_of_worship: "Friend of Worship",
  worship_partner: "Worship Partner",
  altar_builder: "Altar Builder",
};

/**
 * Baseline suggested give amount (USD) per tier + billing interval — used to
 * prefill the give/pledge form's Amount field. The pledge amount itself
 * stays editable; this is just a sensible starting point.
 */
export const TIER_BASE_AMOUNTS: Record<
  PartnerTier,
  { monthly: number; yearly: number }
> = {
  friend_of_worship: { monthly: 10, yearly: 100 },
  worship_partner: { monthly: 25, yearly: 250 },
  altar_builder: { monthly: 100, yearly: 1000 },
};

export const TIER_DESCRIPTIONS: Record<PartnerTier, string> = {
  friend_of_worship:
    "Join our community and support the ministry with a monthly gift.",
  worship_partner:
    "Partner with us more closely and receive exclusive updates and resources.",
  altar_builder:
    "Stand at the forefront of worship. Your generosity funds new albums, outreach, and more.",
};
