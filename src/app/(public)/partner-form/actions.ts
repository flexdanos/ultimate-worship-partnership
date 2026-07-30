"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { partners } from "../../../../drizzle/schema/partners";
import { testimonies } from "../../../../drizzle/schema/testimonies";
import type { PartnerTier } from "@/lib/tiers";

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

  await syncPartnerTestimony(partner);

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

  await syncPartnerTestimony(partner);

  return partner;
}

/**
 * Keeps the moderatable `testimonies` table in sync with a partner's own
 * editable testimony draft. Any edit resets moderation back to "pending" —
 * an already-approved quote shouldn't stay published if the wording changes.
 * Clearing the draft removes the corresponding testimonies row entirely.
 */
async function syncPartnerTestimony(partner: typeof partners.$inferSelect) {
  const [existing] = await db
    .select({ id: testimonies.id })
    .from(testimonies)
    .where(and(eq(testimonies.partnerId, partner.id), eq(testimonies.source, "partner")))
    .limit(1);

  if (!partner.testimony) {
    if (existing) {
      await db.delete(testimonies).where(eq(testimonies.id, existing.id));
    }
    return;
  }

  const name = `${partner.firstName} ${partner.lastName}`;

  if (existing) {
    await db
      .update(testimonies)
      .set({
        name,
        country: partner.country,
        quote: partner.testimony,
        status: "pending",
        reviewedByEmail: null,
        reviewedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(testimonies.id, existing.id));
  } else {
    await db.insert(testimonies).values({
      name,
      country: partner.country,
      quote: partner.testimony,
      source: "partner",
      status: "pending",
      partnerId: partner.id,
    });
  }
}
