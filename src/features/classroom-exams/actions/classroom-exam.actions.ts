"use server";

import { redirect } from "next/navigation";

import {
  startExamRetake,
  submitClassroomExam,
} from "@/features/classroom-exams/services/classroom-exam.service";
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

/**
 * 성적 확인 화면의 "재응시" 버튼.
 * 재응시 가능 상태로 바꾼 뒤 곧바로 응시 화면으로 보냅니다.
 */
export async function startExamRetakeAction(formData: FormData): Promise<void> {
  const courseCode = String(formData.get("courseCode") ?? "");
  const examId = String(formData.get("examId") ?? "");

  const member = await getMockableStudentMember();
  if (!member) {
    redirect(`/login?redirect=/exam/${courseCode}/result`);
  }

  const result = await startExamRetake(member.id, courseCode, examId);
  if (!result.success) {
    // 실패 사유는 응시 화면이 다시 한번 검증해 같은 문구로 안내합니다.
    redirect(`/exam/${courseCode}/result`);
  }

  redirect(`/exam/${courseCode}/${examId}`);
}
