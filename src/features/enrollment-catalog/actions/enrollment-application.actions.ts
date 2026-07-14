"use server";

import { applyForCourse } from "@/features/enrollment-catalog/services/enrollment-application.service";
import type { EnrollmentApplicationResult } from "@/features/enrollment-catalog/types/enrollment-application.types";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

/**
 * 학생 수강신청 화면에서 호출하는 Server Action.
 * 로그인 세션에서 회원을 직접 조회하므로, 클라이언트가 memberId를 조작해 전달할 수 없습니다.
 */
export async function applyForCourseAction(input: {
  courseId: string;
}): Promise<EnrollmentApplicationResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return {
      success: false,
      code: "unauthenticated",
      message: "수강신청을 위해서는 로그인이 필요합니다.",
    };
  }

  return applyForCourse({
    memberId: member.id,
    courseId: input.courseId,
  });
}
