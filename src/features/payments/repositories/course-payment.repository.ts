import { createClient } from "@/lib/supabase/server";
import type { CoursePaymentStatus, Database, PaymentMethod } from "@/types/database.types";

/**
 * `course_payments`를 다루는 저장소 레이어입니다. PG(결제대행사) 연동 전까지는
 * `PaymentService`(services/payment.service.ts)에서만 이 저장소를 사용하고,
 * 학생/관리자 화면은 Server Action → Service → Repository 순서로만 접근합니다.
 */
export type CoursePaymentRecord = {
  id: string;
  memberId: string;
  courseId: string;
  classId: string | null;
  enrollmentId: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  status: CoursePaymentStatus;
  pgProvider: string | null;
  pgOrderId: string | null;
  pgTransactionId: string | null;
  failedReason: string | null;
  paymentDate: string;
  approvedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
};

const COURSE_PAYMENT_SELECT =
  "id, member_id, course_id, class_id, enrollment_id, amount, payment_method, status, pg_provider, pg_order_id, pg_transaction_id, failed_reason, payment_date, approved_at, canceled_at, created_at";

type CoursePaymentRow = {
  id: string;
  member_id: string;
  course_id: string;
  class_id: string | null;
  enrollment_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: CoursePaymentStatus;
  pg_provider: string | null;
  pg_order_id: string | null;
  pg_transaction_id: string | null;
  failed_reason: string | null;
  payment_date: string;
  approved_at: string | null;
  canceled_at: string | null;
  created_at: string;
};

function toRecord(row: CoursePaymentRow): CoursePaymentRecord {
  return {
    id: row.id,
    memberId: row.member_id,
    courseId: row.course_id,
    classId: row.class_id,
    enrollmentId: row.enrollment_id,
    amount: row.amount,
    paymentMethod: row.payment_method,
    status: row.status,
    pgProvider: row.pg_provider,
    pgOrderId: row.pg_order_id,
    pgTransactionId: row.pg_transaction_id,
    failedReason: row.failed_reason,
    paymentDate: row.payment_date,
    approvedAt: row.approved_at,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
  };
}

/** 회원×과정 기준으로 "진행 중"(ready/pending) 또는 "완료"(paid) 상태인 활성 결제 1건을 찾습니다. */
export async function findActivePayment(
  memberId: string,
  courseId: string,
): Promise<CoursePaymentRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_payments")
    .select(COURSE_PAYMENT_SELECT)
    .eq("member_id", memberId)
    .eq("course_id", courseId)
    .in("status", ["ready", "pending", "paid"])
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toRecord(data as CoursePaymentRow) : null;
}

export async function findPaymentById(paymentId: string): Promise<CoursePaymentRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_payments")
    .select(COURSE_PAYMENT_SELECT)
    .eq("id", paymentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toRecord(data as CoursePaymentRow) : null;
}

export async function insertPayment(
  input: Database["public"]["Tables"]["course_payments"]["Insert"],
): Promise<CoursePaymentRecord> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_payments")
    .insert(input)
    .select(COURSE_PAYMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRecord(data as CoursePaymentRow);
}

export async function updatePayment(
  paymentId: string,
  patch: Database["public"]["Tables"]["course_payments"]["Update"],
): Promise<CoursePaymentRecord> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_payments")
    .update(patch)
    .eq("id", paymentId)
    .select(COURSE_PAYMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toRecord(data as CoursePaymentRow);
}
