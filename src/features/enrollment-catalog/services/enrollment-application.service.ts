import { DEFAULT_ENROLLMENT_DURATION_DAYS } from "@/features/enrollment-catalog/constants";
import { formatDate } from "@/features/enrollment-catalog/services/enrollment-catalog.service";
import type {
  EnrollmentApplicationInput,
  EnrollmentApplicationResult,
} from "@/features/enrollment-catalog/types/enrollment-application.types";
import { ACTIVE_ENROLLMENT_STATUSES } from "@/features/enrollments/constants";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

/**
 * 학생이 수강신청 화면에서 과정을 선택하면 `enrollments`에 바로 "확정(confirmed)" 상태로
 * 저장합니다. 민간자격증 LMS는 반(class) 배정이나 관리자 승인 단계 없이, 과정등록만
 * 되어 있으면(status = active) 신청 즉시 학습이 가능해야 하기 때문입니다.
 * - start_date: 신청일(오늘)
 * - end_date: 신청일 + 과정 수강기간(courses.default_duration_days, 없으면 30일)
 * - payment_status: 무료수강 과정이면 결제 없이 바로 "paid"(완료) 처리, 유료 과정은 "unpaid"로
 *   저장(실제 결제 연동은 별도 플로우).
 */
export async function applyForCourse(
  input: EnrollmentApplicationInput,
): Promise<EnrollmentApplicationResult> {
  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", input.memberId)
    .is("deleted_at", null)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return {
      success: false,
      code: "member_not_found",
      message: "회원 정보를 확인할 수 없습니다. 다시 로그인 후 시도해주세요.",
    };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, status, default_duration_days, is_free_course")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course || course.status !== "active") {
    return {
      success: false,
      code: "course_not_found",
      message: "신청할 수 없는 과정입니다.",
    };
  }

  // 유효한(취소/삭제되지 않은) 신청 건만 중복으로 취급합니다. canceled/deleted 등 무효 처리된
  // 과거 신청 건은 재신청을 막지 않아야 하므로 상태/삭제 조건을 함께 검사합니다.
  const { data: existing, error: existingError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("member_id", input.memberId)
    .eq("course_id", input.courseId)
    .is("deleted_at", null)
    .in("status", ACTIVE_ENROLLMENT_STATUSES)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return {
      success: false,
      code: "duplicate",
      message: "이미 신청한 과정입니다.",
    };
  }

  const today = formatDate(new Date());
  const durationDays =
    course.default_duration_days && course.default_duration_days > 0
      ? course.default_duration_days
      : DEFAULT_ENROLLMENT_DURATION_DAYS;

  const insertData: Database["public"]["Tables"]["enrollments"]["Insert"] = {
    member_id: input.memberId,
    course_id: input.courseId,
    start_date: today,
    end_date: addDays(today, durationDays),
    status: "confirmed",
    payment_status: course.is_free_course ? "paid" : "unpaid",
    application_date: today,
    confirmed_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        code: "duplicate",
        message: "이미 신청한 과정입니다.",
      };
    }

    throw new Error(error.message);
  }

  return { success: true, enrollmentId: data.id };
}
