"use server";

import {
  removeLectureSessionVideo,
  setLectureSessionVideo,
} from "@/features/lectures/services/lecture-video.service";
import type {
  SessionActionResult,
  SetLectureSessionVideoInput,
} from "@/features/lectures/types/lecture-curriculum.types";

export async function setLectureSessionVideoAction(
  lectureId: string,
  sessionId: string,
  input: SetLectureSessionVideoInput,
): Promise<SessionActionResult> {
  return setLectureSessionVideo(lectureId, sessionId, input);
}

export async function removeLectureSessionVideoAction(
  lectureId: string,
  sessionId: string,
): Promise<SessionActionResult> {
  return removeLectureSessionVideo(lectureId, sessionId);
}
