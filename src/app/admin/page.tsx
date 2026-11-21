import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABEL, type OrderStatus } from "@/lib/config";
import { listProducts, ordersForDate, upcomingOrderDays, type Order } from "@/lib/data";
import { addDays, formatDate, formatINR, isValidIsoDate, todayIST } from "@/lib/dates";
import { AdminShell } from "./admin-shell";
import { setStatusAction } from "./actions";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  placed: { status: "confirmed", label: "Confirm" },
  confirmed: { status: "ready", label: "Mark ready" },
  ready: { status: "completed", label: "Mark collected" },
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  placed: "bg-gold/15 text-gold",
  confirmed: "bg-burgundy/10 text-burgundy",
  ready: "bg-ok/10 text-ok",
  completed: "bg-line text-muted",
  cancelled: "bg-line text-muted line-through",
};

function bakeSheet(orders: Order[]) {
  const map = new Map<number, { name: string; pickup: number; delivery: number }>();
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const i of o.items) {
      const row = map.get(i.productId) ?? { name: i.productName, pickup: 0, delivery: 0 };
      row[o.fulfilment] += i.quantity;
      map.set(i.productId, row);
    }
  }
  return map;
}

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await requireAdmin();
  const { date } = await searchParams;
  const today = todayIST();
  const selected = date && isValidIsoDate(date) ? date : addDays(today, 1);

  const [orders, upcoming, products] = await Promise.all([
    ordersForDate(selected),
    upcomingOrderDays(today),
    listProducts({ includeInactive: true }),
  ]);

  const live = orders.filter((o) => o.status !== "cancelled");
  const sheet = bakeSheet(orders);
  const loaves = [...sheet.values()].reduce((s, r) => s + r.pickup + r.delivery, 0);
  const revenue = live.reduce((s, o) => s + o.totalInr, 0);
  const quickDays = [0, 1, 2].map((d) => addDays(today, d));

  return (
    <AdminShell active="orders">
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Bake day</p>
          <h1 className="mt-1 font-display text-4xl text-burgundy">{formatDate(selected)}</h1>
        </div>
        <form className="flex items-center gap-2" action="/admin">
          {quickDays.map((d, i) => (
            <Link
              key={d}
              href={`/admin?date=${d}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                d === selected ? "border-burgundy bg-burgundy text-cream" : "border-line bg-linen hover:border-burgundy/50"
              }`}
            >
              {["Today", "Tomorrow", "Day after"][i]}
            </Link>
          ))}
          <label className="sr-only" htmlFor="date">Pick date</label>
          <input id="date" type="date" name="date" defaultValue={selected} className="rounded-full border border-line bg-linen px-3 py-1.5 text-sm" />
          <button className="rounded-full bg-ink px-3 py-1.5 text-sm font-semibold text-cream">Go</button>
        </form>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 text-xs print:hidden">
          <span className="py-1 text-muted">Upcoming:</span>
          {upcoming.map((u) => (
            <Link key={u.bakeDate} href={`/admin?date=${u.bakeDate}`} className="rounded-full bg-parchment px-3 py-1 font-semibold text-ink hover:bg-line">
              {formatDate(u.bakeDate, "short")} · {u.orders} order{u.orders === 1 ? "" : "s"}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3 print:hidden">
        {[
          ["Orders", String(live.length)],
          ["Items to bake", String(loaves)],
          ["Expected revenue", formatINR(revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-linen p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-4xl font-semibold text-ink tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">
            Bake sheet <span className="hidden print:inline">· {formatDate(selected)}</span>
          </h2>
          <PrintButton />
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white/70">
          <table className="w-full text-sm">
            <thead className="bg-parchment/70 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Bread</th>
                <th className="px-4 py-3 text-right">Pickup</th>
                <th className="px-4 py-3 text-right">Delivery</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.filter((p) => p.isActive || sheet.has(p.id)).map((p) => {
                const r = sheet.get(p.id) ?? { pickup: 0, delivery: 0 };
                const total = r.pickup + r.delivery;
                return (
                  <tr key={p.id} className={total === 0 ? "text-muted" : ""}>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.pickup}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.delivery}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums">{total}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {total}/{p.dailyCapacity}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 print:hidden">
        <h2 className="font-display text-2xl text-ink">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-line p-10 text-center text-muted">
            No orders for this day yet.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {orders.map((o) => {
              const next = NEXT[o.status];
              return (
                <li key={o.id} className="rounded-2xl border border-line bg-linen p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{o.customerName}</p>
                      <p className="text-sm text-muted">
                        <a href={`tel:+91${o.customerPhone}`} className="hover:text-burgundy">+91 {o.customerPhone}</a> ·{" "}
                        <span className="font-mono">{o.code}</span>
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold capitalize">{o.fulfilment}</span> · {o.slot}
                  </p>
                  {o.fulfilment === "delivery" && (
                    <p className="text-sm text-muted">{o.address}, {o.pincode}</p>
                  )}
                  <ul className="mt-3 text-sm">
                    {o.items.map((i) => (
                      <li key={i.productId}>
                        {i.quantity} × {i.productName}
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="mt-2 rounded-lg bg-parchment px-3 py-2 text-sm italic">“{o.notes}”</p>}
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
                    <span className="font-bold tabular-nums">{formatINR(o.totalInr)}</span>
                    <div className="flex gap-2">
                      {o.status !== "cancelled" && o.status !== "completed" && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-burgundy">Cancel</button>
                        </form>
                      )}
                      {o.status === "cancelled" && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value="placed" />
                          <button className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-burgundy">Restore</button>
                        </form>
                      )}
                      {next && (
                        <form action={setStatusAction}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="status" value={next.status} />
                          <button className="rounded-full bg-burgundy px-4 py-1.5 text-sm font-semibold text-cream hover:bg-burgundy-deep">
                            {next.label}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
