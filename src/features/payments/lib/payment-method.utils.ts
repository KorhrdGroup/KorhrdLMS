import { PAYMENT_METHOD_LABELS } from "@/features/payments/constants";
import type { PaymentMethod } from "@/types/database.types";

export function getPaymentMethodLabel(method: PaymentMethod) {
  return PAYMENT_METHOD_LABELS[method];
}
