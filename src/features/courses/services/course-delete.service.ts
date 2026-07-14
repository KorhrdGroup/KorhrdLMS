import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type { CourseDeleteResult } from "../types/course-edit.types";

const REFERENCE_BLOCK_MESSAGE =
  "해당 과정에 연결된 수강/시험 등의 데이터가 존재하여 삭제할 수 없습니다.";

/**
 * courses.id를 FK로 참조하는 모든 테이블입니다(course_id 컬럼 기준).
 * 과정을 실제로 삭제(Hard Delete)하기 전에 참조 데이터가 하나라도 있으면 삭제를 막습니다.
 */
const COURSE_REFERENCE_TABLES: (keyof Database["public"]["Tables"])[] = [
  "enrollments",
  "classes",
  "exams",
  "assignments",
  "completion_certificates",
  "course_payments",
  "certificate_applications",
  "course_lectures",
  "learning_materials",
];

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function hasReferencedData(
  supabase: SupabaseServerClient,
  courseId: string,
): Promise<boolean> {
  for (const table of COURSE_REFERENCE_TABLES) {
    // 참조 테이블마다 Row 타입이 달라 유니온 타입만으로는 course_id 컬럼 존재를 타입상
    // 보장할 수 없지만, COURSE_REFERENCE_TABLES는 모두 course_id FK를 가진 테이블만
    // 나열한 목록이므로(위 주석 참조) 런타임에는 안전합니다.
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("course_id" as never, courseId);

    if (error) {
      throw new Error(error.message);
    }

    if ((count ?? 0) > 0) {
      return true;
    }
  }

  return false;
}

/**
 * 과정을 Hard Delete(실제 DB 행 삭제)합니다. 민간자격증 LMS 운영 특성상 삭제된 과정을
 * 복구할 일이 거의 없고, 동일한 이름으로 과정을 재등록하는 경우가 많기 때문에
 * Soft Delete 대신 완전 삭제 방식을 사용합니다.
 * 단, 수강신청/시험/자격증 등 참조 데이터가 하나라도 있으면 데이터 정합성을 위해
 * 삭제를 차단합니다(참조 데이터가 없는 경우에만 삭제 수행).
 */
export async function deleteCourse(courseId: string): Promise<CourseDeleteResult> {
  const id = courseId.trim();

  if (!id) {
    return { success: false, message: "삭제할 과정을 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const { data: course, error: fetchError } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!course) {
    return { success: false, message: "삭제할 과정을 찾을 수 없습니다." };
  }

  if (await hasReferencedData(supabase, id)) {
    return { success: false, message: REFERENCE_BLOCK_MESSAGE };
  }

  const { error: deleteError } = await supabase.from("courses").delete().eq("id", id);

  if (deleteError) {
    // FK 제약(NO ACTION) 위반 시 위의 사전 점검을 통과했더라도 안전하게 동일한 안내를 표시합니다.
    if (deleteError.code === "23503") {
      return { success: false, message: REFERENCE_BLOCK_MESSAGE };
    }

    throw new Error(deleteError.message);
  }

  return {
    success: true,
    message: `"${course.name}" 과정이 삭제되었습니다.`,
  };
}
