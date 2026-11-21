"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { placeOrderAction } from "./actions";

type ProductRow = {
  id: number;
  name: string;
  frenchName: string | null;
  priceInr: number;
  remaining: number;
  weightGrams: number | null;
};

type Props = {
  dates: { value: string; label: string }[];
  selectedDate: string;
  selectedDateLabel: string;
  products: ProductRow[];
  slots: { pickup: string[]; delivery: string[] };
  rules: { maxQty: number; deliveryFee: number; freeOver: number };
};

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-linen p-6 sm:p-7">
      <h2 className="flex items-center gap-3 font-display text-2xl text-ink">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-burgundy font-sans text-sm font-bold text-cream">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm text-burgundy">
      {msg}
    </p>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";

export function OrderForm({ dates, selectedDate, selectedDateLabel, products, slots, rules }: Props) {
  const router = useRouter();
  const [isSwitching, startSwitch] = useTransition();
  const [isSubmitting, startSubmit] = useTransition();
  const requestId = useRef<string | null>(null);

  const [qty, setQty] = useState<Record<number, number>>({});
  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [slot, setSlot] = useState<string>("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", pincode: "", notes: "", company: "" });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const lines = useMemo(
    () =>
      products
        .map((p) => ({ ...p, quantity: Math.min(qty[p.id] ?? 0, p.remaining) }))
        .filter((l) => l.quantity > 0),
    [products, qty],
  );
  const subtotal = lines.reduce((s, l) => s + l.priceInr * l.quantity, 0);
  const fee = fulfilment === "delivery" && subtotal > 0 && subtotal <= rules.freeOver ? rules.deliveryFee : 0;
  const total = subtotal + fee;
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const allSoldOut = products.length > 0 && products.every((p) => p.remaining === 0);

  function changeQty(p: ProductRow, delta: number) {
    setQty((q) => {
      const cap = Math.min(p.remaining, rules.maxQty);
      const next = Math.max(0, Math.min(cap, (q[p.id] ?? 0) + delta));
      return { ...q, [p.id]: next };
    });
    setFieldErrors((e) => ({ ...e, items: "" }));
  }

  function chooseDate(value: string) {
    if (value === selectedDate) return;
    setError(null);
    startSwitch(() => router.replace(`/order?date=${value}`, { scroll: false }));
  }

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: "" }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    requestId.current ??= crypto.randomUUID();
    const payload = {
      clientRequestId: requestId.current,
      bakeDate: selectedDate,
      fulfilment,
      slot,
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      address: fulfilment === "delivery" ? form.address : undefined,
      pincode: fulfilment === "delivery" ? form.pincode : undefined,
      notes: form.notes || undefined,
      company: form.company,
      items: lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
    };
    startSubmit(async () => {
      try {
        const res = await placeOrderAction(payload);
        if (res.ok) {
          router.push(`/order/${res.code}?new=1`);
          return;
        }
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        if (res.fieldErrors?.items || res.fieldErrors?.bakeDate) router.refresh();
      } catch {
        setError("Connection lost. Please check your internet and try again.");
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Step n={1} title="Choose a bake day">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bake day">
            {dates.map((d) => {
              const active = d.value === selectedDate;
              return (
                <button
                  key={d.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseDate(d.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "border-burgundy bg-burgundy text-cream"
                      : "border-line bg-white/60 text-ink hover:border-burgundy/50"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <FieldError msg={fieldErrors.bakeDate} />
        </Step>

        <Step n={2} title={`Pick your loaves for ${selectedDateLabel}`}>
          {allSoldOut && (
            <p className="mb-4 rounded-xl bg-parchment px-4 py-3 text-sm text-ink">
              Everything is spoken for on this day. Try another bake day above.
            </p>
          )}
          <ul className={`divide-y divide-line transition-opacity ${isSwitching ? "opacity-40" : ""}`} aria-busy={isSwitching}>
            {products.map((p) => {
              const q = Math.min(qty[p.id] ?? 0, p.remaining);
              const soldOut = p.remaining === 0;
              const atCap = q >= Math.min(p.remaining, rules.maxQty);
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-semibold text-ink">{p.name}</p>
                    <p className="text-sm text-muted">
                      {inr(p.priceInr)}
                      {p.weightGrams ? ` · ${p.weightGrams} g` : ""} ·{" "}
                      <span className={soldOut ? "font-semibold text-burgundy" : p.remaining <= 3 ? "font-semibold text-gold" : ""}>
                        {soldOut ? "Sold out" : p.remaining <= 3 ? `Only ${p.remaining} left` : `${p.remaining} available`}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full border border-line bg-white/70 p-1">
                    <button
                      type="button"
                      onClick={() => changeQty(p, -1)}
                      disabled={q === 0}
                      aria-label={`Remove one ${p.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-lg text-burgundy transition hover:bg-parchment disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">
                      {q}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(p, 1)}
                      disabled={soldOut || atCap}
                      aria-label={`Add one ${p.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-burgundy text-lg text-cream transition hover:bg-burgundy-deep disabled:bg-line disabled:text-muted"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          <FieldError msg={fieldErrors.items} />
        </Step>

        <Step n={3} title="Pickup or delivery">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-parchment p-1" role="radiogroup" aria-label="Fulfilment">
            {(["pickup", "delivery"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={fulfilment === f}
                onClick={() => {
                  setFulfilment(f);
                  setSlot("");
                }}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  fulfilment === f ? "bg-linen text-burgundy shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {f === "pickup" ? "Pick up at bakehouse" : "Deliver in Gurgaon"}
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-ink">Time slot</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Time slot">
            {slots[fulfilment].map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={slot === s}
                onClick={() => {
                  setSlot(s);
                  setFieldErrors((e) => ({ ...e, slot: "" }));
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  slot === s ? "border-burgundy bg-burgundy/10 text-burgundy" : "border-line bg-white/60 hover:border-burgundy/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <FieldError msg={fieldErrors.slot} />
          {fulfilment === "delivery" && (
            <p className="mt-4 text-sm text-muted">
              Delivery is {inr(rules.deliveryFee)}, free on orders above {inr(rules.freeOver)}.
            </p>
          )}
        </Step>

        <Step n={4} title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Name
              <input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} autoComplete="name" required aria-invalid={!!fieldErrors.name} />
              <FieldError msg={fieldErrors.name} />
            </label>
            <label className="block text-sm font-semibold">
              Mobile number
              <input className={inputCls} value={form.phone} onChange={(e) => update("phone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="98XXXXXXXX" required aria-invalid={!!fieldErrors.phone} />
              <FieldError msg={fieldErrors.phone} />
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              Email <span className="font-normal text-muted">(optional)</span>
              <input className={inputCls} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" aria-invalid={!!fieldErrors.email} />
              <FieldError msg={fieldErrors.email} />
            </label>
            {fulfilment === "delivery" && (
              <>
                <label className="block text-sm font-semibold sm:col-span-2">
                  Delivery address
                  <textarea className={inputCls} rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} autoComplete="street-address" aria-invalid={!!fieldErrors.address} />
                  <FieldError msg={fieldErrors.address} />
                </label>
                <label className="block text-sm font-semibold">
                  Pincode
                  <input className={inputCls} value={form.pincode} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="postal-code" placeholder="122002" aria-invalid={!!fieldErrors.pincode} />
                  <FieldError msg={fieldErrors.pincode} />
                </label>
              </>
            )}
            <label className="block text-sm font-semibold sm:col-span-2">
              Notes for the baker <span className="font-normal text-muted">(optional)</span>
              <input className={inputCls} value={form.notes} onChange={(e) => update("notes", e.target.value)} maxLength={300} placeholder="Sliced please, extra crusty, gate code..." />
            </label>
            {/* Honeypot for bots */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Company
                <input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => update("company", e.target.value)} />
              </label>
            </div>
          </div>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(78,21,32,0.4)]">
          <h2 className="font-display text-2xl text-burgundy">Your basket</h2>
          <p className="text-sm text-muted">{selectedDateLabel}</p>
          {lines.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No loaves yet. Add some from the list.</p>
          ) : (
            <ul className="mt-5 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-3">
                  <span>
                    {l.quantity} × {l.name}
                  </span>
                  <span className="tabular-nums">{inr(l.priceInr * l.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{inr(subtotal)}</dd>
            </div>
            {fulfilment === "delivery" && (
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="tabular-nums">{fee === 0 && subtotal > 0 ? "Free" : inr(fee)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total</dt>
              <dd className="tabular-nums">{inr(total)}</dd>
            </div>
          </dl>
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-burgundy/10 px-4 py-3 text-sm text-burgundy">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isSwitching || itemCount === 0}
            className="mt-5 w-full rounded-full bg-burgundy px-6 py-3.5 font-semibold text-cream transition hover:bg-burgundy-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Reserving..." : itemCount === 0 ? "Add a loaf to continue" : `Reserve ${itemCount} item${itemCount > 1 ? "s" : ""}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">Pay by UPI or cash on collection.</p>
        </div>
      </aside>
    </form>
  );
}
