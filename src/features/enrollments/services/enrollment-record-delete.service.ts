import type { EnrollmentRecordDeleteResult } from "@/features/enrollments/types/enrollment.types";
import { createClient } from "@/lib/supabase/server";

export async function deleteEnrollmentRecord(
  enrollmentId: string,
): Promise<EnrollmentRecordDeleteResult> {
  if (!enrollmentId.trim()) {
    return { success: false, message: "삭제할 수강 정보를 찾을 수 없습니다." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: "deleted", deleted_at: deletedAt })
    .eq("id", enrollmentId)
    .in("status", ["confirmed", "canceled"])
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "삭제할 수강 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: "수강 정보를 삭제했습니다." };
}
