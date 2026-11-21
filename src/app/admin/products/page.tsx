import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/data";
import { AdminShell } from "../admin-shell";
import { ProductRow } from "./product-row";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Menu", robots: { index: false } };

export default async function AdminProducts() {
  await requireAdmin();
  const products = await listProducts({ includeInactive: true });
  return (
    <AdminShell active="products">
      <h1 className="font-display text-4xl text-burgundy">Menu and daily capacity</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Capacity is how many of each bread you will bake per day. Customers can only book what is left. Hide a
        bread to take it off the order page without losing its history.
      </p>
      <ul className="mt-8 space-y-3">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </ul>
    </AdminShell>
  );
}
