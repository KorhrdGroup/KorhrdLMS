/**
 * Mock data for 학습강의실 > 공지사항 (per-course notices).
 *
 * Mirrors the shape a future `course_notices` table would take:
 *   id, course_id, title, content, created_at, created_by
 * so swapping this module for a Supabase query later is a drop-in
 * replacement for the pages that consume it.
 */
export type CourseNotice = {
  id: string;
  seq: number;
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
};

/**
 * Toggle to `true` to preview the list/detail UI with a sample notice while
 * developing/QA-ing this page. Keep `false` to match the real LMS default,
 * which shows "등록된 게시물이 없습니다." until an admin actually posts one.
 */
const SHOW_SAMPLE_NOTICE = false;

const SAMPLE_NOTICE: CourseNotice = {
  id: "1",
  seq: 1,
  title: "간병사 시험 일정 안내",
  content: "시험 일정이 변경되었습니다.",
  createdAt: "2026-07-02",
  createdBy: "관리자",
};

const COURSE_NOTICES_BY_SLUG: Record<string, CourseNotice[]> = SHOW_SAMPLE_NOTICE
  ? { caregiver: [SAMPLE_NOTICE] }
  : {};

export function getCourseNotices(slug: string): CourseNotice[] {
  return COURSE_NOTICES_BY_SLUG[slug] ?? [];
}

export function getCourseNotice(slug: string, id: string): CourseNotice | null {
  return getCourseNotices(slug).find((notice) => notice.id === id) ?? null;
}
