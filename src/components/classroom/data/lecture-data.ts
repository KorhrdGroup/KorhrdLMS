import { IN_PROGRESS_COURSES } from "@/components/classroom/data/classroom-data";

/**
 * Mock data for the 강의 목록/출석 (lecture list & attendance) page shown
 * after clicking "강의 시청하기" from the 학습강의실 dashboard.
 *
 * Field names line up with the tables we expect once this is wired to
 * Supabase, so swapping mock arrays for real queries later is a drop-in
 * replacement:
 *
 *   enrollments       - id, user_id, course_id, status
 *   lectures          - id, course_id, week, order, title
 *   lecture_progress  - lecture_id, enrollment_id, video_progress,
 *                       attendance_status, completed_at
 */

export type LectureAttendanceStatus = "not-started" | "completed";

export type Lecture = {
  id: string;
  week: number;
  order: number;
  title: string;
  videoProgress: number;
  attendanceStatus: LectureAttendanceStatus;
  completedAt: string | null;
};

export type CourseLectureInfo = {
  id: string;
  slug: string;
  title: string;
  progress: number;
  attendanceRate: number;
};

const CAREGIVER_LECTURE_TITLES = [
  "1강. 간병사의 역할과 윤리",
  "2강. 질병의 이해",
  "3강. 응급상황 대처와 안전관리",
  "4강. 위생과 감염관리",
  "5강. 의사소통 및 관계형성",
  "6강. 신체 청결 돕기",
  "7강. 식사 돕기",
  "8강. 배변 돕기",
  "9강. 옷 갈아입히기와 침상정리",
  "10강. 체위변경과 이동 돕기",
  "11강. 치매환자 간병",
  "12강. 뇌졸중(중풍) 환자 간병",
  "13강. 와상환자 간병",
  "14강. 임종환자 간병",
  "15강. 만성질환 환자 간병",
  "16강. 투약 돕기 및 주의사항",
  "17강. 신체 계측 및 활력징후 측정",
  "18강. 요양병원 및 재가 간병",
  "19강. 간병 기록 및 문서 작성법",
  "20강. 간병사의 자기관리 및 직업윤리",
];

const LECTURE_TITLES_BY_SLUG: Record<string, string[]> = {
  caregiver: CAREGIVER_LECTURE_TITLES,
};

function buildGenericLectureTitles(courseTitle: string): string[] {
  return Array.from({ length: 20 }, (_, index) => `${index + 1}강. ${courseTitle} 학습 내용 ${index + 1}`);
}

export function getCourseLectureInfo(slug: string): CourseLectureInfo | null {
  const course = IN_PROGRESS_COURSES.find((item) => item.slug === slug);
  if (!course) return null;

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    progress: course.progressRate,
    attendanceRate: 0,
  };
}

export function getCourseLectures(slug: string): Lecture[] {
  const course = IN_PROGRESS_COURSES.find((item) => item.slug === slug);
  const titles = LECTURE_TITLES_BY_SLUG[slug] ?? buildGenericLectureTitles(course?.title ?? slug);

  return titles.map((title, index) => ({
    id: `${slug}-lec-${index + 1}`,
    week: 1,
    order: index + 1,
    title,
    videoProgress: 0,
    attendanceStatus: "not-started" as LectureAttendanceStatus,
    completedAt: null,
  }));
}
