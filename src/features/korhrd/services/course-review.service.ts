import { computeCompletionEligibility } from "@/features/completion-certificates/lib/completion-eligibility";
import { createClient } from "@/lib/supabase/server";

/**
 * 합격후기 조회·작성.
 *
 * 화면(전달본 Review 타입)은 과정을 "이름"으로 다루고 DB는 id로 다루므로
 * 이 계층에서 변환합니다. 작성자 이름은 목록에 마스킹해서 내려갑니다.
 */
export type CourseReviewItem = {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  course: string;
  alsoCourses: string[];
  helpful: number;
  helpfulByMe: boolean;
  photo?: string;
  /** 본인 글이면 수정 버튼을 보여주기 위해 내려줍니다 */
  mine: boolean;
};

/** "홍길동" → "홍*동" — 가운데 글자를 가립니다. 두 글자면 뒷글자를 가립니다. */
function maskName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 1) return trimmed;
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed.at(-1)}`;
}

type ReviewRow = {
  id: string;
  title: string;
  body: string;
  photo_url: string | null;
  also_course_ids: string[];
  created_at: string;
  member_id: string | null;
  /** 시드(홍보)용 후기의 하드코딩 작성자 이름 — 있으면 회원 이름 대신 씁니다. */
  author_name: string | null;
  member: { name: string } | null;
  course: { id: string; name: string } | null;
};

// members는 course_review_helpfuls를 통해서도 연결돼 경로가 모호해집니다.
// 어떤 외래키로 이어붙일지 제약 이름으로 못박습니다.
const REVIEW_SELECT = `
  id, title, body, photo_url, also_course_ids, created_at, member_id, author_name,
  member:members!course_reviews_member_id_fkey ( name ),
  course:courses!course_reviews_course_id_fkey ( id, name )
` as const;

export async function listCourseReviews(options?: {
  courseName?: string;
  viewerId?: string;
}): Promise<CourseReviewItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_reviews")
    .select(REVIEW_SELECT)
    .is("deleted_at", null)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as ReviewRow[];

  // 함께 수강한 과정 이름을 한 번에 조회합니다.
  const alsoIds = [...new Set(rows.flatMap((row) => row.also_course_ids ?? []))];
  const nameById = new Map<string, string>();
  if (alsoIds.length > 0) {
    const { data: courses } = await supabase.from("courses").select("id, name").in("id", alsoIds);
    for (const course of courses ?? []) nameById.set(course.id, course.name);
  }

  // 도움됐어요 수 + 내가 눌렀는지.
  const { data: helpfuls } = await supabase
    .from("course_review_helpfuls")
    .select("review_id, member_id");
  const countByReview = new Map<string, number>();
  const mineByReview = new Set<string>();
  for (const row of helpfuls ?? []) {
    countByReview.set(row.review_id, (countByReview.get(row.review_id) ?? 0) + 1);
    if (options?.viewerId && row.member_id === options.viewerId) mineByReview.add(row.review_id);
  }

  return rows
    .filter((row) => !options?.courseName || row.course?.name === options.courseName)
    .map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      author: maskName(row.author_name ?? row.member?.name ?? "수강생"),
      date: row.created_at.slice(0, 10),
      course: row.course?.name ?? "",
      alsoCourses: (row.also_course_ids ?? [])
        .map((id) => nameById.get(id))
        .filter((name): name is string => Boolean(name)),
      helpful: countByReview.get(row.id) ?? 0,
      helpfulByMe: mineByReview.has(row.id),
      photo: row.photo_url ?? undefined,
      mine: options?.viewerId === row.member_id,
    }));
}

export async function getCourseReview(
  id: string,
  viewerId?: string,
): Promise<CourseReviewItem | null> {
  const all = await listCourseReviews({ viewerId });
  return all.find((review) => review.id === id) ?? null;
}

/** 후기를 쓸 수 있는 과정 = 수료(합격)하고 **자격증 발급신청까지 마친** 과정.
    이미 쓴 과정은 alreadyWritten으로 표시합니다. */
export type ReviewableCourse = {
  courseId: string;
  courseTitle: string;
  alreadyWritten: boolean;
  reviewId: string | null;
};

export async function listReviewableCourses(memberId: string): Promise<ReviewableCourse[]> {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, end_date, course:courses!inner ( id, name )")
    .eq("member_id", memberId)
    .eq("status", "confirmed")
    .is("deleted_at", null);

  const { data: written } = await supabase
    .from("course_reviews")
    .select("id, course_id")
    .eq("member_id", memberId)
    .is("deleted_at", null);
  const reviewByCourse = new Map((written ?? []).map((row) => [row.course_id, row.id]));

  // 자격증 발급신청까지 마친 과정만 후기 작성 대상입니다 (2026-08-11 운영 규칙).
  const { data: certApps } = await supabase
    .from("certificate_applications")
    .select("course_id")
    .eq("member_id", memberId)
    .is("deleted_at", null);
  const appliedCourseIds = new Set(
    (certApps ?? []).map((row) => row.course_id).filter(Boolean),
  );

  const rows = (enrollments ?? []) as unknown as {
    id: string;
    status: string;
    end_date: string;
    course: { id: string; name: string };
  }[];

  const result: ReviewableCourse[] = [];
  for (const row of rows) {
    const eligibility = await computeCompletionEligibility(
      row.id,
      row.course.id,
      row.status as never,
      row.end_date,
    );
    if (!eligibility.isCompleted) continue;
    if (!appliedCourseIds.has(row.course.id)) continue;
    result.push({
      courseId: row.course.id,
      courseTitle: row.course.name,
      alreadyWritten: reviewByCourse.has(row.course.id),
      reviewId: reviewByCourse.get(row.course.id) ?? null,
    });
  }
  return result;
}
