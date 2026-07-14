import { LECTURE_VIDEO_BUCKET } from "@/features/lectures/constants";
import type {
  Lecture,
  LectureSession,
} from "@/features/lectures/types/lecture.types";
import type {
  SessionMoveDirection,
  SetLectureSessionVideoInput,
} from "@/features/lectures/types/lecture-curriculum.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

/**
 * 강의관리(/admin/lectures) Repository 계층입니다.
 *
 * Supabase `course_lectures` / `lecture_sessions` 테이블을 직접 조회/변경합니다.
 * 서비스 계층(services/*)은 이 파일이 export하는 함수 시그니처만 바라보므로,
 * 추후 스키마가 바뀌어도 이 파일 내부만 수정하면 됩니다.
 */

type LectureRow = Database["public"]["Tables"]["course_lectures"]["Row"];
type SessionRow = Database["public"]["Tables"]["lecture_sessions"]["Row"];
type CourseRow = { id: string; name: string };

const LECTURE_WITH_COURSE_SELECT = `
  id,
  course_id,
  title,
  description,
  thumbnail_file_name,
  is_published,
  created_at,
  course:courses!inner ( id, name )
` as const;

type LectureWithCourseRow = LectureRow & { course: CourseRow };

const SESSION_SELECT =
  "id, lecture_id, session_order, title, duration_minutes, video_url, video_source, video_storage_path, video_file_name, video_duration_seconds, video_uploaded_at, created_at, updated_at, deleted_at" as const;

function toSession(row: SessionRow): LectureSession {
  return {
    id: row.id,
    order: row.session_order,
    title: row.title,
    durationMinutes: row.duration_minutes,
    videoUrl: row.video_url,
    videoSource: row.video_source,
    videoFileName: row.video_file_name,
    videoDurationSeconds: row.video_duration_seconds,
    videoStoragePath: row.video_storage_path,
    videoUploadedAt: row.video_uploaded_at,
  };
}

async function attachSessions(supabase: Awaited<ReturnType<typeof createClient>>, lectureId: string) {
  const { data, error } = await supabase
    .from("lecture_sessions")
    .select(SESSION_SELECT)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .order("session_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as SessionRow[]).map(toSession);
}

function toLecture(row: LectureWithCourseRow, sessions: LectureSession[]): Lecture {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course.name,
    title: row.title,
    description: row.description,
    thumbnailFileName: row.thumbnail_file_name,
    isPublished: row.is_published,
    createdAt: row.created_at,
    sessions,
  };
}

export async function listLectures(): Promise<Lecture[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lectures")
    .select(LECTURE_WITH_COURSE_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as LectureWithCourseRow[];

  return Promise.all(
    rows.map(async (row) => toLecture(row, await attachSessions(supabase, row.id))),
  );
}

export async function findLectureById(lectureId: string): Promise<Lecture | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lectures")
    .select(LECTURE_WITH_COURSE_SELECT)
    .eq("id", lectureId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as unknown as LectureWithCourseRow;
  return toLecture(row, await attachSessions(supabase, row.id));
}

export async function createLectureRecord(
  input: Omit<Lecture, "id" | "createdAt" | "sessions">,
): Promise<Lecture> {
  const supabase = await createClient();

  const insertData: Database["public"]["Tables"]["course_lectures"]["Insert"] = {
    course_id: input.courseId,
    title: input.title,
    description: input.description,
    thumbnail_file_name: input.thumbnailFileName,
    is_published: input.isPublished,
  };

  const { data, error } = await supabase
    .from("course_lectures")
    .insert(insertData)
    .select(LECTURE_WITH_COURSE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toLecture(data as unknown as LectureWithCourseRow, []);
}

export async function updateLectureRecord(
  lectureId: string,
  patch: Partial<Omit<Lecture, "id" | "sessions" | "createdAt">>,
): Promise<Lecture | undefined> {
  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["course_lectures"]["Update"] = {};
  if (patch.courseId !== undefined) updateData.course_id = patch.courseId;
  if (patch.title !== undefined) updateData.title = patch.title;
  if (patch.description !== undefined) updateData.description = patch.description;
  if (patch.thumbnailFileName !== undefined) updateData.thumbnail_file_name = patch.thumbnailFileName;
  if (patch.isPublished !== undefined) updateData.is_published = patch.isPublished;

  const { data, error } = await supabase
    .from("course_lectures")
    .update(updateData)
    .eq("id", lectureId)
    .is("deleted_at", null)
    .select(LECTURE_WITH_COURSE_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return undefined;
  }

  const row = data as unknown as LectureWithCourseRow;
  return toLecture(row, await attachSessions(supabase, row.id));
}

export async function deleteLectureRecord(lectureId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lectures")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", lectureId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function findSessionById(
  lectureId: string,
  sessionId: string,
): Promise<LectureSession | undefined> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lecture_sessions")
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toSession(data as SessionRow) : undefined;
}

export async function addSessionRecord(
  lectureId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<LectureSession | undefined> {
  const supabase = await createClient();

  const { data: lecture, error: lectureError } = await supabase
    .from("course_lectures")
    .select("id")
    .eq("id", lectureId)
    .is("deleted_at", null)
    .maybeSingle();

  if (lectureError) {
    throw new Error(lectureError.message);
  }

  if (!lecture) {
    return undefined;
  }

  const existing = await attachSessions(supabase, lectureId);
  const nextOrder = existing.length + 1;

  const insertData: Database["public"]["Tables"]["lecture_sessions"]["Insert"] = {
    lecture_id: lectureId,
    session_order: nextOrder,
    title,
    duration_minutes: durationMinutes ?? null,
  };

  const { data, error } = await supabase
    .from("lecture_sessions")
    .insert(insertData)
    .select(SESSION_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toSession(data as SessionRow);
}

export async function renameSessionRecord(
  lectureId: string,
  sessionId: string,
  title: string,
  durationMinutes?: number | null,
): Promise<boolean> {
  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["lecture_sessions"]["Update"] = { title };
  if (durationMinutes !== undefined) {
    updateData.duration_minutes = durationMinutes;
  }

  const { data, error } = await supabase
    .from("lecture_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function deleteSessionRecord(
  lectureId: string,
  sessionId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: deleted, error: deleteError } = await supabase
    .from("lecture_sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!deleted) {
    return false;
  }

  const remaining = await attachSessions(supabase, lectureId);
  await Promise.all(
    remaining.map((session, index) =>
      supabase
        .from("lecture_sessions")
        .update({ session_order: index + 1 })
        .eq("id", session.id),
    ),
  );

  return true;
}

export async function updateSessionVideoRecord(
  lectureId: string,
  sessionId: string,
  input: SetLectureSessionVideoInput,
): Promise<LectureSession | undefined> {
  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["lecture_sessions"]["Update"] = {
    video_url: input.videoUrl,
    video_source: input.videoSource,
    video_file_name: input.videoFileName ?? null,
    video_duration_seconds: input.videoDurationSeconds ?? null,
    video_storage_path: input.videoSource === "storage" ? input.videoStoragePath ?? null : null,
    video_uploaded_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("lecture_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .select(SESSION_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toSession(data as SessionRow) : undefined;
}

export async function clearSessionVideoRecord(
  lectureId: string,
  sessionId: string,
): Promise<LectureSession | undefined> {
  const supabase = await createClient();

  const updateData: Database["public"]["Tables"]["lecture_sessions"]["Update"] = {
    video_url: null,
    video_source: "external",
    video_file_name: null,
    video_duration_seconds: null,
    video_storage_path: null,
    video_uploaded_at: null,
  };

  const { data, error } = await supabase
    .from("lecture_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .eq("lecture_id", lectureId)
    .is("deleted_at", null)
    .select(SESSION_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toSession(data as SessionRow) : undefined;
}

/**
 * Storage에 업로드된 영상 오브젝트를 정리합니다. 영상 교체/삭제 시 호출하며,
 * 실패하더라도(권한/네트워크 이슈 등) 신청 흐름 자체를 막지 않도록 에러를 던지지 않습니다.
 */
export async function deleteLectureVideoObject(path: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(LECTURE_VIDEO_BUCKET).remove([path]);

  if (error) {
    console.error(`Failed to delete lecture video object (${path}):`, error.message);
  }
}

export async function moveSessionRecord(
  lectureId: string,
  sessionId: string,
  direction: SessionMoveDirection,
): Promise<boolean> {
  const supabase = await createClient();
  const sessions = await attachSessions(supabase, lectureId);
  const index = sessions.findIndex((session) => session.id === sessionId);

  if (index === -1) {
    return false;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sessions.length) {
    return false;
  }

  const current = sessions[index];
  const target = sessions[targetIndex];

  const { error: errorA } = await supabase
    .from("lecture_sessions")
    .update({ session_order: target.order })
    .eq("id", current.id);

  if (errorA) {
    throw new Error(errorA.message);
  }

  const { error: errorB } = await supabase
    .from("lecture_sessions")
    .update({ session_order: current.order })
    .eq("id", target.id);

  if (errorB) {
    throw new Error(errorB.message);
  }

  return true;
}
