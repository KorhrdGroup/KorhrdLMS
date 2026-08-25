"use server";

import {
  applyForCourse,
  sendEnrollmentDoneAlimtalk,
} from "@/features/enrollment-catalog/services/enrollment-application.service";
import { createClient } from "@/lib/supabase/server";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

import type { CartApplyResult } from "./cart-apply.actions";

/**
 * 한 과정만 바로 수강신청합니다.
 *
 * 과정 상세의 "무료수강신청", 취업 길찾기 상세의 "바로 수강신청" 처럼
 * 신청할 과정이 이미 하나로 정해진 자리에서 씁니다. 목록으로 보내 다시
 * 고르게 하지 않고 여기서 끝냅니다.
 *
 * 장바구니 쪽(applyCartAction)은 과정 "이름"으로 찾지만, 상세 화면은
 * 과정코드(CRS-KH-xxxx)를 들고 있어 코드로 바로 찾습니다. 결과 모양은
 * 같은 CartApplyResult 라서 완료 모달을 그대로 씁니다.
 *
 * 회원은 세션에서 직접 조회하므로 클라이언트가 memberId를 조작할 수 없습니다.
 */
export async function enrollCourseAction(input: { code: string }): Promise<CartApplyResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return {
      success: false,
      code: "unauthenticated",
      message: "수강신청을 위해서는 로그인이 필요합니다.",
    };
  }

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("id, name")
    .eq("code", input.code)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (!course) {
    return {
      success: true,
      applied: [],
      duplicated: [],
      failed: [{ name: input.code, message: "과정을 찾을 수 없습니다." }],
    };
  }

  const result = await applyForCourse({ memberId: member.id, courseId: course.id });
  if (result.success) {
    await sendEnrollmentDoneAlimtalk(member.id);
    return { success: true, applied: [course.name], duplicated: [], failed: [] };
  }
  if (result.code === "duplicate") {
    return { success: true, applied: [], duplicated: [course.name], failed: [] };
  }
  return {
    success: true,
    applied: [],
    duplicated: [],
    failed: [{ name: course.name, message: result.message }],
  };
}
