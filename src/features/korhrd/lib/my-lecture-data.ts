import type { Enrollment } from "@/features/korhrd/lib/types";
import {
  getMyActiveEnrollments,
  getMyPendingEnrollments,
} from "@/features/enrollment-catalog/services/my-enrollments.service";
import { findSubmissionsForEnrollmentAcrossExams } from "@/features/classroom-exams/repositories/classroom-exam.repository";
import { calculateGrade } from "@/features/grades/lib/grade-calculator";
import { createClient } from "@/lib/supabase/server";
import type { CertificateDeliveryStatus } from "@/types/database.types";

/**
 * DB 수강내역 → korhrd 화면이 쓰는 Enrollment 모양으로 옮깁니다.
 *
 * 카드의 배지·문구·버튼은 전부 `myStatus.ts`(전달본의 18가지 경우)가 정하는데,
 * 그 판단에 status 6종 + score + issueDeadline 이 필요합니다. 예전에는
 * learning/ready/expired 세 가지만 채워서 **합격·불합격·발급완료 카드가 아예
 * 나오지 않았습니다.** 지금은 시험 응시기록과 자격증 신청내역까지 읽어 채웁니다.
 *
 *   자격증 신청함            → issued  (발급 신청 완료)
 *   합격(성적관리와 같은 규칙) → pass
 *   응시했으나 미달           → fail
 *   기간 종료                → expired (연장 대상)
 *   진행중 + 진도 60% 이상    → ready
 *   그 외                    → learning
 */
const EXAM_ELIGIBLE_RATE = 60;

/** 합격 후 자격증 발급 신청 기한(일). 화면 안내문과 같은 값입니다. */
const ISSUE_DEADLINE_DAYS = 7;

export type MyLectureData = {
  active: Enrollment[];
  ended: Enrollment[];
  pending: { courseTitle: string; appliedAt: string }[];
  /** 강의실 입장 링크를 만들 때 쓰는 과정명 → 과정코드 */
  courseCodeByName: Record<string, string>;
};

const addDays = (iso: string, days: number) => {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export async function getMyLectureData(memberId: string): Promise<MyLectureData> {
  const [activeRows, pendingRows] = await Promise.all([
    getMyActiveEnrollments(memberId),
    getMyPendingEnrollments(memberId),
  ]);

  const supabase = await createClient();

  // 자격증을 신청한 과정은 카드가 '발급 신청 완료'로 바뀝니다(취소 건은 제외).
  const { data: certRows } = await supabase
    .from("certificate_applications")
    .select("course_id, delivery_status")
    .eq("member_id", memberId)
    .is("deleted_at", null)
    .neq("delivery_status", "canceled");

  const appliedCourseIds = new Set(
    ((certRows ?? []) as { course_id: string | null; delivery_status: CertificateDeliveryStatus }[])
      .map((row) => row.course_id)
      .filter((id): id is string => id !== null),
  );

  const submissionsByEnrollment = await Promise.all(
    activeRows.map((row) => findSubmissionsForEnrollmentAcrossExams(supabase, row.id)),
  );

  const active: Enrollment[] = [];
  const ended: Enrollment[] = [];
  const courseCodeByName: Record<string, string> = {};

  activeRows.forEach((row, index) => {
    const [startDate = "", endDate = ""] = row.periodLabel.split(" ~ ");
    courseCodeByName[row.courseTitle] = row.courseCode;

    const submissions = submissionsByEnrollment[index];
    const graded = submissions.filter((submission) => submission.total_score > 0);

    // 시험 점수(백분율) — 여러 시험을 봤으면 평균입니다. 미응시면 undefined.
    const examPercent =
      graded.length > 0
        ? Math.round(
            graded.reduce((sum, s) => sum + (s.score / s.total_score) * 100, 0) / graded.length,
          )
        : null;

    // 합격 판정은 관리자 성적관리·성적확인 화면과 같은 규칙을 씁니다.
    const grade = calculateGrade({ attendanceRate: row.progressRate, examPercent });

    // 가장 마지막 응시일 — 발급 신청 기한(합격 후 7일)의 기준입니다.
    const lastSubmittedAt = submissions
      .map((s) => s.submitted_at)
      .filter((at): at is string => Boolean(at))
      .sort()
      .at(-1);

    const applied = appliedCourseIds.has(row.courseId);
    const ranOut = row.learningStatus === "ended";

    let status: Enrollment["status"];
    if (applied) {
      status = "issued";
    } else if (ranOut) {
      status = "expired";
    } else if (examPercent !== null && grade.isPassed) {
      status = "pass";
    } else if (examPercent !== null) {
      status = "fail";
    } else {
      status = row.progressRate >= EXAM_ELIGIBLE_RATE ? "ready" : "learning";
    }

    const enrollment: Enrollment = {
      course: row.courseTitle,
      status,
      progress: Math.round(row.progressRate),
      startDate,
      endDate,
      // 카드 배지에 쓰는 점수는 시험 백분율이 아니라 **총점**입니다.
      // 시험 성적 확인 화면(/exam/[course]/result)이 보여주는 값과 같아야
      // 두 화면이 서로 다른 점수를 말하지 않습니다.
      ...(examPercent !== null ? { score: grade.totalScore } : {}),
      ...(grade.isPassed && lastSubmittedAt
        ? {
            passedAt: lastSubmittedAt.slice(0, 10),
            issueDeadline: addDays(lastSubmittedAt, ISSUE_DEADLINE_DAYS),
          }
        : {}),
    };

    // 발급까지 끝난 과정도 '수강종료' 탭에서 보는 것이 화면 구성과 맞습니다.
    if (ranOut || status === "issued") ended.push(enrollment);
    else active.push(enrollment);
  });

  return {
    active,
    ended,
    pending: pendingRows.map((row) => ({
      courseTitle: row.courseTitle,
      appliedAt: row.appliedAt,
    })),
    courseCodeByName,
  };
}
