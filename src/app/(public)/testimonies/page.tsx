import Link from "next/link";
import { getSessionUser } from "@/lib/site-auth/session";
import { AuthGate } from "@/components/site-auth/auth-gate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Testimonies | My Ultimate Worship",
  description:
    "Read how worship has transformed lives through the My Ultimate Worship ministry.",
};

// Placeholder testimonies — replace with DB fetch once moderation flow is built
const testimonies = [
  {
    id: "1",
    name: "Abena K.",
    country: "Ghana",
    quote:
      "The worship music from this ministry brought me through the darkest season of my life. I am forever grateful.",
  },
  {
    id: "2",
    name: "Marcus T.",
    country: "United States",
    quote:
      "Becoming a Worship Partner has been one of the most meaningful decisions I have made. I feel connected to something eternal.",
  },
  {
    id: "3",
    name: "Chioma O.",
    country: "Nigeria",
    quote:
      "Every album release carries a fresh anointing. Thank you for your faithfulness to the call.",
  },
];

export default async function TestimoniesPage() {
  const user = await getSessionUser();
  if (!user) return <AuthGate />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">Testimonies</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Stories of lives touched through worship.
        </p>
        <Link
          href="/partner-form#testimony"
          className="inline-block rounded-lg bg-amber-500 px-6 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          Share or Update Your Testimony →
        </Link>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {testimonies.map((t) => (
          <blockquote
            key={t.id}
            className="flex flex-col rounded-xl border bg-card p-6 shadow-sm"
          >
            <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer>
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.country}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
