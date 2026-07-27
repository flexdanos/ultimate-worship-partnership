"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { AuthTabs } from "./auth-tabs";

/**
 * Server-side fallback gate: rendered by a protected page (e.g. /give,
 * /my-pledges) instead of its real content when there's no valid session.
 * Covers direct link visits, back/forward nav, and JS-disabled first paint
 * — the AuthModalProvider/GatedNavLink pair only covers in-app nav clicks.
 */
export function AuthGate() {
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) router.push("/");
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-lg">
          <Dialog.Title className="mb-1 text-lg font-bold">
            Sign in to continue
          </Dialog.Title>
          <Dialog.Description className="mb-6 text-sm text-muted-foreground">
            Create a free account or sign in to give and track your pledges.
          </Dialog.Description>
          <AuthTabs onSuccess={handleSuccess} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
