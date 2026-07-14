import type { PendingApplicantActionResult } from "@/features/enrollments/types/pending-applicant.types";
import { createClient } from "@/lib/supabase/server";

export async function confirmPendingApplicants(
  enrollmentIds: string[],
): Promise<PendingApplicantActionResult> {
  const ids = [...new Set(enrollmentIds.map((id) => id.trim()).filter(Boolean))];

  if (ids.length === 0) {
    return { success: false, message: "확정할 신청 수강생을 선택해주세요." };
  }

  const supabase = await createClient();
  const confirmedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      status: "confirmed",
      confirmed_at: confirmedAt,
      updated_at: confirmedAt,
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
      message: "확정할 수 있는 신청 수강생이 없습니다.",
    };
  }

  return {
    success: true,
    message: `${count}명의 신청 수강생을 최종 수강생으로 확정했습니다.`,
    count,
  };
}
