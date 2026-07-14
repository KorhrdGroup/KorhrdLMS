import { SUBJECT_PAYMENT_DETAIL_SELECT } from "@/features/payments/constants";
import type {
  GetSubjectPaymentDetailResult,
  SubjectPaymentDetail,
} from "@/features/payments/types/subject-payment.types";
import { createClient } from "@/lib/supabase/server";
import type { CoursePaymentStatus, PaymentMethod } from "@/types/database.types";

type SubjectPaymentDetailRow = {
  id: string;
  payment_number: string | null;
  product_name: string | null;
  payment_date: string;
  deposit_bank: string | null;
  depositor_name: string | null;
  virtual_account_number: string | null;
  class_start_date: string | null;
  class_end_date: string | null;
  shipping_address: string | null;
  approved_at: string | null;
  canceled_at: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: CoursePaymentStatus;
  memo: string | null;
  pg_provider: string | null;
  pg_order_id: string | null;
  pg_transaction_id: string | null;
  failed_reason: string | null;
  member: {
    id: string;
    name: string;
    login_id: string;
    phone: string | null;
    deleted_at: string | null;
  };
  course: {
    id: string;
    name: string;
    deleted_at: string | null;
  };
};

function buildPaymentNumber(row: SubjectPaymentDetailRow) {
  if (row.payment_number?.trim()) {
    return row.payment_number.trim();
  }

  const datePart = row.payment_date.replace(/-/g, "");
  return `PAY-${datePart}-${row.id.slice(0, 8).toUpperCase()}`;
}

function mapSubjectPaymentDetail(row: SubjectPaymentDetailRow): SubjectPaymentDetail {
  return {
    id: row.id,
    paymentNumber: buildPaymentNumber(row),
    productName: row.product_name?.trim() || row.course.name,
    paymentDate: row.payment_date,
    memberName: row.member.name,
    memberLoginId: row.member.login_id,
    memberPhone: row.member.phone,
    depositBank: row.deposit_bank,
    depositorName: row.depositor_name,
    virtualAccountNumber: row.virtual_account_number,
    classPeriodStart: row.class_start_date,
    classPeriodEnd: row.class_end_date,
    shippingAddress: row.shipping_address,
    approvedAt: row.approved_at,
    canceledAt: row.canceled_at,
    amount: row.amount,
    paymentMethod: row.payment_method,
    status: row.status,
    memo: row.memo,
    pgProvider: row.pg_provider,
    pgOrderId: row.pg_order_id,
    pgTransactionId: row.pg_transaction_id,
    failedReason: row.failed_reason,
  };
}

export async function getSubjectPaymentDetail(
  paymentId: string,
): Promise<GetSubjectPaymentDetailResult> {
  if (!paymentId.trim()) {
    return { success: false, message: "결제 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_payments")
    .select(SUBJECT_PAYMENT_DETAIL_SELECT)
    .eq("id", paymentId)
    .is("deleted_at", null)
    .is("member.deleted_at", null)
    .is("course.deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "결제 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    payment: mapSubjectPaymentDetail(data as SubjectPaymentDetailRow),
  };
}
