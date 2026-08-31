import { signProtectedMediaUrl } from "@/lib/r2/signed-url";
import { createClient } from "@/lib/supabase/server";

/**
 * 어드민 합격후기 관리 — 학생 후기게시판(course_reviews)의 글을
 * 목록 조회·수정·공개/숨김·삭제합니다.
 *
 * 학생 화면(korhrd/services/course-review.service)과 달리
 * 비공개 글도 보이고, 작성자 이름은 마스킹 없이 그대로 보여줍니다.
 */

export type AdminCourseReview = {
  id: string;
  title: string;
  body: string;
  /** 시드(홍보) 글은 author_name, 학생 글은 회원 이름. 마스킹 없음 */
  authorName: string;
  /** 시드 글(member_id 없음) 여부 — 목록에 표시해 실수로 지우지 않게 합니다 */
  isSeed: boolean;
  courseName: string;
  isPublished: boolean;
  helpfulCount: number;
  photoUrl: string | null;
  createdAt: string;
};

type AdminReviewRow = {
  id: string;
  title: string;
  body: string;
  photo_url: string | null;
  is_published: boolean;
  created_at: string;
  member_id: string | null;
  author_name: string | null;
  helpful_seed_count: number;
  member: { name: string } | null;
  course: { name: string } | null;
};

const ADMIN_REVIEW_SELECT = `
  id, title, body, photo_url, is_published, created_at, member_id, author_name, helpful_seed_count,
  member:members!course_reviews_member_id_fkey ( name ),
  course:courses!course_reviews_course_id_fkey ( name )
` as const;

export async function listAdminCourseReviews(): Promise<AdminCourseReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_reviews")
    .select(ADMIN_REVIEW_SELECT)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as AdminReviewRow[];

  const { data: helpfuls } = await supabase
    .from("course_review_helpfuls")
    .select("review_id");
  const countByReview = new Map<string, number>();
  for (const row of helpfuls ?? []) {
    countByReview.set(row.review_id, (countByReview.get(row.review_id) ?? 0) + 1);
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    authorName: row.author_name ?? row.member?.name ?? "수강생",
    isSeed: row.member_id === null,
    courseName: row.course?.name ?? "",
    isPublished: row.is_published,
    helpfulCount: (countByReview.get(row.id) ?? 0) + (row.helpful_seed_count ?? 0),
    photoUrl: signProtectedMediaUrl(row.photo_url),
    createdAt: row.created_at.slice(0, 10),
  }));
}

export type AdminReviewMutationResult =
  | { success: true; message: string }
  | { success: false; message: string };

/** 후기 추가 모달의 과정 선택지 */
export type ReviewCourseOption = { id: string; name: string };

export async function listReviewCourseOptions(): Promise<ReviewCourseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewCourseOption[];
}

/**
 * 어드민이 후기를 직접 추가합니다 — member_id 없는 시드(홍보용) 글로 들어가며,
 * 목록에는 "홍보용" 배지로 표시됩니다. 작성자 이름은 화면에 그대로 노출됩니다.
 */
export async function createAdminCourseReview(input: {
  courseId: string;
  authorName: string;
  title: string;
  body: string;
  isPublished: boolean;
  /** 자격증 사진 등 첨부 이미지 URL (선택) */
  photoUrl?: string | null;
}): Promise<AdminReviewMutationResult> {
  const title = input.title.trim();
  const body = input.body.trim();
  const authorName = input.authorName.trim();
  if (!input.courseId) return { success: false, message: "과정을 선택해주세요." };
  if (!authorName) return { success: false, message: "작성자 이름을 입력해주세요." };
  if (!title) return { success: false, message: "제목을 입력해주세요." };
  if (!body) return { success: false, message: "내용을 입력해주세요." };

  const supabase = await createClient();
  const { error } = await supabase.from("course_reviews").insert({
    member_id: null,
    author_name: authorName,
    course_id: input.courseId,
    title,
    body,
    is_published: input.isPublished,
    photo_url: input.photoUrl ?? null,
  });

  if (error) return { success: false, message: `등록에 실패했습니다: ${error.message}` };
  return { success: true, message: "후기를 추가했습니다." };
}

export async function updateAdminCourseReview(
  reviewId: string,
  input: { title: string; body: string; isPublished: boolean },
): Promise<AdminReviewMutationResult> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) return { success: false, message: "제목을 입력해주세요." };
  if (!body) return { success: false, message: "내용을 입력해주세요." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_reviews")
    .update({ title, body, is_published: input.isPublished })
    .eq("id", reviewId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, message: `수정에 실패했습니다: ${error.message}` };
  if (!data) return { success: false, message: "후기를 찾을 수 없습니다." };
  return { success: true, message: "후기를 수정했습니다." };
}

export async function deleteAdminCourseReview(
  reviewId: string,
): Promise<AdminReviewMutationResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", reviewId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, message: `삭제에 실패했습니다: ${error.message}` };
  if (!data) return { success: false, message: "후기를 찾을 수 없습니다." };
  return { success: true, message: "후기를 삭제했습니다. 학생 화면에서 사라집니다." };
}
