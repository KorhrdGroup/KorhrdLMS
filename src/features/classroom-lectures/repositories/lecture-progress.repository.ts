import { createClient } from "@/lib/supabase/server";
import type { Database, LectureAttendanceStatus } from "@/types/database.types";

/**
 * `lecture_progress` Repository 계층입니다.
 * 서비스 계층(services/lecture-progress.service.ts)은 이 파일의 함수만 사용합니다.
 */

type ProgressRow = Database["public"]["Tables"]["lecture_progress"]["Row"];

const PROGRESS_SELECT =
  "id, enrollment_id, lecture_session_id, video_progress_percent, last_position_seconds, attendance_status, completed_at, created_at, updated_at" as const;

export async function findProgressBySessionIds(
  enrollmentId: string,
  sessionIds: string[],
): Promise<ProgressRow[]> {
  if (sessionIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lecture_progress")
    .select(PROGRESS_SELECT)
    .eq("enrollment_id", enrollmentId)
    .in("lecture_session_id", sessionIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProgressRow[];
}

export async function findProgressBySession(
  enrollmentId: string,
  sessionId: string,
): Promise<ProgressRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lecture_progress")
    .select(PROGRESS_SELECT)
    .eq("enrollment_id", enrollmentId)
    .eq("lecture_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ProgressRow | null) ?? null;
}

export async function insertProgress(
  enrollmentId: string,
  sessionId: string,
  attendanceStatus: LectureAttendanceStatus,
): Promise<void> {
  const supabase = await createClient();
  const insertData: Database["public"]["Tables"]["lecture_progress"]["Insert"] = {
    enrollment_id: enrollmentId,
    lecture_session_id: sessionId,
    attendance_status: attendanceStatus,
  };

  const { error } = await supabase.from("lecture_progress").insert(insertData);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProgressStatus(
  enrollmentId: string,
  sessionId: string,
  attendanceStatus: LectureAttendanceStatus,
): Promise<void> {
  const supabase = await createClient();
  const updateData: Database["public"]["Tables"]["lecture_progress"]["Update"] = {
    attendance_status: attendanceStatus,
  };

  const { error } = await supabase
    .from("lecture_progress")
    .update(updateData)
    .eq("enrollment_id", enrollmentId)
    .eq("lecture_session_id", sessionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertCompletedProgress(
  enrollmentId: string,
  sessionId: string,
  positionSeconds = 0,
): Promise<void> {
  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["lecture_progress"]["Insert"] = {
    enrollment_id: enrollmentId,
    lecture_session_id: sessionId,
    attendance_status: "completed",
    video_progress_percent: 100,
    last_position_seconds: Math.max(0, Math.floor(positionSeconds)),
    completed_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("lecture_progress")
    .upsert(payload, { onConflict: "enrollment_id,lecture_session_id" });

  if (error) {
    throw new Error(error.message);
  }
}

/** 시청 중(미완료) 진도율/재생 위치를 저장합니다. 완료 상태로는 절대 낮추지 않습니다. */
export async function upsertInProgressPercent(
  enrollmentId: string,
  sessionId: string,
  percent: number,
  positionSeconds: number,
): Promise<void> {
  const supabase = await createClient();
  const payload: Database["public"]["Tables"]["lecture_progress"]["Insert"] = {
    enrollment_id: enrollmentId,
    lecture_session_id: sessionId,
    attendance_status: "in_progress",
    video_progress_percent: Math.max(0, Math.min(100, Math.round(percent))),
    last_position_seconds: Math.max(0, Math.floor(positionSeconds)),
  };

  const { error } = await supabase
    .from("lecture_progress")
    .upsert(payload, { onConflict: "enrollment_id,lecture_session_id" });

  if (error) {
    throw new Error(error.message);
  }
}

/** 이미 완료된 차시를 다시 재생할 때, 진도율은 유지한 채 이어보기 위치만 갱신합니다. */
export async function updateProgressPosition(
  enrollmentId: string,
  sessionId: string,
  positionSeconds: number,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("lecture_progress")
    .update({ last_position_seconds: Math.max(0, Math.floor(positionSeconds)) })
    .eq("enrollment_id", enrollmentId)
    .eq("lecture_session_id", sessionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countCompletedByEnrollment(enrollmentId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("lecture_progress")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", enrollmentId)
    .eq("attendance_status", "completed");

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markEnrollmentLearningCompleted(enrollmentId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enrollments")
    .update({ learning_completed_at: new Date().toISOString() })
    .eq("id", enrollmentId)
    .is("learning_completed_at", null);

  if (error) {
    throw new Error(error.message);
  }
}
