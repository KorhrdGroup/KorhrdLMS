import type { ExamPrintUpdateResult } from "@/features/exams/types/exam-edit.types";
import { createClient } from "@/lib/supabase/server";

export async function updateExamPrintEnabled(
  examId: string,
  printEnabled: boolean,
): Promise<ExamPrintUpdateResult> {
  if (!examId.trim()) {
    return { success: false, message: "시험 정보를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .update({ print_enabled: printEnabled })
    .eq("id", examId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "출력 설정을 저장할 수 없습니다." };
  }

  return { success: true, message: "출력 설정이 저장되었습니다." };
}
