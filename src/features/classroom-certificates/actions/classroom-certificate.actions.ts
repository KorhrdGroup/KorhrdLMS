"use server";

import { resolveClassroomAccess } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { issueCompletionCertificate } from "@/features/completion-certificates/services/completion-certificate-mutation.service";
import type { CompletionCertificateActionResult } from "@/features/completion-certificates/types/completion-certificate.types";
import { getMockableStudentMember } from "@/lib/mock-auth-server";
import { createClient } from "@/lib/supabase/server";

/**
 * 학생이 학습강의실 '수료증' 화면에서 "수료증 발급" 버튼을 눌렀을 때 호출합니다.
 * `courseCode`(과정 slug)만 클라이언트에서 받고, 실제 대상 enrollment는
 * 로그인한 학생 본인 세션 기준으로 서버에서 재확인합니다(다른 학생의
 * enrollment로 발급을 시도할 수 없도록 하기 위함). 발급 가능 여부(수료
 * 조건 충족)는 관리자 수료증관리와 동일한 `issueCompletionCertificate`가
 * 다시 한 번 서버에서 검증합니다.
 */
export async function issueClassroomCertificateAction(
  courseCode: string,
): Promise<CompletionCertificateActionResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, member.id, courseCode);

  if (!access) {
    return { success: false, message: "존재하지 않는 과정입니다." };
  }

  return issueCompletionCertificate(access.enrollmentId);
}
