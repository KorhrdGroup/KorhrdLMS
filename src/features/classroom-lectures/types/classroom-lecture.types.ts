/**
 * 학생 학습강의실(`/classroom/[courseCode]`)에서 사용하는 차시 목록/상세 타입입니다.
 * 진도/출석은 `lecture_progress` 테이블(`enrollment_id` + `lecture_session_id` 단위)을
 * 기준으로 계산합니다.
 */
export type ClassroomLectureStatus = "not_started" | "in_progress" | "completed";

export type ClassroomLectureSession = {
  id: string;
  /** 과정 내 전체 차시를 순서대로 매긴 표시번호(=상세 페이지 라우트 파라미터로도 사용). */
  order: number;
  title: string;
  durationMinutes: number | null;
  status: ClassroomLectureStatus;
  /** 재생 가능한 영상 URL(Supabase Storage 공개 URL 또는 외부 URL). 미등록 시 null. */
  videoUrl?: string | null;
  /** 영상 실제 길이(초). 시청 진도율(%) 계산 기준입니다. */
  videoDurationSeconds?: number | null;
  /** 현재까지 기록된 시청 진도율(%). 상세 화면에서만 채워집니다. */
  videoProgressPercent?: number;
  /** "이어보기"를 위한 마지막 재생 위치(초). 상세 화면에서만 채워집니다. */
  resumePositionSeconds?: number;
};

export type ClassroomCourseLectures = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  sessions: ClassroomLectureSession[];
};

export type ClassroomLectureDetail = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  enrollmentId: string;
  session: ClassroomLectureSession;
  prevOrder: number | null;
  nextOrder: number | null;
};
