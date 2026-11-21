import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FleurDeLis } from "@/components/brand";
import { SITE, STATUS_LABEL, type OrderStatus } from "@/lib/config";
import { getOrderByCode } from "@/lib/data";
import { formatDate, formatINR } from "@/lib/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const FLOW: OrderStatus[] = ["placed", "confirmed", "ready", "completed"];

function maskPhone(p: string) {
  return `${p.slice(0, 2)}XXXXXX${p.slice(-2)}`;
}

export default async function OrderStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { code } = await params;
  const { new: isNew } = await searchParams;
  const order = await getOrderByCode(decodeURIComponent(code).toUpperCase());
  if (!order) notFound();

  const cancelled = order.status === "cancelled";
  const step = FLOW.indexOf(order.status);
  const firstName = order.customerName.split(" ")[0];

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <div className="text-center">
        <FleurDeLis className="mx-auto h-10 w-10 text-burgundy" />
        <h1 className="mt-4 font-display text-4xl text-burgundy sm:text-5xl">
          {isNew ? `Merci, ${firstName}.` : `Order ${order.code}`}
        </h1>
        <p className="mt-3 text-muted">
          {isNew
            ? "Your bread is reserved. Keep this page handy, or note your order code."
            : `Reserved for ${formatDate(order.bakeDate)}.`}
        </p>
        {isNew && (
          <p className="mt-5 inline-block rounded-full border border-dashed border-burgundy/50 bg-linen px-5 py-2 font-mono text-lg font-semibold tracking-widest text-burgundy">
            {order.code}
          </p>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-line bg-linen p-6 sm:p-8">
        {cancelled ? (
          <p className="rounded-xl bg-burgundy/10 px-4 py-3 text-center font-semibold text-burgundy">
            This order was cancelled.
          </p>
        ) : (
          <ol className="grid grid-cols-4 gap-2 text-center text-xs font-semibold" aria-label="Order progress">
            {FLOW.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-2">
                <span
                  className={`h-2 w-full rounded-full ${i <= step ? "bg-burgundy" : "bg-line"}`}
                  aria-hidden="true"
                />
                <span className={i <= step ? "text-burgundy" : "text-muted"}>
                  {s === "completed" && order.fulfilment === "delivery" ? "Delivered" : STATUS_LABEL[s]}
                </span>
              </li>
            ))}
          </ol>
        )}

        <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Bake day</dt>
            <dd className="mt-1 font-semibold">{formatDate(order.bakeDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">{order.fulfilment === "pickup" ? "Pickup slot" : "Delivery slot"}</dt>
            <dd className="mt-1 font-semibold">{order.slot}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted">{order.fulfilment === "pickup" ? "Collect from" : "Delivering to"}</dt>
            <dd className="mt-1 font-semibold">
              {order.fulfilment === "pickup" ? SITE.pickupAddress : `${order.address}, ${order.pincode}`}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="mt-1 font-semibold">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-muted">Mobile</dt>
            <dd className="mt-1 font-semibold">{maskPhone(order.customerPhone)}</dd>
          </div>
        </dl>

        <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
          {order.items.map((i) => (
            <li key={i.productId} className="flex justify-between">
              <span>
                {i.quantity} × {i.productName}
              </span>
              <span className="tabular-nums">{formatINR(i.unitPriceInr * i.quantity)}</span>
            </li>
          ))}
          {order.deliveryFeeInr > 0 && (
            <li className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="tabular-nums">{formatINR(order.deliveryFeeInr)}</span>
            </li>
          )}
          <li className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>Total, payable on collection</span>
            <span className="tabular-nums">{formatINR(order.totalInr)}</span>
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/order" className="rounded-full bg-burgundy px-6 py-3 text-sm font-semibold text-cream hover:bg-burgundy-deep">
          Place another order
        </Link>
        {SITE.whatsapp && (
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hi Mémoire, about my order ${order.code}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-burgundy px-6 py-3 text-sm font-semibold text-burgundy hover:bg-burgundy/5"
          >
            Message us on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
