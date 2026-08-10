import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";

/**
 * 학생 학습강의실 성적보기(`src/features/classroom-grades`)와 관리자
 * 성적관리(`src/features/grades`)가 공유하는 단일 계산 규칙입니다.
 * 두 값(가중치/합격 기준)이 달라지면 반드시 함께 수정해 규칙이 어긋나지 않도록 합니다.
 *
 * 민간자격증 LMS는 과제 기능을 사용하지 않으므로 과제 점수는 성적 계산에
 * 반영하지 않습니다(과제 관련 게이팅 없음).
 *
 * **수료 조건: 출석 40% + 시험 60% 가중 합산 총점 60점 이상.**
 * 진도율(출석률)을 40%, 수료시험 점수를 60% 비중으로 섞어 총점을 낸다.
 * 진도율은 시험 응시 자격(60% 이상)으로도 쓰이며, 그 판정은
 * classroom-exam.service 가 한다.
 */
export const ATTENDANCE_WEIGHT_PERCENT = 40;
export const EXAM_WEIGHT_PERCENT = 60;
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
  const attendanceScore = Math.round(input.attendanceRate * (ATTENDANCE_WEIGHT_PERCENT / 100));
  const rawExam = input.examPercent ?? 0;
  const examScore = Math.round(rawExam * (EXAM_WEIGHT_PERCENT / 100));
  const totalScore = attendanceScore + examScore;
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
