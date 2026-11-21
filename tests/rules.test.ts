import { describe, expect, it } from "vitest";
import { addDays, isOrderable, orderableDates, todayIST, weekday } from "../src/lib/dates";
import { deliveryFee, totals } from "../src/lib/pricing";
import { normalisePhone, orderSchema } from "../src/lib/validation";

// 2026-11-21 is a Saturday. 14:30 UTC = 20:00 IST.
const sat7pmIST = new Date("2026-11-21T13:30:00Z");
const sat9pmIST = new Date("2026-11-21T15:30:00Z");

describe("bake day rules", () => {
  it("uses IST, not server time", () => {
    expect(todayIST(new Date("2026-11-21T19:00:00Z"))).toBe("2026-11-22");
  });

  it("allows tomorrow before the 8 pm cutoff", () => {
    expect(orderableDates(sat7pmIST)[0]).toBe("2026-11-22");
  });

  it("closes tomorrow after the cutoff", () => {
    expect(isOrderable("2026-11-22", sat9pmIST)).toBe(false);
    // Monday is closed, so the next day is Tuesday
    expect(orderableDates(sat9pmIST)[0]).toBe("2026-11-24");
  });

  it("skips Mondays and never offers today", () => {
    const dates = orderableDates(sat7pmIST);
    expect(dates).not.toContain("2026-11-21");
    expect(dates.every((d) => weekday(d) !== 1)).toBe(true);
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
});

describe("pricing", () => {
  it("charges delivery under the free threshold only", () => {
    expect(deliveryFee("pickup", 200)).toBe(0);
    expect(deliveryFee("delivery", 500)).toBe(80);
    expect(deliveryFee("delivery", 1200)).toBe(0);
  });

  it("totals lines", () => {
    expect(totals([{ price: 420, quantity: 2 }, { price: 180, quantity: 1 }], "delivery")).toEqual({
      subtotal: 1020,
      fee: 0,
      total: 1020,
    });
  });
});

describe("order validation", () => {
  const base = {
    clientRequestId: "6c2b0a8e-1f7e-4d55-9a1e-2a6f5d8c9b10",
    bakeDate: "2026-11-24",
    fulfilment: "pickup",
    slot: "8 am to 10 am",
    name: "Asha",
    phone: "+91 98765 43210",
    items: [{ productId: 1, quantity: 2 }],
  };

  it("normalises Indian phone numbers", () => {
    expect(normalisePhone("+91 98765-43210")).toBe("9876543210");
    expect(normalisePhone("098765 43210")).toBe("9876543210");
  });

  it("accepts a valid pickup order", () => {
    expect(orderSchema.safeParse(base).success).toBe(true);
  });

  it("requires a Gurgaon pincode for delivery", () => {
    const r = orderSchema.safeParse({ ...base, fulfilment: "delivery", slot: "5 pm to 7 pm", address: "House 12, Sector 45, Gurgaon", pincode: "110001" });
    expect(r.success).toBe(false);
  });

  it("rejects slots that belong to the other fulfilment type", () => {
    expect(orderSchema.safeParse({ ...base, slot: "5 pm to 7 pm" }).success).toBe(false);
  });

  it("rejects bad phones and empty baskets", () => {
    expect(orderSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(orderSchema.safeParse({ ...base, items: [] }).success).toBe(false);
  });
});
