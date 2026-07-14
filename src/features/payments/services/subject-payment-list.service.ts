import { SUBJECT_PAYMENT_LIST_SELECT } from "@/features/payments/constants";
import { resolveQuickPeriodRange } from "@/features/payments/lib/subject-payment-list-query";
import type {
  SubjectPaymentListItem,
  SubjectPaymentListQuery,
} from "@/features/payments/types/subject-payment.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type { CoursePaymentStatus, PaymentMethod } from "@/types/database.types";

type SubjectPaymentListRow = {
  id: string;
  payment_date: string;
  coupon_number: string | null;
  assigned_instructor: string | null;
  amount: number;
  payment_method: PaymentMethod;
  coupon_applied: boolean;
  status: CoursePaymentStatus;
  pg_provider: string | null;
  pg_order_id: string | null;
  enrollment_id: string | null;
  created_at: string;
  member: {
    id: string;
    name: string;
    login_id: string;
    deleted_at: string | null;
  };
  course: {
    id: string;
    name: string;
    deleted_at: string | null;
  };
};

function mapSubjectPaymentListItem(row: SubjectPaymentListRow): SubjectPaymentListItem {
  return {
    id: row.id,
    paymentDate: row.payment_date,
    memberName: row.member.name,
    memberLoginId: row.member.login_id,
    couponNumber: row.coupon_number,
    courseName: row.course.name,
    assignedInstructor: row.assigned_instructor,
    amount: row.amount,
    paymentMethod: row.payment_method,
    couponApplied: row.coupon_applied,
    status: row.status,
    pgProvider: row.pg_provider,
    pgOrderId: row.pg_order_id,
    enrollmentId: row.enrollment_id,
    createdAt: row.created_at,
  };
}

function getEffectiveDateRange(query: SubjectPaymentListQuery) {
  if (query.startDate || query.endDate) {
    return {
      startDate: query.startDate,
      endDate: query.endDate,
    };
  }

  if (query.quickPeriod) {
    return resolveQuickPeriodRange(query.quickPeriod);
  }

  return { startDate: "", endDate: "" };
}

export async function getSubjectPaymentList(
  query: SubjectPaymentListQuery,
): Promise<PaginatedResult<SubjectPaymentListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);
  const { startDate, endDate } = getEffectiveDateRange(query);

  let builder = supabase
    .from("course_payments")
    .select(SUBJECT_PAYMENT_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .is("member.deleted_at", null)
    .is("course.deleted_at", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (query.paymentMethod) {
    builder = builder.eq("payment_method", query.paymentMethod);
  }

  if (query.status) {
    builder = builder.eq("status", query.status);
  }

  if (startDate) {
    builder = builder.gte("payment_date", startDate);
  }

  if (endDate) {
    builder = builder.lte("payment_date", endDate);
  }

  if (query.memberName) {
    const keyword = `%${query.memberName}%`;
    builder = builder.or(
      `member.name.ilike.${keyword},member.login_id.ilike.${keyword}`,
    );
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as SubjectPaymentListRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapSubjectPaymentListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}
