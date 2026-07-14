import {
  clearSessionVideoRecord,
  deleteLectureVideoObject,
  findSessionById,
  updateSessionVideoRecord,
} from "@/features/lectures/repositories/lecture.repository";
import type {
  SessionActionResult,
  SetLectureSessionVideoInput,
} from "@/features/lectures/types/lecture-curriculum.types";

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * 차시 영상을 등록/교체합니다. 파일 업로드(Supabase Storage)는 브라우저에서 먼저 완료한 뒤
 * 그 결과 URL/경로만 이 서비스로 전달합니다(대용량 바이너리가 서버를 거치지 않도록 하기 위함).
 * 외부 CDN URL을 직접 입력하는 경우도 동일한 흐름을 사용합니다.
 */
export async function setLectureSessionVideo(
  lectureId: string,
  sessionId: string,
  input: SetLectureSessionVideoInput,
): Promise<SessionActionResult> {
  const trimmedUrl = input.videoUrl.trim();

  if (!trimmedUrl) {
    return { success: false, message: "영상 URL을 확인할 수 없습니다." };
  }

  if (!isHttpUrl(trimmedUrl)) {
    return { success: false, message: "올바른 형식의 URL이 아닙니다." };
  }

  if (
    input.videoDurationSeconds != null &&
    (!Number.isFinite(input.videoDurationSeconds) || input.videoDurationSeconds <= 0)
  ) {
    return { success: false, message: "영상 길이 값이 올바르지 않습니다." };
  }

  const previous = await findSessionById(lectureId, sessionId);

  if (!previous) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  const updated = await updateSessionVideoRecord(lectureId, sessionId, {
    ...input,
    videoUrl: trimmedUrl,
  });

  if (!updated) {
    return { success: false, message: "영상 정보 저장에 실패했습니다." };
  }

  // 이전에 Storage에 업로드된 영상이 있었고, 이번에 다른 파일로 교체된 경우 이전 오브젝트를 정리합니다.
  if (
    previous.videoSource === "storage" &&
    previous.videoStoragePath &&
    previous.videoStoragePath !== updated.videoStoragePath
  ) {
    await deleteLectureVideoObject(previous.videoStoragePath);
  }

  return { success: true, message: "영상이 등록되었습니다." };
}

export async function removeLectureSessionVideo(
  lectureId: string,
  sessionId: string,
): Promise<SessionActionResult> {
  const previous = await findSessionById(lectureId, sessionId);

  if (!previous) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  if (!previous.videoUrl) {
    return { success: false, message: "삭제할 영상이 없습니다." };
  }

  const cleared = await clearSessionVideoRecord(lectureId, sessionId);

  if (!cleared) {
    return { success: false, message: "영상 삭제에 실패했습니다." };
  }

  if (previous.videoSource === "storage" && previous.videoStoragePath) {
    await deleteLectureVideoObject(previous.videoStoragePath);
  }

  return { success: true, message: "영상이 삭제되었습니다." };
}
