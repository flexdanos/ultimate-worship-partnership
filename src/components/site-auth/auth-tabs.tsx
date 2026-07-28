"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  signUpSchema,
  signInSchema,
  type SignUpValues,
  type SignInValues,
} from "@/lib/site-auth/schemas";

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

interface AuthTabsProps {
  defaultTab?: "sign-in" | "sign-up";
  onSuccess: () => void;
}

export function AuthTabs({ defaultTab = "sign-up", onSuccess }: AuthTabsProps) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <Tabs.List className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <Tabs.Trigger
          value="sign-up"
          className="rounded-md py-2 text-sm font-medium text-muted-foreground transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Sign Up
        </Tabs.Trigger>
        <Tabs.Trigger
          value="sign-in"
          className="rounded-md py-2 text-sm font-medium text-muted-foreground transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        >
          Sign In
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="sign-up">
        <SignUpForm onSuccess={onSuccess} />
      </Tabs.Content>
      <Tabs.Content value="sign-in">
        <SignInForm onSuccess={onSuccess} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(data: SignUpValues) {
    setError(null);
    const res = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input {...register("name")} className={inputClass} placeholder="Jane Doe" />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          type="email"
          className={inputClass}
          placeholder="jane@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input {...register("password")} type="password" className={inputClass} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(data: SignInValues) {
    setError(null);
    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Something went wrong");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          type="email"
          className={inputClass}
          placeholder="jane@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input {...register("password")} type="password" className={inputClass} />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-slate-900 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
