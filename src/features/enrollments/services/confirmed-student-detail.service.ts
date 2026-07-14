import {
  CONFIRMED_STUDENT_DETAIL_SELECT,
  CONFIRMED_STUDENT_HISTORY_SELECT,
} from "@/features/enrollments/constants";
import type {
  ConfirmedStudentDetail,
  ConfirmedStudentEnrollmentHistoryItem,
  GetConfirmedStudentDetailResult,
} from "@/features/enrollments/types/confirmed-student.types";
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
}): Omit<ConfirmedStudentDetail, "enrollmentHistory"> {
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

function mapHistoryRow(row: {
  id: string;
  start_date: string;
  end_date: string;
  payment_status: PaymentStatus;
  course: {
    name: string;
  };
}): ConfirmedStudentEnrollmentHistoryItem {
  return {
    id: row.id,
    courseName: row.course.name,
    startDate: row.start_date,
    endDate: row.end_date,
    paymentStatus: row.payment_status,
  };
}

async function getMemberEnrollmentHistory(
  memberId: string,
): Promise<ConfirmedStudentEnrollmentHistoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(CONFIRMED_STUDENT_HISTORY_SELECT)
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .order("confirmed_at", { ascending: false, nullsFirst: false })
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapHistoryRow);
}

export async function getConfirmedStudentDetail(
  enrollmentId: string,
): Promise<GetConfirmedStudentDetailResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(CONFIRMED_STUDENT_DETAIL_SELECT)
    .eq("id", enrollmentId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  const row = data as Parameters<typeof mapRowToDetail>[0];
  const enrollmentHistory = await getMemberEnrollmentHistory(row.member.id);

  return {
    success: true,
    student: {
      ...mapRowToDetail(row),
      enrollmentHistory,
    },
  };
}
