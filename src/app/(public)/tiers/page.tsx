import Link from "next/link";
import { TIER_LABELS, TIER_DESCRIPTIONS } from "@/lib/tiers";
import type { PartnerTier } from "@/lib/tiers";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Partnership Tiers | My Ultimate Worship",
  description:
    "Choose your level of partnership and help us carry worship to the nations.",
};

const tiers: {
  key: PartnerTier;
  id: string;
  monthlyLabel: string;
  yearlyLabel: string;
  perks: string[];
}[] = [
  {
    key: "friend_of_worship",
    id: "friend-of-worship",
    monthlyLabel: "From $10 / month",
    yearlyLabel: "From $100 / year",
    perks: [
      "Monthly ministry newsletter",
      "Prayer updates",
      "Access to partner community",
    ],
  },
  {
    key: "worship_partner",
    id: "worship-partner",
    monthlyLabel: "From $25 / month",
    yearlyLabel: "From $250 / year",
    perks: [
      "Everything in Friend of Worship",
      "Early access to new releases",
      "Exclusive devotional content",
      "Quarterly video updates",
    ],
  },
  {
    key: "altar_builder",
    id: "altar-builder",
    monthlyLabel: "From $100 / month",
    yearlyLabel: "From $1,000 / year",
    perks: [
      "Everything in Worship Partner",
      "Name in album credits",
      "Annual partner gathering invitation",
      "Personal prayer request line",
      "Behind-the-scenes studio access",
    ],
  },
];

export default async function TiersPage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Partnership Tiers</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Every level of partnership directly funds worship ministry — recordings,
          live events, and reaching those who have never heard.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {tiers.map((tier, i) => (
          <div
            key={tier.key}
            id={tier.id}
            className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
              i === 2
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                : "bg-card"
            }`}
          >
            {i === 2 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-slate-900">
                Most Impactful
              </span>
            )}
            <h2 className="mb-2 text-xl font-bold">
              {TIER_LABELS[tier.key]}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {TIER_DESCRIPTIONS[tier.key]}
            </p>
            <div className="mb-6 space-y-1">
              <p className="font-semibold">{tier.monthlyLabel}</p>
              <p className="text-sm text-muted-foreground">{tier.yearlyLabel}</p>
            </div>

            <ul className="mb-8 flex-1 space-y-2">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            <Link
              href={`/partner-form?tier=${tier.key}`}
              className={`rounded-lg px-6 py-3 text-center font-semibold transition ${
                i === 2
                  ? "bg-amber-500 text-slate-900 hover:bg-amber-400"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
