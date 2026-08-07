import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";

/**
 * 학생 학습강의실 성적보기(`src/features/classroom-grades`)와 관리자
 * 성적관리(`src/features/grades`)가 공유하는 단일 계산 규칙입니다.
 * 두 값(가중치/합격 기준)이 달라지면 반드시 함께 수정해 규칙이 어긋나지 않도록 합니다.
 *
 * 민간자격증 LMS는 과제 기능을 사용하지 않으므로 과제 점수는 성적 계산에
 * 반영하지 않습니다(과제 관련 게이팅 없음).
 *
 * **수료 조건: 수료시험 100점 만점에 60점 이상.**
 * 예전에는 시험 60% + 출석 40%를 섞어 총점을 냈지만, 시험 점수가 곧 성적이 되도록
 * 바꿨습니다(20문항 × 5점 = 100점). 진도율은 성적에 섞이지 않고 **시험을 볼 수 있는
 * 자격**(60% 이상)으로만 씁니다 — 그 판정은 classroom-exam.service 가 합니다.
 */
export const ATTENDANCE_WEIGHT_PERCENT = 0;
export const EXAM_WEIGHT_PERCENT = 100;
export const PASS_SCORE_THRESHOLD = 60;

export type GradeLetter = "A" | "B" | "C" | "D" | "F";

export function scoreToGrade(score: number): GradeLetter {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export type GradeCalculationInput = {
  /** 진도율(출석률 역할, %), 0-100 — lecture_progress 기준 실제 진도율 */
  attendanceRate: number;
  /** 시험 점수(%), 0-100. 미응시면 null */
  examPercent: number | null;
};

export type GradeCalculationResult = {
  attendanceScore: number;
  examScore: number;
  totalScore: number;
  grade: GradeLetter;
  isPassed: boolean;
};

export function calculateGrade(input: GradeCalculationInput): GradeCalculationResult {
  // 출석(진도율)은 성적에 섞지 않습니다. 화면 표에서 자리를 지키느라 0으로 둡니다.
  const attendanceScore = 0;
  const examScore = input.examPercent ?? 0;
  const totalScore = examScore;
  const grade = scoreToGrade(totalScore);
  const isPassed = totalScore >= PASS_SCORE_THRESHOLD;

  return { attendanceScore, examScore, totalScore, grade, isPassed };
}

/**
 * 수료여부: 민간자격증 LMS 운영 방식에서는 "합격" 기준(진도율 60%+ 시험 60점 이상)만
 * 충족하면 수강기간이 남아있어도 즉시 수료로 판정합니다. 수강기간(end_date)은 학습
 * 가능 기간/강의 접근 종료 용도로만 사용하고, 수료(자격증 발급 가능 여부) 판정에는
 * 더 이상 영향을 주지 않습니다.
 * 단, 취소/삭제된 수강(learningStatus === "stopped")은 합격 기준을 충족했더라도
 * 수료로 인정하지 않습니다.
 */
export function deriveGradeCompletion(
  learningStatus: EnrollmentLearningStatus,
  isPassed: boolean,
): boolean {
  return learningStatus !== "stopped" && isPassed;
}
