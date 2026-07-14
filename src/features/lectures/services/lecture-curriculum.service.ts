import {
  addSessionRecord,
  deleteSessionRecord,
  findLectureById,
  findSessionById,
  moveSessionRecord,
  renameSessionRecord,
} from "@/features/lectures/repositories/lecture.repository";
import type {
  GetLectureCurriculumResult,
  GetLectureSessionResult,
  SessionActionResult,
  SessionMoveDirection,
} from "@/features/lectures/types/lecture-curriculum.types";

export async function getLectureCurriculum(
  lectureId: string,
): Promise<GetLectureCurriculumResult> {
  const lecture = await findLectureById(lectureId);

  if (!lecture) {
    return { success: false, message: "강의 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    summary: {
      lectureId: lecture.id,
      lectureTitle: lecture.title,
      courseName: lecture.courseName,
      isPublished: lecture.isPublished,
      sessionCount: lecture.sessions.length,
    },
    // repository가 이미 session_order 오름차순으로 반환합니다.
    sessions: lecture.sessions,
  };
}

export async function getLectureSession(
  lectureId: string,
  sessionId: string,
): Promise<GetLectureSessionResult> {
  const session = await findSessionById(lectureId, sessionId);

  if (!session) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  return { success: true, session };
}

export async function addLectureSession(
  lectureId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<SessionActionResult> {
  const trimmed = title.trim();

  if (!trimmed) {
    return { success: false, message: "차시명을 입력해주세요." };
  }

  const session = await addSessionRecord(lectureId, trimmed, durationMinutes ?? null);

  if (!session) {
    return { success: false, message: "강의 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${trimmed}" 차시가 추가되었습니다.` };
}

export async function renameLectureSession(
  lectureId: string,
  sessionId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<SessionActionResult> {
  const trimmed = title.trim();

  if (!trimmed) {
    return { success: false, message: "차시명을 입력해주세요." };
  }

  const ok = await renameSessionRecord(lectureId, sessionId, trimmed, durationMinutes);

  if (!ok) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "차시명이 수정되었습니다." };
}

export async function deleteLectureSession(
  lectureId: string,
  sessionId: string,
): Promise<SessionActionResult> {
  const ok = await deleteSessionRecord(lectureId, sessionId);

  if (!ok) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "차시가 삭제되었습니다." };
}

export async function moveLectureSession(
  lectureId: string,
  sessionId: string,
  direction: SessionMoveDirection,
): Promise<SessionActionResult> {
  const ok = await moveSessionRecord(lectureId, sessionId, direction);

  if (!ok) {
    return { success: false, message: "더 이상 순서를 변경할 수 없습니다." };
  }

  return { success: true, message: "차시 순서가 변경되었습니다." };
}
