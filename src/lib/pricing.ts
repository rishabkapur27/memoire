import { RULES, type Fulfilment } from "./config";

export function deliveryFee(fulfilment: Fulfilment, subtotal: number): number {
  if (fulfilment !== "delivery") return 0;
  return subtotal > RULES.freeDeliveryOverInr ? 0 : RULES.deliveryFeeInr;
}

export function totals(
  lines: { price: number; quantity: number }[],
  fulfilment: Fulfilment,
) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const fee = deliveryFee(fulfilment, subtotal);
  return { subtotal, fee, total: subtotal + fee };
}
