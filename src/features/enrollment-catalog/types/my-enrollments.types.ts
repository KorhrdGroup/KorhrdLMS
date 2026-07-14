/** 학생이 신청한(아직 관리자 승인 전) 과정 1건 — `/classroom` "수강신청중인 과목" 탭에서 사용합니다. */
export type MyPendingEnrollment = {
  id: string;
  courseId: string;
  courseTitle: string;
  batch: string | null;
  year: number | null;
  appliedAt: string;
};

/**
 * 학습상태(수강중/수강완료)는 실 컬럼이 아니라 status="confirmed" + end_date를
 * 기준으로 매번 파생시키는 값입니다. `enrollments/lib/enrollment-mock-signals`의
 * `deriveLearningStatus`와 동일한 규칙을 사용합니다.
 */
export type ClassroomLearningStatus = "in_progress" | "ended";

/** 관리자 승인(confirmed)까지 완료되어 학습 가능한 과정 1건 — `/classroom` "수강중"/"수강완료" 탭에서 사용합니다. */
export type MyActiveEnrollment = {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  periodLabel: string;
  managerName: string | null;
  learningStatus: ClassroomLearningStatus;
  /** lecture_progress 기준 실제 진도율(%) = 완료 차시 수 ÷ 전체 게시 차시 수 × 100. */
  progressRate: number;
};
