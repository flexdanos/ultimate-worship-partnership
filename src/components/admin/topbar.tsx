"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { navItems, isNavItemActive } from "./nav-items";

export function AdminTopbar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const current = navItems.find((item) => isNavItemActive(pathname, item.href));

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="hidden h-16 shrink-0 items-center justify-between border-b bg-card px-6 lg:flex">
      <p className="text-sm font-semibold">{current?.label ?? "Admin"}</p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {email.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm text-muted-foreground">{email}</span>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </header>
  );
}
