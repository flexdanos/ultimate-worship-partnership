import Link from "next/link";

export const metadata = {
  title: "Home | My Ultimate Worship",
  description:
    "Welcome to My Ultimate Worship — a ministry dedicated to lifting hearts through praise.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 px-6 text-center text-white">
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Worship Without Limits
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
          Join a global community of worshippers and help us carry the sound of
          heaven to the nations.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/tiers"
            className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-900 transition hover:bg-amber-400"
          >
            Become a Partner
          </Link>
          <Link
            href="/testimonies"
            className="rounded-lg border border-white/30 px-8 py-3 font-semibold transition hover:bg-white/10"
          >
            Read Testimonies
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
        <p className="text-lg text-muted-foreground">
          My Ultimate Worship exists to create music that ushers people into the
          presence of God. Through your partnership, we fund recordings, live
          events, and outreach that transform lives.
        </p>
      </section>

      {/* Partner Tiers Preview */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Partner With Us</h2>
          <p className="mb-12 text-muted-foreground">
            Choose the level of partnership that fits your heart.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Friend of Worship",
                desc: "Support the ministry with a monthly gift and receive our newsletter.",
                href: "/tiers#friend-of-worship",
              },
              {
                name: "Worship Partner",
                desc: "Go deeper with exclusive resources, prayer updates, and early releases.",
                href: "/tiers#worship-partner",
              },
              {
                name: "Altar Builder",
                desc: "Stand at the forefront — funding albums, events, and global outreach.",
                href: "/tiers#altar-builder",
              },
            ].map((tier) => (
              <Link
                key={tier.name}
                href={tier.href}
                className="rounded-xl border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
              >
                <h3 className="mb-2 font-semibold">{tier.name}</h3>
                <p className="text-sm text-muted-foreground">{tier.desc}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/tiers"
            className="mt-10 inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            View All Tiers
          </Link>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Gallery</h2>
        <p className="mb-8 text-muted-foreground">
          Moments captured in worship.
        </p>
        <Link
          href="/gallery"
          className="rounded-lg border px-6 py-2 text-sm font-medium transition hover:bg-muted"
        >
          View Gallery →
        </Link>
      </section>
    </div>
  );
}
