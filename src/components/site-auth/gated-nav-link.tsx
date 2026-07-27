"use client";

import Link from "next/link";
import { useAuthModal } from "./auth-modal-context";

interface GatedNavLinkProps {
  href: string;
  isAuthenticated: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * A nav link to a gated destination (e.g. /give, /my-pledges). If the
 * visitor isn't signed in, clicking it opens the auth modal in place instead
 * of navigating — the page itself still gates server-side as a fallback for
 * direct links, back/forward nav, etc. (see AuthGate).
 */
export function GatedNavLink({
  href,
  isAuthenticated,
  className,
  children,
}: GatedNavLinkProps) {
  const { requestAuth } = useAuthModal();

  if (isAuthenticated) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => requestAuth(href)}
      className={className}
    >
      {children}
    </button>
  );
}
