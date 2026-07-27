"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthTabs } from "./auth-tabs";

interface AuthModalContextValue {
  /** Opens the sign-in/sign-up modal; on success, navigates to `href`. */
  requestAuth: (href: string) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [intendedHref, setIntendedHref] = useState("/");

  const requestAuth = useCallback((href: string) => {
    setIntendedHref(href);
    setOpen(true);
  }, []);

  function handleSuccess() {
    setOpen(false);
    router.push(intendedHref);
    router.refresh();
  }

  return (
    <AuthModalContext.Provider value={{ requestAuth }}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
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
    </AuthModalContext.Provider>
  );
}
