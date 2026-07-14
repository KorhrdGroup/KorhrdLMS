import type { PendingApplicantActionResult } from "@/features/enrollments/types/pending-applicant.types";
import { createClient } from "@/lib/supabase/server";

export async function softDeletePendingApplicants(
  enrollmentIds: string[],
): Promise<PendingApplicantActionResult> {
  const ids = [...new Set(enrollmentIds.map((id) => id.trim()).filter(Boolean))];

  if (ids.length === 0) {
    return { success: false, message: "삭제할 신청 수강생을 선택해주세요." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      status: "deleted",
      deleted_at: deletedAt,
    })
    .in("id", ids)
    .eq("status", "pending")
    .is("deleted_at", null)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  const count = data?.length ?? 0;

  if (count === 0) {
    return {
      success: false,
      message: "삭제할 수 있는 신청 수강생이 없습니다.",
    };
  }

  return {
    success: true,
    message: `${count}명의 신청 수강생을 삭제했습니다.`,
    count,
  };
}

export async function softDeletePendingApplicant(
  enrollmentId: string,
): Promise<PendingApplicantActionResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "삭제할 신청 수강생을 선택해주세요." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ deleted_at: deletedAt })
    .eq("id", enrollmentId)
    .eq("status", "pending")
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      success: false,
      message: "삭제할 수 있는 신청 수강생이 없습니다.",
    };
  }

  return {
    success: true,
    message: "신청 수강생을 삭제했습니다.",
    count: 1,
  };
}
