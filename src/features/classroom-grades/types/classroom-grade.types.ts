import type { GradeLetter } from "@/features/grades/lib/grade-calculator";

/**
 * 학생 학습강의실 '성적' 화면(`/classroom/[slug]/grades`) 타입 정의입니다.
 *
 * 관리자 성적관리(`src/features/grades`)와 동일한 계산 규칙
 * (`calculateGrade`)을 사용해 학생 본인의 성적만 조회합니다.
 */
export type ClassroomGradeCertificationStatus = "completed" | "eligible" | "not_eligible";

export type ClassroomGradeExamRow = {
  id: string;
  title: string;
  periodLabel: string;
  submitted: boolean;
  scorePercentLabel: string;
  isPassed: boolean | null;
};

export type ClassroomGradeSummary = {
  periodLabel: string;
  subjectName: string;
  paymentStatusLabel: string;
  /** 진도율(lecture_progress 기준 실제 완료 차시 비율, %) */
  progressRate: number;
  examPercent: number | null;
  examScoreLabel: string;
  attendanceScore: number;
  examScore: number;
  totalScore: number;
  grade: GradeLetter;
  /** 합격여부: 총점 60점 + 진도율 60% + 시험 60점 기준 충족 여부 */
  isPassed: boolean;
  /** 수료 가능 여부: 수강 종료 전이라도 현재 기준 합격 조건 충족 시 "eligible" */
  certificationStatus: ClassroomGradeCertificationStatus;
  certificationStatusLabel: string;
};

export type ClassroomGradeData = {
  courseTitle: string;
  summary: ClassroomGradeSummary;
  exams: ClassroomGradeExamRow[];
};
