import Link from "next/link";
import { desc } from "drizzle-orm";
import { Reveal } from "@/components/reveal";
import { db } from "@/lib/db";
import { galleryImages } from "@/drizzle/schema/gallery";
import { getGalleryPublicUrl } from "@/lib/storage/gallery";

export const metadata = {
  title: "My Ultimate Worship",
  description:
    "Welcome to My Ultimate Worship — a ministry dedicated to lifting hearts through praise.",
};

// Real photos from a My Ultimate Worship live session.
const HERO_IMAGE = "/images/home/hero.jpg";
const MISSION_IMAGE = "/images/home/mission.jpg";
const TIERS_TEXTURE_IMAGE = "/images/home/tiers-texture.jpg";

export default async function HomePage() {
  const recentGalleryImages = await db
    .select()
    .from(galleryImages)
    .orderBy(desc(galleryImages.createdAt))
    .limit(3);

  const galleryPreview = recentGalleryImages.map((image) => ({
    id: image.id,
    alt: image.alt,
    url: getGalleryPublicUrl(image.storagePath),
    focalX: image.focalX,
    focalY: image.focalY,
  }));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="The My Ultimate Worship band leading a full room in worship"
            className="h-full w-full scale-100 object-cover motion-safe:animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/70 to-amber-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        </div>

        <div className="relative">
          <p className="mb-5 animate-fade-up text-sm font-medium uppercase tracking-[0.2em] text-amber-300/90 motion-reduce:animate-none">
            My Ultimate Worship
          </p>
          <h1
            className="mb-6 text-balance animate-fade-up text-4xl font-bold leading-tight tracking-tight [animation-delay:120ms] motion-reduce:animate-none sm:text-6xl"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            Worship Without Limits
          </h1>
          <p
            className="mx-auto mb-10 max-w-2xl animate-fade-up text-pretty text-lg text-slate-200 [animation-delay:260ms] motion-reduce:animate-none sm:text-xl"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            Join a global community of worshippers and help us carry the sound of
            heaven to the nations.
          </p>
          <div
            className="flex animate-fade-up flex-col gap-4 [animation-delay:400ms] motion-reduce:animate-none sm:flex-row"
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            <Link
              href="/tiers"
              className="rounded-lg bg-amber-500 px-8 py-3 font-semibold text-slate-900 transition duration-300 ease-out-expo hover:scale-[1.03] hover:bg-amber-400"
            >
              Become a Partner
            </Link>
            <Link
              href="/testimonies"
              className="rounded-lg border border-white/30 px-8 py-3 font-semibold text-white transition duration-300 ease-out-expo hover:scale-[1.03] hover:bg-white/10"
            >
              Read Testimonies
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground">
            My Ultimate Worship exists to create music that ushers people into the
            presence of God. Through your partnership, we fund recordings, live
            events, and outreach that transform lives.
          </p>
        </Reveal>
        <Reveal delayMs={150} className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm -rotate-2 overflow-hidden rounded-3xl shadow-2xl transition duration-500 ease-out-expo hover:rotate-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MISSION_IMAGE}
              alt="A worship leader singing with the My Ultimate Worship band"
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>
      </section>

      {/* Partner Tiers Preview */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={TIERS_TEXTURE_IMAGE}
            alt=""
            aria-hidden
            className="h-full w-full object-cover opacity-[0.07] dark:opacity-[0.1]"
          />
          <div className="absolute inset-0 bg-background/95" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <Reveal>
            <h2 className="mb-4 text-3xl font-bold">Partner With Us</h2>
            <p className="mb-12 text-muted-foreground">
              Choose the level of partnership that fits your heart.
            </p>
          </Reveal>
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
            ].map((tier, i) => (
              <Reveal key={tier.name} delayMs={i * 120}>
                <Link
                  href={tier.href}
                  className="block h-full rounded-xl border bg-card p-6 text-left shadow-sm transition duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="mb-2 font-semibold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.desc}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal delayMs={360}>
            <Link
              href="/tiers"
              className="mt-10 inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition duration-300 ease-out-expo hover:scale-[1.03] hover:opacity-90"
            >
              View All Tiers
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Gallery teaser */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <Reveal>
          <h2 className="mb-4 text-3xl font-bold">Gallery</h2>
          <p className="mb-12 text-muted-foreground">
            Moments captured in worship.
          </p>
        </Reveal>

        <Reveal delayMs={120}>
          {galleryPreview.length > 0 && (
            <div className="mb-12 flex items-center justify-center -space-x-6">
              {galleryPreview.map((image, i) => (
                <div
                  key={image.id}
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${6 + i}s`,
                  }}
                  className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-full border-4 border-background shadow-xl transition-transform duration-500 ease-out-expo hover:z-10 hover:scale-110 motion-safe:animate-float sm:w-40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt}
                    style={{
                      objectPosition: `${image.focalX}% ${image.focalY}%`,
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <Link
            href="/gallery"
            className="rounded-lg border px-6 py-2 text-sm font-medium transition duration-300 ease-out-expo hover:scale-[1.03] hover:bg-muted"
          >
            View Gallery →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
