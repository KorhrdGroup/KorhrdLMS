import { getEnrollmentExamPercent } from "@/features/classroom-exams/services/classroom-exam.service";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { deriveLearningStatus } from "@/features/enrollments/lib/enrollment-mock-signals";
import type { EnrollmentLearningStatus } from "@/features/enrollments/types/enrollment.types";
import { calculateGrade, deriveGradeCompletion } from "@/features/grades/lib/grade-calculator";
import { getAttendanceOverride } from "@/features/grades/repositories/grade.repository";
import type { EnrollmentStatus } from "@/types/database.types";

/**
 * 수료 판정은 성적관리(`src/features/grades`)의 계산 규칙을 그대로 재사용해
 * "성적관리에서 수료로 표시된 회원만 수료증 발급 대상이 된다"는 일관성을
 * 유지합니다. (실제 진도율/시험 점수 + 관리자 출석점수 보정값 포함)
 *
 * 학습강의실 수료증 화면(`src/features/classroom-certificates`)의 조건 충족
 * 현황 표시를 위해 진도율/시험점수/합격여부도 함께 반환합니다.
 */
export type EligibilityResult = {
  learningStatus: EnrollmentLearningStatus;
  /** 진도율(%) — lecture_progress 기준 실제 진도율(관리자 보정값 포함) */
  progressRate: number;
  /** 시험 백분율 점수. 미응시면 null */
  examPercent: number | null;
  /** 합격여부: 총점 60점 + 진도율 60% + 시험 60점 기준 충족 여부(수강기간 종료 여부 무관) */
  isPassed: boolean;
  /**
   * 수료여부: 합격 기준(진도율+시험)만 충족하면 true입니다. 민간자격증 LMS는
   * 수강기간이 남아있어도 즉시 수료·자격증 발급 신청이 가능해야 하므로, 수강기간
   * 종료(learningStatus === "ended") 여부는 더 이상 조건에 포함하지 않습니다.
   * 다만 취소/삭제된 수강(learningStatus === "stopped")은 수료로 인정하지 않습니다.
   */
  isCompleted: boolean;
};

export async function computeCompletionEligibility(
  enrollmentId: string,
  courseId: string,
  status: EnrollmentStatus,
  endDate: string,
): Promise<EligibilityResult> {
  const learningStatus = deriveLearningStatus(status, endDate);
  const progressRate =
    getAttendanceOverride(enrollmentId) ??
    (await getClassroomCourseProgressRate(enrollmentId, courseId));
  const examPercent = await getEnrollmentExamPercent(enrollmentId);

  const result = calculateGrade({ attendanceRate: progressRate, examPercent });

  return {
    learningStatus,
    progressRate,
    examPercent,
    isPassed: result.isPassed,
    isCompleted: deriveGradeCompletion(learningStatus, result.isPassed),
  };
}
