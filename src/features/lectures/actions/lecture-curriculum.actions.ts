"use server";

import {
  addLectureSession,
  deleteLectureSession,
  getLectureSession,
  moveLectureSession,
  renameLectureSession,
} from "@/features/lectures/services/lecture-curriculum.service";
import type {
  GetLectureSessionResult,
  SessionActionResult,
  SessionMoveDirection,
} from "@/features/lectures/types/lecture-curriculum.types";

export async function getLectureSessionAction(
  lectureId: string,
  sessionId: string,
): Promise<GetLectureSessionResult> {
  return getLectureSession(lectureId, sessionId);
}

export async function addLectureSessionAction(
  lectureId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<SessionActionResult> {
  return addLectureSession(lectureId, title, durationMinutes);
}

export async function renameLectureSessionAction(
  lectureId: string,
  sessionId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<SessionActionResult> {
  return renameLectureSession(lectureId, sessionId, title, durationMinutes);
}

export async function deleteLectureSessionAction(
  lectureId: string,
  sessionId: string,
): Promise<SessionActionResult> {
  return deleteLectureSession(lectureId, sessionId);
}

export async function moveLectureSessionAction(
  lectureId: string,
  sessionId: string,
  direction: SessionMoveDirection,
): Promise<SessionActionResult> {
  return moveLectureSession(lectureId, sessionId, direction);
}
