import Link from "next/link";
import { getSessionUser } from "@/lib/site-auth/session";
import { GatedNavLink } from "@/components/site-auth/gated-nav-link";

export async function Footer() {
  const user = await getSessionUser();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold">My Ultimate Worship</p>
            <p className="text-sm text-muted-foreground">
              Carrying the sound of heaven to the nations.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Ministry</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <GatedNavLink
                  href="/tiers"
                  isAuthenticated={!!user}
                  className="transition hover:text-foreground"
                >
                  Partnership Tiers
                </GatedNavLink>
              </li>
              <li>
                <GatedNavLink
                  href="/testimonies"
                  isAuthenticated={!!user}
                  className="transition hover:text-foreground"
                >
                  Testimonies
                </GatedNavLink>
              </li>
              <li>
                <GatedNavLink
                  href="/gallery"
                  isAuthenticated={!!user}
                  className="transition hover:text-foreground"
                >
                  Gallery
                </GatedNavLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Get Involved</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <GatedNavLink
                  href="/partner-form"
                  isAuthenticated={!!user}
                  className="transition hover:text-foreground"
                >
                  Become a Partner
                </GatedNavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} My Ultimate Worship. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
