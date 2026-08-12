"use server";

import { revalidatePath } from "next/cache";

import { listReviewableCourses } from "@/features/korhrd/services/course-review.service";
import { getMockableStudentMember } from "@/lib/mock-auth-server";
import { createClient } from "@/lib/supabase/server";

export type ReviewMutationResult =
  | { success: true; reviewId: string }
  | { success: false; message: string };

export type SubmitReviewInput = {
  /** 수정 시에만 채웁니다 */
  reviewId?: string;
  courseId: string;
  title: string;
  body: string;
  alsoCourseIds: string[];
  photoUrl?: string;
};

/**
 * 합격후기 작성·수정.
 *
 * 작성 자격(수료·합격)은 서버에서 다시 확인합니다 — 클라이언트가 임의의
 * courseId를 보내도 통과하지 않습니다. 과정당 1건 규칙은 DB 유니크 인덱스가
 * 최종적으로 막습니다.
 */
export async function submitCourseReviewAction(
  input: SubmitReviewInput,
): Promise<ReviewMutationResult> {
  const member = await getMockableStudentMember();
  if (!member) {
    return { success: false, message: "로그인이 필요합니다." };
  }

  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) {
    return { success: false, message: "제목과 내용을 모두 입력해주세요." };
  }

  const reviewable = await listReviewableCourses(member.id);
  const target = reviewable.find((course) => course.courseId === input.courseId);
  if (!target) {
    return { success: false, message: "합격한 과정에 대해서만 후기를 작성할 수 있습니다." };
  }

  // 함께 수강한 과정도 본인이 수료한 과정만 허용합니다.
  const allowedIds = new Set(reviewable.map((course) => course.courseId));
  const alsoCourseIds = input.alsoCourseIds.filter(
    (id) => id !== input.courseId && allowedIds.has(id),
  );

  const supabase = await createClient();

  if (input.reviewId) {
    const { data, error } = await supabase
      .from("course_reviews")
      .update({
        course_id: input.courseId,
        title,
        body,
        also_course_ids: alsoCourseIds,
        ...(input.photoUrl ? { photo_url: input.photoUrl } : {}),
      })
      .eq("id", input.reviewId)
      .eq("member_id", member.id) // 본인 글만 수정 가능
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return { success: false, message: "후기 수정에 실패했습니다." };
    }
    revalidatePath("/reviews");
    return { success: true, reviewId: data.id };
  }

  if (target.alreadyWritten) {
    return { success: false, message: "이미 이 과정으로 작성한 후기가 있습니다." };
  }

  const { data, error } = await supabase
    .from("course_reviews")
    .insert({
      member_id: member.id,
      course_id: input.courseId,
      title,
      body,
      also_course_ids: alsoCourseIds,
      photo_url: input.photoUrl ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, message: "후기 등록에 실패했습니다." };
  }

  revalidatePath("/reviews");
  return { success: true, reviewId: data.id };
}

/** "도움됐어요" 토글. 한 사람이 한 후기에 한 번만 누를 수 있습니다. */
export async function toggleReviewHelpfulAction(
  reviewId: string,
): Promise<{ success: boolean; helpful: number; helpfulByMe: boolean }> {
  const member = await getMockableStudentMember();
  if (!member) {
    return { success: false, helpful: 0, helpfulByMe: false };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("course_review_helpfuls")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("course_review_helpfuls")
      .delete()
      .eq("review_id", reviewId)
      .eq("member_id", member.id);
  } else {
    await supabase
      .from("course_review_helpfuls")
      .insert({ review_id: reviewId, member_id: member.id });
  }

  const { count } = await supabase
    .from("course_review_helpfuls")
    .select("review_id", { count: "exact", head: true })
    .eq("review_id", reviewId);

  // 시드 수치(helpful_seed_count)를 더해야 목록과 같은 숫자가 됩니다.
  const { data: seedRow } = await supabase
    .from("course_reviews")
    .select("helpful_seed_count")
    .eq("id", reviewId)
    .maybeSingle();

  revalidatePath("/reviews");
  return {
    success: true,
    helpful: (count ?? 0) + (seedRow?.helpful_seed_count ?? 0),
    helpfulByMe: !existing,
  };
}
