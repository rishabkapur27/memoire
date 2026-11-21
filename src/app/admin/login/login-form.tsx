"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-3 text-left">
      <label className="block text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-line bg-white/70 px-4 py-3 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        />
      </label>
      {state?.error && <p role="alert" className="text-sm text-burgundy">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-burgundy py-3 font-semibold text-cream hover:bg-burgundy-deep disabled:opacity-60"
      >
        {pending ? "Checking..." : "Sign in"}
      </button>
    </form>
  );
}
