import type { PendingApplicantEditInput, PendingApplicantEditResult } from "@/features/enrollments/types/pending-applicant-edit.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validatePendingApplicantEditInput(
  input: PendingApplicantEditInput,
): PendingApplicantEditResult {
  if (!normalize(input.courseId)) {
    return {
      success: false,
      message: "과정을 선택해주세요.",
      field: "courseId",
    };
  }

  return { success: true, message: "" };
}

export async function updatePendingApplicant(
  enrollmentId: string,
  input: PendingApplicantEditInput,
): Promise<PendingApplicantEditResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "신청 수강 정보를 찾을 수 없습니다." };
  }

  const validation = validatePendingApplicantEditInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("enrollments")
    .select("id, member_id, course_id")
    .eq("id", enrollmentId)
    .eq("status", "pending")
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return { success: false, message: "신청 수강 정보를 찾을 수 없습니다." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    return {
      success: false,
      message: "등록된 과정이 없습니다. 과정관리에서 과정을 먼저 등록해주세요.",
      field: "courseId",
    };
  }

  if (input.courseId !== current.course_id) {
    const { data: duplicate, error: duplicateError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("member_id", current.member_id)
      .eq("course_id", input.courseId)
      .neq("id", enrollmentId)
      .maybeSingle();

    if (duplicateError) {
      throw new Error(duplicateError.message);
    }

    if (duplicate) {
      return {
        success: false,
        message: "해당 회원은 이미 선택한 과정에 신청되어 있습니다.",
        field: "courseId",
      };
    }
  }

  const updateData: Database["public"]["Tables"]["enrollments"]["Update"] = {
    course_id: input.courseId,
    batch: emptyToNull(input.batch),
    manager_name: emptyToNull(input.managerName),
    payment_status: input.paymentStatus,
    memo: emptyToNull(input.memo),
  };

  const { data, error } = await supabase
    .from("enrollments")
    .update(updateData)
    .eq("id", enrollmentId)
    .eq("status", "pending")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "해당 회원은 이미 선택한 과정에 신청되어 있습니다.",
        field: "courseId",
      };
    }

    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수정할 수 있는 신청 수강 정보가 없습니다." };
  }

  return { success: true, message: "신청 수강 정보가 수정되었습니다." };
}
