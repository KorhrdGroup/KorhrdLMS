import { CERTIFICATE_PREPAYMENT_LIST_SELECT } from "@/features/certificate-prepayments/constants";
import type { CertificatePrepaymentListQuery } from "@/features/certificate-prepayments/lib/certificate-prepayment-list-query";
import type {
  CertificatePrepaymentCourseOption,
  CertificatePrepaymentListItem,
} from "@/features/certificate-prepayments/types/certificate-prepayment.types";
import {
  getPaginationRange,
  getTotalPages,
  type PaginatedResult,
} from "@/lib/shared/list-query";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod, PaymentStatus } from "@/types/database.types";

type CertificatePrepaymentRow = {
  id: string;
  member_id: string;
  course_id: string | null;
  certificate_name: string;
  amount: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  paid_at: string | null;
  used_at: string | null;
  memo: string | null;
  created_at: string;
  member: { name: string; login_id: string; phone: string | null } | null;
  course: { id: string; name: string } | null;
  certificate_application: { id: string; certificate_name: string; applied_at: string } | null;
};

function mapCertificatePrepaymentListItem(
  row: CertificatePrepaymentRow,
): CertificatePrepaymentListItem {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member?.name ?? "—",
    memberLoginId: row.member?.login_id ?? "—",
    memberPhone: row.member?.phone ?? null,
    courseId: row.course_id,
    courseName: row.course?.name ?? null,
    certificateName: row.certificate_name,
    amount: row.amount,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    paidAt: row.paid_at,
    usedAt: row.used_at,
    linkedApplication: row.certificate_application
      ? {
          id: row.certificate_application.id,
          certificateName: row.certificate_application.certificate_name,
          appliedAt: row.certificate_application.applied_at,
        }
      : null,
    memo: row.memo,
    createdAt: row.created_at,
  };
}

export async function getCertificatePrepaymentList(
  query: CertificatePrepaymentListQuery,
): Promise<PaginatedResult<CertificatePrepaymentListItem>> {
  const supabase = await createClient();
  const { from, to } = getPaginationRange(query.page, query.pageSize);

  let builder = supabase
    .from("certificate_prepayments")
    .select(CERTIFICATE_PREPAYMENT_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (query.usage === "used") {
    builder = builder.not("used_at", "is", null);
  } else if (query.usage === "available") {
    builder = builder.is("used_at", null);
  }

  if (query.search) {
    const keyword = `%${query.search}%`;
    builder = builder.or(
      `member.name.ilike.${keyword},member.login_id.ilike.${keyword},member.phone.ilike.${keyword}`,
    );
  }

  const { data, count, error } = await builder.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as CertificatePrepaymentRow[];
  const total = count ?? 0;

  return {
    data: rows.map(mapCertificatePrepaymentListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: getTotalPages(total, query.pageSize),
  };
}

export async function fetchCertificatePrepaymentCourseOptions(): Promise<
  CertificatePrepaymentCourseOption[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
