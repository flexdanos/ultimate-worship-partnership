"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function UserMenu({ name }: { name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/");
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-900">
            {name.charAt(0).toUpperCase()}
          </span>
          {name.split(" ")[0]}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[10rem] rounded-lg border bg-background p-1 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/my-pledges"
              className="block cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-muted"
            >
              My Pledges
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={handleSignOut}
            disabled={isPending}
            className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-muted"
          >
            {isPending ? "Signing out…" : "Sign Out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
