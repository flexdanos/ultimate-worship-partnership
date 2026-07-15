import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tiers", label: "Partnership Tiers" },
  { href: "/testimonies", label: "Testimonies" },
  { href: "/gallery", label: "Gallery" },
];

export function Navbar() {
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
        </ul>

        <Link
          href="/partner-form"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
        >
          Partner With Us
        </Link>
      </nav>
    </header>
  );
}
