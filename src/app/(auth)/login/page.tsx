"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Hexagon } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="size-12 rounded-xl bg-moto-cyan/10 border border-moto-cyan/20 flex items-center justify-center">
            <Hexagon className="size-6 text-moto-cyan" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold tracking-widest uppercase text-foreground">
              MotoManipal
            </h1>
            <p className="text-[0.65rem] font-mono tracking-widest uppercase text-muted-foreground/60 mt-1">
              Engineering Workspace
            </p>
          </div>
        </div>

        {/* Login form — precision instrument panel */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="operator@motomanipal.com"
              className="h-9 w-full rounded-md border border-border/60 bg-input/40 px-3 text-sm transition-all duration-150 outline-none placeholder:text-muted-foreground/60 focus-visible:border-moto-cyan/40 focus-visible:bg-input/60 focus-visible:ring-1 focus-visible:ring-moto-cyan/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[0.65rem] font-semibold tracking-wider uppercase text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Access code"
              className="h-9 w-full rounded-md border border-border/60 bg-input/40 px-3 text-sm transition-all duration-150 outline-none placeholder:text-muted-foreground/60 focus-visible:border-moto-cyan/40 focus-visible:bg-input/60 focus-visible:ring-1 focus-visible:ring-moto-cyan/20"
            />
          </div>

          {state?.error && (
            <p className="text-xs text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="h-9 w-full rounded-md bg-moto-cyan text-background text-sm font-medium shadow-[0_1px_2px_oklch(0_0_0/0.4),inset_0_1px_0_oklch(1_0_0/0.1)] hover:bg-moto-cyan/90 transition-colors duration-150 active:translate-y-px disabled:opacity-50"
          >
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[0.55rem] font-mono tracking-widest uppercase text-muted-foreground/50">
            Restricted Access — Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
