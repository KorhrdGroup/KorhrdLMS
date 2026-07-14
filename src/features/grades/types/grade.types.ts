import type { GradeCalculationResult, GradeLetter } from "@/features/grades/lib/grade-calculator";
import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";

export type { GradeLetter, GradeCalculationResult };

export type GradeListItem = GradeCalculationResult & {
  enrollmentId: string;
  member: {
    id: string;
    name: string;
    loginId: string;
  };
  course: {
    id: string;
    name: string;
  };
  instructorName: string;
  learningStatus: EnrollmentLearningStatus;
  attendanceRate: number;
  examPercent: number | null;
  assignmentScore: number | null;
  /** 수료여부: 합격 기준(진도율·시험 점수) 충족 시 "수료"로 판정합니다(수강기간 종료 여부 무관). */
  isCompleted: boolean;
};

export type GradeDetail = GradeListItem & {
  startDate: string;
  endDate: string;
};

export type GetGradeDetailResult =
  | { success: true; detail: GradeDetail }
  | { success: false; message: string };

export type GradeAttendanceUpdateInput = {
  attendanceRate: number;
};

export type GradeAttendanceUpdateResult =
  | { success: true; detail: GradeDetail }
  | { success: false; message: string; field?: keyof GradeAttendanceUpdateInput };

export type GradeFilterOption = GradeLetter | "all";
export type PassFilterOption = "all" | "passed" | "failed";
