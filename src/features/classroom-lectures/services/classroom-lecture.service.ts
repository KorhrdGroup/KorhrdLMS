import { findProgressBySession } from "@/features/classroom-lectures/repositories/lecture-progress.repository";
import {
  completeSession,
  ensureSessionInProgress,
  getCourseProgressRate,
  getSessionStatusMap,
  saveVideoProgress,
} from "@/features/classroom-lectures/services/lecture-progress.service";
import type {
  ClassroomCourseLectures,
  ClassroomLectureDetail,
  ClassroomLectureStatus,
} from "@/features/classroom-lectures/types/classroom-lecture.types";
import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type CourseRow = { id: string; code: string; name: string };
type LectureRow = { id: string; created_at: string };
type SessionRow = {
  id: string;
  lecture_id: string;
  session_order: number;
  title: string;
  duration_minutes: number | null;
  video_url: string | null;
  video_duration_seconds: number | null;
};

type FlattenedSession = {
  id: string;
  order: number;
  title: string;
  durationMinutes: number | null;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
};

export type ResolvedAccess = {
  course: CourseRow;
  enrollmentId: string;
  /** 수강기간(YYYY-MM-DD). 민간자격증 LMS의 시험 응시 가능 기간 판단 기준입니다. */
  enrollmentStartDate: string;
  enrollmentEndDate: string;
};

/**
 * `courseCode`(courses.code)로 과정을 찾고, 로그인한 학생이 해당 과정에
 * confirmed 상태로 수강신청했는지 확인합니다. 둘 중 하나라도 아니면 null을
 * 반환해 "존재하지 않는 과정"과 동일하게 처리합니다(수강신청하지 않은
 * 과정의 차시가 노출되지 않도록 하는 접근 제어).
 *
 * 시험(classroom-exams) 등 다른 학생 기능에서도 동일한 접근 제어가 필요해
 * export합니다.
 */
export async function resolveClassroomAccess(
  supabase: SupabaseServerClient,
  memberId: string,
  courseCode: string,
): Promise<ResolvedAccess | null> {
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, code, name")
    .eq("code", courseCode)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    return null;
  }

  const courseRow = course as CourseRow;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id, start_date, end_date")
    .eq("member_id", memberId)
    .eq("course_id", courseRow.id)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  if (!enrollment) {
    return null;
  }

  return {
    course: courseRow,
    enrollmentId: enrollment.id,
    enrollmentStartDate: enrollment.start_date,
    enrollmentEndDate: enrollment.end_date,
  };
}

/**
 * 관리자 강의관리에서 게시(is_published = true)한 강의들의 차시를
 * 강의 등록순 → 차시 순서로 이어붙여 전체 차시에 1부터 순번을 다시 매깁니다.
 */
async function fetchPublishedSessions(
  supabase: SupabaseServerClient,
  courseId: string,
): Promise<FlattenedSession[]> {
  const { data: lectureRows, error: lectureError } = await supabase
    .from("course_lectures")
    .select("id, created_at")
    .eq("course_id", courseId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (lectureError) {
    throw new Error(lectureError.message);
  }

  const lectures = (lectureRows ?? []) as LectureRow[];

  if (lectures.length === 0) {
    return [];
  }

  const { data: sessionRows, error: sessionError } = await supabase
    .from("lecture_sessions")
    .select("id, lecture_id, session_order, title, duration_minutes, video_url, video_duration_seconds")
    .in(
      "lecture_id",
      lectures.map((lecture) => lecture.id),
    )
    .is("deleted_at", null)
    .order("session_order", { ascending: true });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const lectureOrderIndex = new Map(lectures.map((lecture, index) => [lecture.id, index]));
  const sortedSessions = [...((sessionRows ?? []) as SessionRow[])].sort((a, b) => {
    const lectureDiff = (lectureOrderIndex.get(a.lecture_id) ?? 0) - (lectureOrderIndex.get(b.lecture_id) ?? 0);
    return lectureDiff !== 0 ? lectureDiff : a.session_order - b.session_order;
  });

  return sortedSessions.map((session, index) => ({
    id: session.id,
    order: index + 1,
    title: session.title,
    durationMinutes: session.duration_minutes,
    videoUrl: session.video_url,
    videoDurationSeconds: session.video_duration_seconds,
  }));
}

export async function getClassroomCourseLectures(
  memberId: string,
  courseCode: string,
): Promise<ClassroomCourseLectures | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const sessions = await fetchPublishedSessions(supabase, access.course.id);
  const statusMap = await getSessionStatusMap(
    access.enrollmentId,
    sessions.map((session) => session.id),
  );

  return {
    courseId: access.course.id,
    courseCode: access.course.code,
    courseTitle: access.course.name,
    sessions: sessions.map((session) => ({
      ...session,
      status: statusMap.get(session.id) ?? "not_started",
    })),
  };
}

/**
 * 강의 상세(차시 재생) 화면 진입 시 사용합니다. 접근 가능한 차시를 찾으면
 * 곧바로 해당 차시를 "학습중"으로 전환합니다(이미 완료된 차시는 유지).
 */
export async function getClassroomLectureDetail(
  memberId: string,
  courseCode: string,
  order: number,
): Promise<ClassroomLectureDetail | null> {
  if (!memberId.trim() || !courseCode.trim() || !Number.isFinite(order)) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const sessions = await fetchPublishedSessions(supabase, access.course.id);
  const target = sessions.find((session) => session.order === order);

  if (!target) {
    return null;
  }

  const status = await ensureSessionInProgress(access.enrollmentId, target.id);
  const progress = await findProgressBySession(access.enrollmentId, target.id);
  const prev = sessions.find((session) => session.order === order - 1);
  const next = sessions.find((session) => session.order === order + 1);

  return {
    courseId: access.course.id,
    courseCode: access.course.code,
    courseTitle: access.course.name,
    enrollmentId: access.enrollmentId,
    session: {
      ...target,
      status,
      videoProgressPercent: progress?.video_progress_percent ?? 0,
      resumePositionSeconds: progress?.last_position_seconds ?? 0,
    },
    prevOrder: prev ? prev.order : null,
    nextOrder: next ? next.order : null,
  };
}

export type SaveClassroomVideoProgressResult =
  | { success: true; status: ClassroomLectureStatus; progressPercent: number; courseCompleted: boolean }
  | { success: false; message: string };

/**
 * 학생 플레이어가 영상 재생 중 주기적으로 호출하는 진도율 저장 흐름입니다.
 * "재생 → 이어보기 → 진도율 저장"이 모두 이 함수를 통해 `lecture_progress`에 반영됩니다.
 */
export async function saveClassroomLectureVideoProgress(
  memberId: string,
  courseCode: string,
  order: number,
  currentTimeSeconds: number,
  durationSeconds: number,
): Promise<SaveClassroomVideoProgressResult> {
  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return { success: false, message: "수강 중인 과정을 찾을 수 없습니다." };
  }

  const sessions = await fetchPublishedSessions(supabase, access.course.id);
  const target = sessions.find((session) => session.order === order);

  if (!target) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  const result = await saveVideoProgress(
    access.enrollmentId,
    target.id,
    currentTimeSeconds,
    durationSeconds,
    sessions.length,
  );

  return { success: true, ...result };
}

export type CompleteClassroomLectureSessionResult =
  | { success: true; courseCompleted: boolean }
  | { success: false; message: string };

/**
 * "학습 완료"(임시) 버튼 액션에서 사용합니다. 요청한 학생이 실제로 해당
 * 과정에 접근 가능한지 다시 확인한 뒤 차시를 완료 처리합니다.
 */
export async function completeClassroomLectureSession(
  memberId: string,
  courseCode: string,
  order: number,
): Promise<CompleteClassroomLectureSessionResult> {
  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return { success: false, message: "수강 중인 과정을 찾을 수 없습니다." };
  }

  const sessions = await fetchPublishedSessions(supabase, access.course.id);
  const target = sessions.find((session) => session.order === order);

  if (!target) {
    return { success: false, message: "차시 정보를 찾을 수 없습니다." };
  }

  const result = await completeSession(access.enrollmentId, target.id, sessions.length);
  return { success: true, courseCompleted: result.courseCompleted };
}

/**
 * `/classroom` 대시보드 카드에서 과정 진도율(%)을 표시하기 위해 사용합니다.
 */
export async function getClassroomCourseProgressRate(
  enrollmentId: string,
  courseId: string,
): Promise<number> {
  const supabase = await createClient();
  const sessions = await fetchPublishedSessions(supabase, courseId);
  return getCourseProgressRate(enrollmentId, sessions.length);
}
