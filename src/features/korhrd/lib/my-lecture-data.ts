import type { Enrollment } from "@/features/korhrd/lib/types";
import {
  getMyActiveEnrollments,
  getMyPendingEnrollments,
} from "@/features/enrollment-catalog/services/my-enrollments.service";

/**
 * DB 수강내역 → korhrd 화면이 쓰는 Enrollment 모양으로 옮깁니다.
 *
 * 전달본 화면(MyCard·myStatus)은 자체 상태값(learning/ready/pass/…)을 쓰는데
 * 우리 DB는 승인 상태(pending/confirmed) + 진도율 + 기간만 갖고 있습니다.
 * 시험 점수·자격증 발급 이력은 아직 이 경로로 조회하지 않으므로,
 * 확실히 판단 가능한 것만 매핑합니다:
 *   진행중 + 진도율 60% 미만 → learning (학습중)
 *   진행중 + 진도율 60% 이상 → ready   (시험 응시 가능)
 *   기간 종료                → expired (기간 만료 · 연장 대상)
 * 시험/발급 상태는 그 기능을 붙일 때 함께 채웁니다.
 */
const EXAM_ELIGIBLE_RATE = 60;

export type MyLectureData = {
  active: Enrollment[];
  ended: Enrollment[];
  pending: { courseTitle: string; appliedAt: string }[];
  /** 강의실 입장 링크를 만들 때 쓰는 과정명 → 과정코드 */
  courseCodeByName: Record<string, string>;
};

export async function getMyLectureData(memberId: string): Promise<MyLectureData> {
  const [activeRows, pendingRows] = await Promise.all([
    getMyActiveEnrollments(memberId),
    getMyPendingEnrollments(memberId),
  ]);

  const active: Enrollment[] = [];
  const ended: Enrollment[] = [];
  const courseCodeByName: Record<string, string> = {};

  for (const row of activeRows) {
    const [startDate = "", endDate = ""] = row.periodLabel.split(" ~ ");
    courseCodeByName[row.courseTitle] = row.courseCode;

    const enrollment: Enrollment = {
      course: row.courseTitle,
      status:
        row.learningStatus === "ended"
          ? "expired"
          : row.progressRate >= EXAM_ELIGIBLE_RATE
            ? "ready"
            : "learning",
      progress: Math.round(row.progressRate),
      startDate,
      endDate,
    };

    if (row.learningStatus === "ended") ended.push(enrollment);
    else active.push(enrollment);
  }

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
