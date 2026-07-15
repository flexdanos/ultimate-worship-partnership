import { stripe } from "./client";
import type { PartnerTier } from "./tiers";
import { TIER_PRICE_IDS } from "./tiers";

interface CreateCheckoutSessionParams {
  partnerEmail: string;
  stripeCustomerId?: string;
  tier: PartnerTier;
  /** "monthly" | "yearly" */
  interval: "monthly" | "yearly";
  /** Absolute URL to redirect to on success, e.g. https://yourdomain.com/thank-you */
  successUrl: string;
  /** Absolute URL to redirect to on cancel */
  cancelUrl: string;
  /** Internal partner DB id to attach as metadata */
  partnerId?: string;
}

/**
 * Creates a Stripe Checkout Session for a new or returning partner.
 * Returns the session URL to redirect the user to.
 */
export async function createCheckoutSession({
  partnerEmail,
  stripeCustomerId,
  tier,
  interval,
  successUrl,
  cancelUrl,
  partnerId,
}: CreateCheckoutSessionParams): Promise<string> {
  const priceId = TIER_PRICE_IDS[tier][interval];

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : partnerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      tier,
      interval,
      ...(partnerId && { partnerId }),
    },
    subscription_data: {
      metadata: {
        tier,
        interval,
        ...(partnerId && { partnerId }),
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL");
  }

  return session.url;
}

/**
 * Creates a Stripe Customer Portal session so a partner can manage
 * their subscription (cancel, update payment method, etc.)
 */
export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}
