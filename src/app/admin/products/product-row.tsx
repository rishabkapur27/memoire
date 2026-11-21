"use client";

import { useActionState } from "react";
import { saveProductAction } from "../actions";
import type { Product } from "@/lib/data";

const field =
  "mt-1 w-28 rounded-lg border border-line bg-white/70 px-3 py-2 tabular-nums focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

export function ProductRow({ product: p }: { product: Product }) {
  const [state, action, pending] = useActionState(saveProductAction, undefined);
  return (
    <li className={`rounded-2xl border border-line bg-linen p-5 ${p.isActive ? "" : "opacity-70"}`}>
      <form action={action} className="flex flex-wrap items-end gap-5">
        <input type="hidden" name="id" value={p.id} />
        <div className="min-w-48 flex-1">
          <p className="font-display text-sm italic text-gold">{p.frenchName}</p>
          <p className="font-display text-xl font-semibold">{p.name}</p>
        </div>
        <label className="text-xs font-semibold text-muted">
          Price (₹)
          <input name="priceInr" type="number" min={1} defaultValue={p.priceInr} className={field} required />
        </label>
        <label className="text-xs font-semibold text-muted">
          Per day
          <input name="dailyCapacity" type="number" min={0} defaultValue={p.dailyCapacity} className={field} required />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <input name="isActive" type="checkbox" defaultChecked={p.isActive} className="h-4 w-4 accent-burgundy" />
          On menu
        </label>
        <button
          disabled={pending}
          className="rounded-full bg-burgundy px-5 py-2 text-sm font-semibold text-cream hover:bg-burgundy-deep disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <span className="w-16 pb-2 text-sm" aria-live="polite">
          {state?.ok && <span className="text-ok">Saved</span>}
          {state?.error && <span className="text-burgundy">{state.error}</span>}
        </span>
      </form>
    </li>
  );
}
