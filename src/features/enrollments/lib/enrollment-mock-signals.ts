import type { EnrollmentStatus } from "@/types/database.types";

import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";

/**
 * 진도율/시험/과제/담당교수는 아직 실제 학습로그·시험관리·과제관리가
 * 회원(member_id) 단위로 연동되지 않아, enrollment/course id를 시드로 사용하는
 * 결정적(deterministic) Mock 값으로 대체합니다.
 * 같은 id는 항상 같은 값을 반환하므로 새로고침해도 화면이 흔들리지 않습니다.
 * 추후 실제 데이터 연동 시 이 파일의 함수 구현부만 교체하면 됩니다.
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const MOCK_INSTRUCTOR_NAMES = [
  "김민준 교수",
  "이서연 교수",
  "박도윤 교수",
  "최지우 교수",
  "정하은 교수",
  "강시우 교수",
] as const;

const EXAM_STATUS_LABELS = ["미응시", "응시완료", "채점중"] as const;
const ASSIGNMENT_STATUS_LABELS = ["미제출", "제출완료", "채점중"] as const;

export function deriveLearningStatus(
  status: EnrollmentStatus,
  endDate: string,
): EnrollmentLearningStatus {
  if (status === "canceled" || status === "deleted") {
    return "stopped";
  }

  const today = new Date().toISOString().slice(0, 10);
  if (endDate < today) {
    return "ended";
  }

  return "in_progress";
}

export function getMockInstructorName(courseId: string): string {
  const index = hashSeed(`instructor:${courseId}`) % MOCK_INSTRUCTOR_NAMES.length;
  return MOCK_INSTRUCTOR_NAMES[index];
}

export function getMockProgressRate(
  enrollmentId: string,
  learningStatus: EnrollmentLearningStatus,
): number {
  if (learningStatus === "ended") {
    return 80 + (hashSeed(`progress:${enrollmentId}`) % 21);
  }

  if (learningStatus === "stopped") {
    return hashSeed(`progress:${enrollmentId}`) % 50;
  }

  return 10 + (hashSeed(`progress:${enrollmentId}`) % 81);
}

export function getMockExamStatus(
  enrollmentId: string,
  learningStatus: EnrollmentLearningStatus,
): string {
  if (learningStatus === "in_progress") {
    return EXAM_STATUS_LABELS[hashSeed(`exam:${enrollmentId}`) % 2];
  }

  const index = hashSeed(`exam:${enrollmentId}`) % EXAM_STATUS_LABELS.length;
  return EXAM_STATUS_LABELS[index];
}

export function getMockAssignmentStatus(
  enrollmentId: string,
  learningStatus: EnrollmentLearningStatus,
): string {
  if (learningStatus === "in_progress") {
    return ASSIGNMENT_STATUS_LABELS[hashSeed(`assignment:${enrollmentId}`) % 2];
  }

  const index =
    hashSeed(`assignment:${enrollmentId}`) % ASSIGNMENT_STATUS_LABELS.length;
  return ASSIGNMENT_STATUS_LABELS[index];
}

export function getMockCompletion(
  learningStatus: EnrollmentLearningStatus,
  progressRate: number,
  examStatus: string,
): boolean {
  return (
    learningStatus === "ended" && progressRate >= 80 && examStatus === "응시완료"
  );
}
