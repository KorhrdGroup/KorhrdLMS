import { VIDEO_COMPLETION_THRESHOLD_PERCENT } from "@/features/classroom-lectures/constants";
import {
  countCompletedByEnrollment,
  findProgressBySession,
  findProgressBySessionIds,
  insertProgress,
  markEnrollmentLearningCompleted,
  updateProgressPosition,
  updateProgressStatus,
  upsertCompletedProgress,
  upsertInProgressPercent,
} from "@/features/classroom-lectures/repositories/lecture-progress.repository";
import type { LectureAttendanceStatus } from "@/types/database.types";

export async function getSessionStatusMap(
  enrollmentId: string,
  sessionIds: string[],
): Promise<Map<string, LectureAttendanceStatus>> {
  const rows = await findProgressBySessionIds(enrollmentId, sessionIds);
  return new Map(rows.map((row) => [row.lecture_session_id, row.attendance_status]));
}

/**
 * 학생이 강의 상세 화면에 입장할 때 호출합니다. 이미 "완료"된 차시는 상태를
 * 낮추지 않고, 기록이 없거나 "미수강"인 경우에만 "학습중"으로 변경합니다.
 */
export async function ensureSessionInProgress(
  enrollmentId: string,
  sessionId: string,
): Promise<LectureAttendanceStatus> {
  const existing = await findProgressBySession(enrollmentId, sessionId);

  if (!existing) {
    await insertProgress(enrollmentId, sessionId, "in_progress");
    return "in_progress";
  }

  if (existing.attendance_status === "not_started") {
    await updateProgressStatus(enrollmentId, sessionId, "in_progress");
    return "in_progress";
  }

  return existing.attendance_status;
}

/**
 * "학습 완료"(임시) 버튼 처리입니다. 차시를 완료 처리하고, 과정에 게시된
 * 모든 차시가 완료됐다면 `enrollments.learning_completed_at`을 채워
 * 과정 전체를 "학습완료" 상태로 전환할 수 있는 구조를 준비합니다.
 * (수료증 발급 등 후속 처리는 다음 단계에서 이 값을 기준으로 구현합니다.)
 */
export async function completeSession(
  enrollmentId: string,
  sessionId: string,
  totalPublishedSessionCount: number,
): Promise<{ status: "completed"; courseCompleted: boolean }> {
  await upsertCompletedProgress(enrollmentId, sessionId);

  const completedCount = await countCompletedByEnrollment(enrollmentId);
  const courseCompleted =
    totalPublishedSessionCount > 0 && completedCount >= totalPublishedSessionCount;

  if (courseCompleted) {
    await markEnrollmentLearningCompleted(enrollmentId);
  }

  return { status: "completed", courseCompleted };
}

/**
 * 학생 플레이어가 영상 재생 중 주기적으로 호출합니다(재생/이어보기/진도율 저장 연동).
 * 시청 진행률이 완료 기준(`VIDEO_COMPLETION_THRESHOLD_PERCENT`)을 넘으면 자동으로
 * 차시를 완료 처리하고, 이미 완료된 차시는 진도율을 낮추지 않은 채 재생 위치만 갱신합니다.
 */
export async function saveVideoProgress(
  enrollmentId: string,
  sessionId: string,
  currentTimeSeconds: number,
  durationSeconds: number,
  totalPublishedSessionCount: number,
): Promise<{ status: LectureAttendanceStatus; progressPercent: number; courseCompleted: boolean }> {
  const positionSeconds = Math.max(0, Math.floor(currentTimeSeconds));
  const existing = await findProgressBySession(enrollmentId, sessionId);

  if (existing?.attendance_status === "completed") {
    await updateProgressPosition(enrollmentId, sessionId, positionSeconds);
    return { status: "completed", progressPercent: 100, courseCompleted: false };
  }

  const percent =
    durationSeconds > 0 ? Math.min(100, Math.round((currentTimeSeconds / durationSeconds) * 100)) : 0;

  if (percent >= VIDEO_COMPLETION_THRESHOLD_PERCENT) {
    await upsertCompletedProgress(enrollmentId, sessionId, positionSeconds);

    const completedCount = await countCompletedByEnrollment(enrollmentId);
    const courseCompleted =
      totalPublishedSessionCount > 0 && completedCount >= totalPublishedSessionCount;

    if (courseCompleted) {
      await markEnrollmentLearningCompleted(enrollmentId);
    }

    return { status: "completed", progressPercent: 100, courseCompleted };
  }

  await upsertInProgressPercent(enrollmentId, sessionId, percent, positionSeconds);
  return { status: "in_progress", progressPercent: percent, courseCompleted: false };
}

/**
 * 완료된 차시 수 ÷ 전체 게시 차시 수 로 진도율(%)을 계산합니다.
 * (예: 총 20차시 중 5차시 완료 → 25%)
 */
export async function getCourseProgressRate(
  enrollmentId: string,
  totalPublishedSessionCount: number,
): Promise<number> {
  if (totalPublishedSessionCount <= 0) {
    return 0;
  }

  const completedCount = await countCompletedByEnrollment(enrollmentId);
  return Math.round((completedCount / totalPublishedSessionCount) * 100);
}
