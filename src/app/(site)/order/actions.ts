"use server";

import { revalidatePath } from "next/cache";
import { OrderError, placeOrder } from "@/lib/data";
import { orderSchema } from "@/lib/validation";

export type PlaceOrderResult =
  | { ok: true; code: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function placeOrderAction(payload: unknown): Promise<PlaceOrderResult> {
  // Honeypot: real people never fill the hidden "company" field.
  if (payload && typeof payload === "object" && (payload as Record<string, unknown>).company) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }

  try {
    const { code } = await placeOrder(parsed.data);
    revalidatePath("/order");
    return { ok: true, code };
  } catch (err) {
    if (err instanceof OrderError) {
      return {
        ok: false,
        error: err.message,
        fieldErrors: err.field ? { [err.field]: err.message } : undefined,
      };
    }
    console.error("placeOrder failed", err);
    return {
      ok: false,
      error: "We couldn't place your order just now. Please try again in a moment.",
    };
  }
}
