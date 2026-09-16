"use server";

import { revalidatePath } from "next/cache";

import {
  canCurrentAdminGradeMember,
  saveExamGrading,
} from "@/features/member-exam-grading/services/member-exam-grading.service";
import type { SaveExamGradingResult } from "@/features/member-exam-grading/types/member-exam-grading.types";
import { getCurrentAdminLoginId } from "@/lib/admin/current-admin";

export async function saveExamGradingAction(
  memberId: string,
  submissionId: string,
  manualIds: string[],
): Promise<SaveExamGradingResult> {
  // 화면을 우회해 액션만 직접 불러도 아기관리자는 STAR 회원 밖을 건드릴 수 없습니다
  if (!(await canCurrentAdminGradeMember(memberId))) {
    return { success: false, message: "이 회원을 채점할 권한이 없습니다." };
  }

  const gradedBy = await getCurrentAdminLoginId();
  const result = await saveExamGrading(memberId, submissionId, manualIds, gradedBy);

  if (result.success) {
    revalidatePath(`/admin/members/${memberId}`);
    revalidatePath(`/admin/members/${memberId}/exams/${submissionId}`);
  }
  return result;
}
