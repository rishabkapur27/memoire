// Business rules for the bakehouse. Change these in one place.

export const SITE = {
  name: "Mémoire",
  tagline: "The Art of Making Memories",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  city: "Gurgaon",
  pickupAddress:
    process.env.NEXT_PUBLIC_PICKUP_ADDRESS ?? "Mémoire Bakehouse, Gurgaon, Haryana",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
};

export const RULES = {
  timeZone: "Asia/Kolkata",
  /** Orders for a bake day close at this hour (24h, IST) on the previous day. */
  cutoffHour: 20,
  /** How many days ahead customers can book. */
  daysAhead: 7,
  /** Days the oven rests. 0 = Sunday, 1 = Monday ... */
  closedWeekdays: [1] as number[],
  maxQtyPerItem: 10,
  deliveryFeeInr: 80,
  freeDeliveryOverInr: 999,
  /** Gurgaon pincodes start with 1220. */
  deliveryPincodePattern: /^1220\d{2}$/,
};

export const SLOTS = {
  pickup: ["8 am to 10 am", "10 am to 12 pm", "4 pm to 6 pm"],
  delivery: ["7:30 am to 9:30 am", "5 pm to 7 pm"],
} as const;

export type Fulfilment = keyof typeof SLOTS;

export const ORDER_STATUSES = ["placed", "confirmed", "ready", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Received",
  confirmed: "Confirmed",
  ready: "Ready",
  completed: "Collected",
  cancelled: "Cancelled",
};
