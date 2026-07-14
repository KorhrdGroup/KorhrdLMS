"use server";

import { getSubjectPaymentDetail } from "@/features/payments/services/subject-payment-detail.service";
import type { GetSubjectPaymentDetailResult } from "@/features/payments/types/subject-payment.types";

export async function getSubjectPaymentDetailAction(
  paymentId: string,
): Promise<GetSubjectPaymentDetailResult> {
  return getSubjectPaymentDetail(paymentId);
}
