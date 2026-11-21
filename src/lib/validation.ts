import { z } from "zod";
import { RULES, SLOTS } from "./config";
import { isValidIsoDate } from "./dates";

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

const trimmed = (max: number) => z.string().trim().max(max);

export const orderSchema = z
  .object({
    clientRequestId: z.string().uuid({ message: "Please refresh the page and try again." }),
    bakeDate: z.string().refine(isValidIsoDate, "Choose a bake day."),
    fulfilment: z.enum(["pickup", "delivery"]),
    slot: z.string().min(1, "Choose a time slot."),
    name: trimmed(80).min(2, "Please tell us your name."),
    phone: z
      .string()
      .transform(normalisePhone)
      .refine((v) => /^[6-9]\d{9}$/.test(v), "Enter a valid 10 digit Indian mobile number."),
    email: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || z.string().email().safeParse(v).success, "That email looks off."),
    address: trimmed(300).optional(),
    pincode: trimmed(6).optional(),
    notes: trimmed(300).optional(),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(RULES.maxQtyPerItem),
        }),
      )
      .min(1, "Add at least one loaf to your basket.")
      .max(20),
  })
  .superRefine((o, ctx) => {
    const slots: readonly string[] = SLOTS[o.fulfilment];
    if (!slots.includes(o.slot)) {
      ctx.addIssue({ code: "custom", path: ["slot"], message: "Choose a time slot." });
    }
    if (o.fulfilment === "delivery") {
      if (!o.address || o.address.length < 10) {
        ctx.addIssue({ code: "custom", path: ["address"], message: "Add your full delivery address." });
      }
      if (!o.pincode || !RULES.deliveryPincodePattern.test(o.pincode)) {
        ctx.addIssue({
          code: "custom",
          path: ["pincode"],
          message: "We deliver within Gurgaon only (pincodes starting 1220).",
        });
      }
    }
    const ids = o.items.map((i) => i.productId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", path: ["items"], message: "Duplicate items in basket." });
    }
  });

export type OrderInput = z.infer<typeof orderSchema>;
