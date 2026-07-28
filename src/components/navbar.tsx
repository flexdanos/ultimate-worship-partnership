import Link from "next/link";
import { getSessionUser } from "@/lib/site-auth/session";
import { GatedNavLink } from "@/components/site-auth/gated-nav-link";
import { UserMenu } from "@/components/site-auth/user-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tiers", label: "Partnership Tiers" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/gallery", label: "Gallery" },
];

export async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          My Ultimate Worship
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <GatedNavLink
              href="/give"
              isAuthenticated={!!user}
              className="text-sm text-muted-foreground transition hover:text-foreground"
            >
              Give Now
            </GatedNavLink>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu name={user.name} />
          ) : (
            <GatedNavLink
              href="/give"
              isAuthenticated={false}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Sign In
            </GatedNavLink>
          )}

          <Link
            href="/partner-form"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
          >
            Partner With Us
          </Link>
        </div>
      </nav>
    </header>
  );
}
