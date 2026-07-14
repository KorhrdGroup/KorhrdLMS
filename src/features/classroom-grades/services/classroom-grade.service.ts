import {
  getClassroomCourseExams,
  getEnrollmentExamPercent,
} from "@/features/classroom-exams/services/classroom-exam.service";
import {
  getClassroomCourseProgressRate,
  resolveClassroomAccess,
} from "@/features/classroom-lectures/services/classroom-lecture.service";
import { deriveLearningStatus } from "@/features/enrollments/lib/enrollment-mock-signals";
import { PAYMENT_STATUS_LABELS } from "@/features/enrollments/constants";
import { calculateGrade, deriveGradeCompletion } from "@/features/grades/lib/grade-calculator";
import type {
  ClassroomGradeCertificationStatus,
  ClassroomGradeData,
  ClassroomGradeExamRow,
} from "@/features/classroom-grades/types/classroom-grade.types";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus, PaymentStatus } from "@/types/database.types";

const CERTIFICATION_STATUS_LABEL: Record<ClassroomGradeCertificationStatus, string> = {
  completed: "수료",
  eligible: "수료가능",
  not_eligible: "수료불가",
};

type EnrollmentDetailRow = {
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  payment_status: PaymentStatus;
};

/**
 * 학생 학습강의실 '성적' 화면을 위한 성적 데이터를 조회합니다.
 *
 * `resolveClassroomAccess`로 로그인한 학생이 해당 과정에 confirmed 상태로
 * 수강신청했는지 확인한 뒤에만 본인 성적을 반환합니다(승인되지 않은 과정,
 * 타 학생 성적, 존재하지 않는 과정은 조회 불가). 계산 규칙은 관리자
 * 성적관리(`src/features/grades`)와 동일한 `calculateGrade`를 사용합니다.
 */
export async function getClassroomCourseGrade(
  memberId: string,
  courseCode: string,
): Promise<ClassroomGradeData | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const { data: enrollmentRow, error } = await supabase
    .from("enrollments")
    .select("start_date, end_date, status, payment_status")
    .eq("id", access.enrollmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!enrollmentRow) {
    return null;
  }

  const row = enrollmentRow as EnrollmentDetailRow;

  const [progressRate, examPercent, examList] = await Promise.all([
    getClassroomCourseProgressRate(access.enrollmentId, access.course.id),
    getEnrollmentExamPercent(access.enrollmentId),
    getClassroomCourseExams(memberId, courseCode),
  ]);

  const result = calculateGrade({ attendanceRate: progressRate, examPercent });
  const learningStatus = deriveLearningStatus(row.status, row.end_date);
  const isCompleted = deriveGradeCompletion(learningStatus, result.isPassed);

  const certificationStatus: ClassroomGradeCertificationStatus = isCompleted
    ? "completed"
    : result.isPassed
      ? "eligible"
      : "not_eligible";

  const exams: ClassroomGradeExamRow[] = (examList?.exams ?? []).map((exam) => {
    const submitted = exam.score !== null && exam.totalScore !== null;
    const scorePercent =
      submitted && exam.totalScore! > 0 ? Math.round((exam.score! / exam.totalScore!) * 100) : null;

    return {
      id: exam.id,
      title: exam.title,
      // 민간자격증 LMS는 시험별 응시기간이 아닌 학생의 수강기간을 응시 가능 기간으로 사용합니다.
      periodLabel: `${row.start_date} ~ ${row.end_date}`,
      submitted,
      scorePercentLabel: scorePercent != null ? `${scorePercent}%` : "미응시",
      isPassed: exam.isPassed,
    };
  });

  return {
    courseTitle: access.course.name,
    summary: {
      periodLabel: `${row.start_date} ~ ${row.end_date}`,
      subjectName: access.course.name,
      paymentStatusLabel: PAYMENT_STATUS_LABELS[row.payment_status] ?? row.payment_status,
      progressRate,
      examPercent,
      examScoreLabel: examPercent != null ? `${examPercent}점` : "미응시",
      attendanceScore: result.attendanceScore,
      examScore: result.examScore,
      totalScore: result.totalScore,
      grade: result.grade,
      isPassed: result.isPassed,
      certificationStatus,
      certificationStatusLabel: CERTIFICATION_STATUS_LABEL[certificationStatus],
    },
    exams,
  };
}
