import Link from "next/link";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";
import { PledgeForm } from "./pledge-form";
import { findPartnerByEmail } from "../partner-form/actions";
import { TIER_BASE_AMOUNTS } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Give | My Ultimate Worship",
  description:
    "Record a Zelle, Cash App, or Mobile Money pledge while our online payment setup is finalized.",
};

export default async function GivePage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  const partner = await findPartnerByEmail(user.email);

  if (!partner) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="mb-3 text-3xl font-bold">Become a Partner First</h1>
        <p className="mb-8 text-muted-foreground">
          Your pledge is tied to your partnership tier. Fill in your
          partnership details before recording a gift.
        </p>
        <Link
          href="/partner-form"
          className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          Become a Partner →
        </Link>
      </div>
    );
  }

  const defaultAmount = TIER_BASE_AMOUNTS[partner.tier][partner.interval];

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold">Give</h1>
        <p className="text-muted-foreground">
          Pay directly by Zelle, Cash App, or Mobile Money, then record your
          pledge below. Our team will verify it and mark it as received.
        </p>
      </div>
      <PledgeForm tier={partner.tier} defaultAmount={defaultAmount} />
    </div>
  );
}
