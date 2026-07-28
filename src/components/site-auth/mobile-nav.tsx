"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GatedNavLink } from "./gated-nav-link";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({
  links,
  isAuthenticated,
}: {
  links: NavLink[];
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-11 w-11 items-center justify-center rounded-lg border text-foreground transition hover:bg-muted"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/30"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-full z-40 border-b bg-background shadow-lg"
          >
            <ul className="flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <li key={link.href}>
                  {link.href === "/" ? (
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-3 text-base font-medium text-foreground transition hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <GatedNavLink
                      href={link.href}
                      isAuthenticated={isAuthenticated}
                      className="block w-full rounded-lg px-3 py-3 text-left text-base font-medium text-foreground transition hover:bg-muted"
                    >
                      {link.label}
                    </GatedNavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
