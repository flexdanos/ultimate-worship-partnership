import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";
import { PledgeForm } from "./pledge-form";
import type { PartnerTier } from "@/lib/stripe/tiers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Give | My Ultimate Worship",
  description:
    "Record a bank transfer or Mobile Money pledge while our online payment setup is finalized.",
};

export default async function GivePage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  const defaultTier = (searchParams.tier as PartnerTier) ?? "friend_of_worship";

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold">Give</h1>
        <p className="text-muted-foreground">
          Pay directly by bank transfer or Mobile Money, then record your pledge
          below. Our team will verify it and mark it as received.
        </p>
      </div>
      <PledgeForm defaultTier={defaultTier} />
    </div>
  );
}
