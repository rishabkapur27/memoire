import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { type OrderStatus } from "./config";
import { isOrderable } from "./dates";
import { totals } from "./pricing";
import type { OrderInput } from "./validation";

export type Product = {
  id: number;
  slug: string;
  name: string;
  frenchName: string | null;
  description: string;
  priceInr: number;
  weightGrams: number | null;
  dailyCapacity: number;
  isActive: boolean;
  sortOrder: number;
};

export type ProductWithStock = Product & { remaining: number };

export type OrderItem = {
  productId: number;
  productName: string;
  unitPriceInr: number;
  quantity: number;
};

export type Order = {
  id: number;
  code: string;
  bakeDate: string;
  fulfilment: "pickup" | "delivery";
  slot: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  pincode: string | null;
  notes: string | null;
  subtotalInr: number;
  deliveryFeeInr: number;
  totalInr: number;
  status: OrderStatus;
  createdAt: Date;
  items: OrderItem[];
};

const productColumns = `
  id, slug, name, french_name as "frenchName", description, price_inr as "priceInr",
  weight_grams as "weightGrams", daily_capacity as "dailyCapacity",
  is_active as "isActive", sort_order as "sortOrder"`;

export async function listProducts(opts: { includeInactive?: boolean } = {}): Promise<Product[]> {
  const sql = db();
  const rows = await sql.unsafe<Product[]>(
    `select ${productColumns} from products
     ${opts.includeInactive ? "" : "where is_active"}
     order by sort_order, id`,
  );
  return rows;
}

/** Active products with what is left to book for a bake day. */
export async function productsWithStock(bakeDate: string): Promise<ProductWithStock[]> {
  const sql = db();
  const rows = await sql<(Product & { booked: number })[]>`
    select p.id, p.slug, p.name, p.french_name as "frenchName", p.description,
           p.price_inr as "priceInr", p.weight_grams as "weightGrams",
           p.daily_capacity as "dailyCapacity", p.is_active as "isActive",
           p.sort_order as "sortOrder",
           coalesce(sum(oi.quantity) filter (where o.id is not null), 0)::int as booked
    from products p
    left join order_items oi on oi.product_id = p.id
    left join orders o on o.id = oi.order_id
      and o.bake_date = ${bakeDate} and o.status <> 'cancelled'
    where p.is_active
    group by p.id
    order by p.sort_order, p.id`;
  return rows.map(({ booked, ...p }) => ({ ...p, remaining: Math.max(0, p.dailyCapacity - booked) }));
}

export class OrderError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function newOrderCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return `M-${out}`;
}

/**
 * Places an order atomically. Product rows are locked so two customers
 * can't book the last loaf at the same time. Retries with the same
 * clientRequestId return the original order instead of a duplicate.
 */
export async function placeOrder(input: OrderInput): Promise<{ code: string }> {
  if (!isOrderable(input.bakeDate)) {
    throw new OrderError("Orders for that day have closed. Please pick another day.", "bakeDate");
  }
  const sql = db();

  const existing = await sql<{ code: string }[]>`
    select code from orders where client_request_id = ${input.clientRequestId}`;
  if (existing.length) return { code: existing[0].code };

  const ids = input.items.map((i) => i.productId);

  return sql.begin(async (tx) => {
    const products = await tx<{ id: number; name: string; priceInr: number; dailyCapacity: number; isActive: boolean }[]>`
      select id, name, price_inr as "priceInr", daily_capacity as "dailyCapacity", is_active as "isActive"
      from products where id = any(${ids}::int[])
      order by id
      for update`;

    if (products.length !== ids.length || products.some((p) => !p.isActive)) {
      throw new OrderError("One of the breads in your basket is no longer available.", "items");
    }

    const bookedRows = await tx<{ productId: number; booked: number }[]>`
      select oi.product_id as "productId", sum(oi.quantity)::int as booked
      from order_items oi join orders o on o.id = oi.order_id
      where o.bake_date = ${input.bakeDate} and o.status <> 'cancelled'
        and oi.product_id = any(${ids}::int[])
      group by oi.product_id`;
    const booked = new Map(bookedRows.map((r) => [r.productId, r.booked]));

    const lines = input.items.map((item) => {
      const p = products.find((x) => x.id === item.productId)!;
      const remaining = p.dailyCapacity - (booked.get(p.id) ?? 0);
      if (item.quantity > remaining) {
        throw new OrderError(
          remaining > 0
            ? `Only ${remaining} ${p.name} left for that day. Please lower the quantity.`
            : `${p.name} just sold out for that day.`,
          "items",
        );
      }
      return { ...item, name: p.name, price: p.priceInr };
    });

    const { subtotal, fee, total } = totals(lines, input.fulfilment);
    const code = newOrderCode();

    const [order] = await tx<{ id: number }[]>`
      insert into orders (code, client_request_id, bake_date, fulfilment, slot,
        customer_name, customer_phone, customer_email, address, pincode, notes,
        subtotal_inr, delivery_fee_inr, total_inr)
      values (${code}, ${input.clientRequestId}, ${input.bakeDate}, ${input.fulfilment}, ${input.slot},
        ${input.name}, ${input.phone}, ${input.email ?? null},
        ${input.fulfilment === "delivery" ? (input.address ?? null) : null},
        ${input.fulfilment === "delivery" ? (input.pincode ?? null) : null},
        ${input.notes || null}, ${subtotal}, ${fee}, ${total})
      returning id`;

    for (const l of lines) {
      await tx`
        insert into order_items (order_id, product_id, product_name, unit_price_inr, quantity)
        values (${order.id}, ${l.productId}, ${l.name}, ${l.price}, ${l.quantity})`;
    }
    return { code };
  });
}

const orderColumns = `
  o.id::int as id, o.code, to_char(o.bake_date, 'YYYY-MM-DD') as "bakeDate", o.fulfilment, o.slot,
  o.customer_name as "customerName", o.customer_phone as "customerPhone",
  o.customer_email as "customerEmail", o.address, o.pincode, o.notes,
  o.subtotal_inr as "subtotalInr", o.delivery_fee_inr as "deliveryFeeInr",
  o.total_inr as "totalInr", o.status, o.created_at as "createdAt",
  coalesce(json_agg(json_build_object(
    'productId', oi.product_id, 'productName', oi.product_name,
    'unitPriceInr', oi.unit_price_inr, 'quantity', oi.quantity
  ) order by oi.id) filter (where oi.id is not null), '[]') as items`;

export async function getOrderByCode(code: string): Promise<Order | null> {
  if (!/^M-[A-Z2-9]{8}$/.test(code)) return null;
  const sql = db();
  const rows = await sql.unsafe<Order[]>(
    `select ${orderColumns} from orders o
     left join order_items oi on oi.order_id = o.id
     where o.code = $1 group by o.id`,
    [code],
  );
  return rows[0] ?? null;
}

export async function ordersForDate(bakeDate: string): Promise<Order[]> {
  const sql = db();
  return sql.unsafe<Order[]>(
    `select ${orderColumns} from orders o
     left join order_items oi on oi.order_id = o.id
     where o.bake_date = $1 group by o.id
     order by (o.status = 'cancelled'), o.fulfilment, o.slot, o.created_at`,
    [bakeDate],
  );
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  const sql = db();
  await sql`update orders set status = ${status}, updated_at = now() where id = ${id}`;
}

export async function updateProduct(
  id: number,
  fields: { priceInr: number; dailyCapacity: number; isActive: boolean },
): Promise<void> {
  const sql = db();
  await sql`
    update products set price_inr = ${fields.priceInr}, daily_capacity = ${fields.dailyCapacity},
      is_active = ${fields.isActive}
    where id = ${id}`;
}

/** Upcoming bake days that have orders, with counts, for the admin date picker. */
export async function upcomingOrderDays(fromDate: string) {
  const sql = db();
  return sql<{ bakeDate: string; orders: number; revenue: number }[]>`
    select to_char(bake_date, 'YYYY-MM-DD') as "bakeDate", count(*)::int as orders,
           coalesce(sum(total_inr), 0)::int as revenue
    from orders where bake_date >= ${fromDate} and status <> 'cancelled'
    group by bake_date order by bake_date limit 14`;
}
