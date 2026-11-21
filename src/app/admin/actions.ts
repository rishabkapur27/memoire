"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/config";
import { updateOrderStatus, updateProduct } from "@/lib/data";

export async function loginAction(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That password isn't right." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(ORDER_STATUSES),
});

export async function setStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await updateOrderStatus(parsed.data.id, parsed.data.status);
  revalidatePath("/admin");
}

const productSchema = z.object({
  id: z.coerce.number().int().positive(),
  priceInr: z.coerce.number().int().min(1).max(100000),
  dailyCapacity: z.coerce.number().int().min(0).max(1000),
  isActive: z.string().optional(),
});

export async function saveProductAction(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData,
) {
  await requireAdmin();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Check the price and capacity values." };
  await updateProduct(parsed.data.id, {
    priceInr: parsed.data.priceInr,
    dailyCapacity: parsed.data.dailyCapacity,
    isActive: parsed.data.isActive === "on",
  });
  revalidatePath("/admin/products");
  revalidatePath("/order");
  revalidatePath("/");
  return { ok: true };
}
