"use server";

import { submitClassroomExam } from "@/features/classroom-exams/services/classroom-exam.service";
import type { SubmitClassroomExamResult } from "@/features/classroom-exams/types/classroom-exam.types";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export async function submitClassroomExamAction(
  courseCode: string,
  examId: string,
  answers: Record<string, string>,
): Promise<SubmitClassroomExamResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  return submitClassroomExam(member.id, courseCode, examId, answers);
}
