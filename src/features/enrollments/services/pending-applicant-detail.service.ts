import {
  PENDING_APPLICANT_DETAIL_SELECT,
} from "@/features/enrollments/constants";
import type {
  GetPendingApplicantDetailResult,
  PendingApplicantDetail,
} from "@/features/enrollments/types/pending-applicant.types";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

function mapRowToDetail(row: {
  id: string;
  year: number | null;
  batch: string | null;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
  application_date: string | null;
  created_at: string;
  memo: string | null;
  manager_name: string | null;
  member: {
    id: string;
    name: string;
    login_id: string;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
  };
  course: {
    id: string;
    name: string;
    code: string;
  };
}): PendingApplicantDetail {
  return {
    id: row.id,
    year: row.year,
    batch: row.batch,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    paymentStatus: row.payment_status,
    applicationDate: row.application_date,
    createdAt: row.created_at,
    memo: row.memo,
    managerName: row.manager_name ?? row.member.manager_name,
    member: {
      id: row.member.id,
      name: row.member.name,
      loginId: row.member.login_id,
      phone: row.member.phone,
      email: row.member.email,
      managerName: row.member.manager_name,
    },
    course: {
      id: row.course.id,
      name: row.course.name,
      code: row.course.code,
    },
  };
}

export async function getPendingApplicantDetail(
  enrollmentId: string,
): Promise<GetPendingApplicantDetailResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "신청 수강 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(PENDING_APPLICANT_DETAIL_SELECT)
    .eq("id", enrollmentId)
    .eq("status", "pending")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "신청 수강 정보를 찾을 수 없습니다." };
  }

  return { success: true, applicant: mapRowToDetail(data) };
}
