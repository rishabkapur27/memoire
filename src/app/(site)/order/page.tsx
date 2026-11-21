import type { Metadata } from "next";
import { OrderForm } from "./order-form";
import { RULES, SLOTS } from "@/lib/config";
import { productsWithStock } from "@/lib/data";
import { formatDate, orderableDates } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pre-order Bread",
  description:
    "Reserve sourdough, baguettes and brioche from Mémoire for pickup or delivery in Gurgaon. Orders close at 8 pm the evening before.",
  alternates: { canonical: "/order" },
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const dates = orderableDates();
  const selected = date && dates.includes(date) ? date : dates[0];
  const products = await productsWithStock(selected);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Pré-commande</p>
      <h1 className="mt-2 font-display text-4xl text-burgundy sm:text-5xl">Reserve your bread</h1>
      <p className="mt-3 max-w-xl text-muted">
        Choose a bake day, pick your loaves and tell us how you would like to collect them. Orders close at{" "}
        {RULES.cutoffHour % 12} pm the evening before.
      </p>

      <OrderForm
        dates={dates.map((d) => ({ value: d, label: formatDate(d, "short") }))}
        selectedDate={selected}
        selectedDateLabel={formatDate(selected)}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          frenchName: p.frenchName,
          priceInr: p.priceInr,
          remaining: p.remaining,
          weightGrams: p.weightGrams,
        }))}
        slots={{ pickup: [...SLOTS.pickup], delivery: [...SLOTS.delivery] }}
        rules={{
          maxQty: RULES.maxQtyPerItem,
          deliveryFee: RULES.deliveryFeeInr,
          freeOver: RULES.freeDeliveryOverInr,
        }}
      />
    </div>
  );
}
