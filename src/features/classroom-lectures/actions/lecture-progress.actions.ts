"use server";

import {
  completeClassroomLectureSession,
  saveClassroomLectureVideoProgress,
  type CompleteClassroomLectureSessionResult,
  type SaveClassroomVideoProgressResult,
} from "@/features/classroom-lectures/services/classroom-lecture.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";

export async function completeLectureSessionAction(
  courseCode: string,
  order: number,
): Promise<CompleteClassroomLectureSessionResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  return completeClassroomLectureSession(member.id, courseCode, order);
}

/**
 * 영상 재생 중 주기적으로 호출해 시청 진도율/이어보기 위치를 저장합니다.
 * ("재생 → 이어보기 → 진도율 저장"이 기존 Progress 시스템과 연결되는 지점입니다.)
 */
export async function saveLectureVideoProgressAction(
  courseCode: string,
  order: number,
  currentTimeSeconds: number,
  durationSeconds: number,
): Promise<SaveClassroomVideoProgressResult> {
  const member = await getMockableStudentMember();

  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  return saveClassroomLectureVideoProgress(member.id, courseCode, order, currentTimeSeconds, durationSeconds);
}
