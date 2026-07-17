import Link from "next/link";

export function Footer() {
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
                <Link href="/tiers" className="transition hover:text-foreground">
                  Partnership Tiers
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonies"
                  className="transition hover:text-foreground"
                >
                  Testimonies
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="transition hover:text-foreground"
                >
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold">Get Involved</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/partner-form"
                  className="transition hover:text-foreground"
                >
                  Become a Partner
                </Link>
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
