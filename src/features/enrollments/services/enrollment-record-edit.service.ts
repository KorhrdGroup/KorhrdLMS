import type {
  EnrollmentRecordEditInput,
  EnrollmentRecordEditResult,
  GetEnrollmentRecordForEditResult,
} from "@/features/enrollments/types/enrollment.types";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

export function validateEnrollmentRecordEditInput(
  input: EnrollmentRecordEditInput,
): EnrollmentRecordEditResult {
  if (!normalize(input.startDate) || Number.isNaN(Date.parse(input.startDate))) {
    return {
      success: false,
      message: "올바른 시작일을 입력해주세요.",
      field: "startDate",
    };
  }

  if (!normalize(input.endDate) || Number.isNaN(Date.parse(input.endDate))) {
    return {
      success: false,
      message: "올바른 종료일을 입력해주세요.",
      field: "endDate",
    };
  }

  if (input.endDate < input.startDate) {
    return {
      success: false,
      message: "종료일은 시작일 이후여야 합니다.",
      field: "endDate",
    };
  }

  return { success: true, enrollmentId: "" };
}

export async function getEnrollmentRecordForEdit(
  enrollmentId: string,
): Promise<GetEnrollmentRecordForEditResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `id, start_date, end_date, status,
       member:members!inner ( name ),
       course:courses!inner ( name )`,
    )
    .eq("id", enrollmentId)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  const row = data as unknown as {
    id: string;
    start_date: string;
    end_date: string;
    status: EnrollmentStatus;
    member: { name: string };
    course: { name: string };
  };

  return {
    success: true,
    record: {
      id: row.id,
      memberName: row.member.name,
      courseName: row.course.name,
      startDate: row.start_date,
      endDate: row.end_date,
      learningStatus: row.status === "canceled" ? "stopped" : "in_progress",
    },
  };
}

export async function updateEnrollmentRecord(
  enrollmentId: string,
  input: EnrollmentRecordEditInput,
): Promise<EnrollmentRecordEditResult> {
  const validation = validateEnrollmentRecordEditInput(input);
  if (!validation.success) {
    return validation;
  }

  const nextStatus: EnrollmentStatus =
    input.learningStatus === "stopped" ? "canceled" : "confirmed";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      start_date: input.startDate,
      end_date: input.endDate,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수정할 수강 정보를 찾을 수 없습니다." };
  }

  return { success: true, enrollmentId: data.id };
}
