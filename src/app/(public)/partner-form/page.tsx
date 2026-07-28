import { Suspense } from "react";
import Link from "next/link";
import { PartnerIntakeForm } from "./partner-intake-form";
import { findPartnerByEmail } from "./actions";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a Partner | My Ultimate Worship",
  description:
    "Fill in your details to begin your partnership with My Ultimate Worship.",
};

export default async function PartnerFormPage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  const existingPartner = await findPartnerByEmail(user.email);
  const [firstName, ...rest] = user.name.trim().split(/\s+/);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold">
          {existingPartner ? "Your Partnership" : "Become a Partner"}
        </h1>
        <p className="text-muted-foreground">
          {existingPartner
            ? "You're already a partner with us. You can update your tier, billing interval, testimony, and prayer request below."
            : "Fill in your details below to begin your partnership with us."}
        </p>
        {existingPartner && (
          <Link
            href="/give"
            className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
          >
            Give Now →
          </Link>
        )}
      </div>
      <Suspense fallback={null}>
        <PartnerIntakeForm
          defaultFirstName={firstName ?? ""}
          defaultLastName={rest.join(" ")}
          defaultEmail={user.email}
          existingPartner={
            existingPartner
              ? {
                  firstName: existingPartner.firstName,
                  lastName: existingPartner.lastName,
                  email: existingPartner.email,
                  phone: existingPartner.phone ?? "",
                  country: existingPartner.country ?? "",
                  tier: existingPartner.tier,
                  interval: existingPartner.interval,
                  testimony: existingPartner.testimony ?? "",
                  prayerRequest: existingPartner.prayerRequest ?? "",
                }
              : null
          }
        />
      </Suspense>
    </div>
  );
}
