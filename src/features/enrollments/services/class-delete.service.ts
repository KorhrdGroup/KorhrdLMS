import type { ClassDeleteResult } from "@/features/enrollments/types/class-delete.types";
import { createClient } from "@/lib/supabase/server";

export async function softDeleteClass(classId: string): Promise<ClassDeleteResult> {
  const id = classId.trim();

  if (!id) {
    return { success: false, message: "삭제할 수강반을 찾을 수 없습니다." };
  }

  const deletedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .update({ deleted_at: deletedAt })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "삭제할 수강반을 찾을 수 없습니다." };
  }

  return {
    success: true,
    message: "수강반이 삭제되었습니다.",
  };
}
