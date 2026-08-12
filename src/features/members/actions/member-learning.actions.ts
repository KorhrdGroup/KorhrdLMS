"use server";

import { revalidatePath } from "next/cache";

import { DEFAULT_ENROLLMENT_DURATION_DAYS } from "@/features/enrollment-catalog/constants";
import { createClient } from "@/lib/supabase/server";

/**
 * 회원 상세 > 수강정보 탭의 학습 관리(대행) 액션 모음.
 *
 * - 수강신청 대행: 관리자가 회원 대신 과정을 확정(confirmed) 상태로 신청
 * - 수강 취소: soft delete(deleted_at) — 이력은 남고 화면에서만 사라집니다
 * 진도율·시험점수 수정은 성적관리와 같은 액션(updateGradeAttendance/ExamAction)을 씁니다.
 */

export type MemberLearningActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function adminEnrollMemberAction(
  memberId: string,
  courseId: string,
): Promise<MemberLearningActionResult> {
  if (!memberId.trim() || !courseId.trim()) {
    return { success: false, message: "회원과 과정을 확인해주세요." };
  }

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, status, default_duration_days")
    .eq("id", courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!course) {
    return { success: false, message: "과정을 찾을 수 없습니다." };
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("member_id", memberId)
    .eq("course_id", courseId)
    .is("deleted_at", null)
    .neq("status", "canceled")
    .maybeSingle();

  if (existing) {
    return { success: false, message: `이미 수강 중인 과정입니다. (${course.name})` };
  }

  const durationDays =
    course.default_duration_days && course.default_duration_days > 0
      ? course.default_duration_days
      : DEFAULT_ENROLLMENT_DURATION_DAYS;

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + durationDays);
  const toDate = (d: Date) => d.toISOString().slice(0, 10);

  const { error } = await supabase.from("enrollments").insert({
    member_id: memberId,
    course_id: courseId,
    start_date: toDate(today),
    end_date: toDate(end),
    status: "confirmed",
    payment_status: "paid",
    application_date: toDate(today),
    confirmed_at: new Date().toISOString(),
    memo: "관리자 대행 신청",
  });

  if (error) {
    return { success: false, message: `수강신청에 실패했습니다: ${error.message}` };
  }

  revalidatePath(`/admin/members`);
  return { success: true, message: `"${course.name}" 과정을 신청했습니다.` };
}

export async function adminCancelEnrollmentAction(
  enrollmentId: string,
): Promise<MemberLearningActionResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", enrollmentId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, message: `수강 취소에 실패했습니다: ${error.message}` };
  }
  if (!data) {
    return { success: false, message: "수강 정보를 찾을 수 없습니다." };
  }

  revalidatePath(`/admin/members`);
  return { success: true, message: "수강을 취소했습니다." };
}
