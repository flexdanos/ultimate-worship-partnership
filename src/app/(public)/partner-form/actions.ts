"use server";

import { db } from "@/lib/db";
import { partners } from "../../../../drizzle/schema/partners";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { eq } from "drizzle-orm";
import type { PartnerTier } from "@/lib/stripe/tiers";
import { stripe } from "@/lib/stripe/client";

interface CreatePartnerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  tier: PartnerTier;
  interval: "monthly" | "yearly";
  testimony?: string;
  prayerRequest?: string;
}

/**
 * Creates (or retrieves) a partner record in the DB, creates a Stripe customer
 * if needed, then returns a Stripe Checkout URL.
 */
export async function createPartnerAndCheckout(
  input: CreatePartnerInput,
  baseUrl: string
): Promise<string> {
  // Check for existing partner
  const existing = await db
    .select()
    .from(partners)
    .where(eq(partners.email, input.email))
    .limit(1);

  let partner = existing[0];

  if (!partner) {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: input.email,
      name: `${input.firstName} ${input.lastName}`,
      metadata: { tier: input.tier },
    });

    // Insert partner record
    const [inserted] = await db
      .insert(partners)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        country: input.country,
        tier: input.tier,
        status: "pending",
        stripeCustomerId: customer.id,
        testimony: input.testimony,
        prayerRequest: input.prayerRequest,
      })
      .returning();

    partner = inserted;
  }

  // Create checkout session
  const checkoutUrl = await createCheckoutSession({
    partnerEmail: partner.email,
    stripeCustomerId: partner.stripeCustomerId ?? undefined,
    tier: input.tier,
    interval: input.interval,
    successUrl: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${baseUrl}/partner-form`,
    partnerId: partner.id,
  });

  return checkoutUrl;
}
