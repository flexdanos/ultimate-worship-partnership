"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { navItems, isNavItemActive } from "./nav-items";

export function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  function renderSidebarNav() {
    return (
      <>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
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

        <div className="border-t border-slate-800 px-3 py-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <span>→</span>
            Sign Out
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white lg:hidden">
        <p className="text-sm font-bold leading-tight">My Ultimate Worship</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-white transition hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col bg-slate-950 text-white lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <p className="text-sm font-bold leading-tight">
                  My Ultimate Worship
                </p>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarNav()}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-slate-950 text-white lg:flex">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-sm font-bold leading-tight">My Ultimate Worship</p>
          <p className="text-xs text-slate-400">Admin Portal</p>
        </div>
        {renderSidebarNav()}
      </aside>
    </>
  );
}
