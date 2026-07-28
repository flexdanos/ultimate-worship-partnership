"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { partners } from "../../../../drizzle/schema/partners";
import type { PartnerTier } from "@/lib/stripe/tiers";

export type BillingInterval = "monthly" | "yearly";

interface CreatePartnerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  tier: PartnerTier;
  interval: BillingInterval;
  testimony?: string;
  prayerRequest?: string;
}

interface UpdatePartnerInput {
  tier: PartnerTier;
  interval: BillingInterval;
  testimony?: string;
  prayerRequest?: string;
}

/** Looks up a partner record by the signed-in user's account email. */
export async function findPartnerByEmail(email: string) {
  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.email, email))
    .limit(1);

  return partner ?? null;
}

/**
 * Creates a new partner record. There's no payment step here — becoming a
 * partner is just a commitment/profile record; actual giving happens
 * separately through the pledge (Give Now) flow.
 */
export async function createPartner(input: CreatePartnerInput) {
  const [partner] = await db
    .insert(partners)
    .values({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      tier: input.tier,
      interval: input.interval,
      status: "active",
      testimony: input.testimony,
      prayerRequest: input.prayerRequest,
    })
    .returning();

  return partner;
}

/**
 * Updates the editable fields of an existing partner (tier, billing
 * interval, testimony, prayer request). Name/email/phone/country are locked
 * once a partner record exists.
 */
export async function updatePartner(email: string, input: UpdatePartnerInput) {
  const [partner] = await db
    .update(partners)
    .set({
      tier: input.tier,
      interval: input.interval,
      testimony: input.testimony,
      prayerRequest: input.prayerRequest,
      updatedAt: new Date(),
    })
    .where(eq(partners.email, email))
    .returning();

  return partner;
}
