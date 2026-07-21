"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◈" },
  { href: "/admin/partners", label: "Partners", icon: "👥" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "💳" },
  {
    href: "/admin/testimonies-moderation",
    label: "Testimonies",
    icon: "💬",
  },
  { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-slate-950 text-white">
      {/* Logo */}
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-sm font-bold leading-tight">My Ultimate Worship</p>
        <p className="text-xs text-slate-400">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-amber-500 text-slate-900 font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="border-t border-slate-800 px-3 py-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <span>→</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
