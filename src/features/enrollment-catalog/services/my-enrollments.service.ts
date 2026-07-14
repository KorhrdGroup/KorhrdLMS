import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import type {
  MyActiveEnrollment,
  MyPendingEnrollment,
} from "@/features/enrollment-catalog/types/my-enrollments.types";
import { deriveLearningStatus } from "@/features/enrollments/lib/enrollment-mock-signals";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/types/database.types";

const MY_PENDING_ENROLLMENT_SELECT = `
  id,
  batch,
  year,
  application_date,
  created_at,
  course:courses!inner (
    id,
    name
  )
` as const;

type PendingEnrollmentRow = {
  id: string;
  batch: string | null;
  year: number | null;
  application_date: string | null;
  created_at: string;
  course: { id: string; name: string };
};

/**
 * 로그인한 학생 본인이 신청했지만 아직 관리자 승인(confirmed) 전인 과정 목록을 조회합니다.
 * `/classroom` "수강신청중인 과목" 탭에서 사용합니다.
 */
export async function getMyPendingEnrollments(memberId: string): Promise<MyPendingEnrollment[]> {
  if (!memberId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(MY_PENDING_ENROLLMENT_SELECT)
    .eq("member_id", memberId)
    .eq("status", "pending")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as PendingEnrollmentRow[]).map((row) => ({
    id: row.id,
    courseId: row.course.id,
    courseTitle: row.course.name,
    batch: row.batch,
    year: row.year,
    appliedAt: row.application_date ?? row.created_at.slice(0, 10),
  }));
}

const MY_ACTIVE_ENROLLMENT_SELECT = `
  id,
  start_date,
  end_date,
  status,
  manager_name,
  course:courses!inner (
    id,
    code,
    name
  )
` as const;

type ActiveEnrollmentRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: EnrollmentStatus;
  manager_name: string | null;
  course: { id: string; code: string; name: string };
};

/**
 * 로그인한 학생 본인이 관리자 승인(confirmed)까지 완료해 학습이 가능한 과정 목록을 조회합니다.
 * `/classroom` "수강중인 과목"/"수강완료 과목" 탭에서 사용하며, 두 탭의 구분은
 * `learningStatus`(진행중/종료 여부)로 판단합니다.
 */
export async function getMyActiveEnrollments(memberId: string): Promise<MyActiveEnrollment[]> {
  if (!memberId.trim()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(MY_ACTIVE_ENROLLMENT_SELECT)
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as ActiveEnrollmentRow[];

  return Promise.all(
    rows.map(async (row) => {
      const learningStatus = deriveLearningStatus(row.status, row.end_date);
      const progressRate = await getClassroomCourseProgressRate(row.id, row.course.id);

      return {
        id: row.id,
        courseId: row.course.id,
        courseCode: row.course.code,
        courseTitle: row.course.name,
        periodLabel: `${row.start_date} ~ ${row.end_date}`,
        managerName: row.manager_name,
        // status가 항상 "confirmed"이므로 deriveLearningStatus는 "in_progress" | "ended"만 반환합니다.
        learningStatus: learningStatus === "ended" ? "ended" : "in_progress",
        // lecture_progress 기준 실제 진도율(완료 차시 수 ÷ 전체 게시 차시 수).
        progressRate,
      };
    }),
  );
}
