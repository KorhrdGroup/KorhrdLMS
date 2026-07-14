import { validateClassRegistrationInput } from "@/features/enrollments/services/class-registration.service";
import type { ClassEditInput, ClassEditResult } from "@/features/enrollments/types/class-edit.types";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseYear(value: string): number | null {
  const year = Number.parseInt(normalize(value), 10);
  if (Number.isNaN(year) || year < 1900 || year > 9999) {
    return null;
  }
  return year;
}

export async function updateClass(
  classId: string,
  input: ClassEditInput,
): Promise<ClassEditResult> {
  if (!classId.trim()) {
    return { success: false, message: "수강반 정보를 찾을 수 없습니다." };
  }

  const validation = validateClassRegistrationInput(input);
  if (!validation.success) {
    return validation;
  }

  const year = parseYear(input.year)!;
  const supabase = await createClient();

  const { data: current, error: currentError } = await supabase
    .from("classes")
    .select("id")
    .eq("id", classId)
    .is("deleted_at", null)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!current) {
    return { success: false, message: "수강반 정보를 찾을 수 없습니다." };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message);
  }

  if (!course) {
    return {
      success: false,
      message: "등록된 과정이 없습니다. 과정관리에서 과정을 먼저 등록해주세요.",
      field: "courseId",
    };
  }

  const updateData: Database["public"]["Tables"]["classes"]["Update"] = {
    course_id: input.courseId,
    year,
    name: normalize(input.batchName),
    manager_name: emptyToNull(input.managerName),
    application_start: emptyToNull(input.applicationStart),
    application_end: emptyToNull(input.applicationEnd),
    enrollment_start: input.enrollmentStart,
    enrollment_end: input.enrollmentEnd,
  };

  const { data, error } = await supabase
    .from("classes")
    .update(updateData)
    .eq("id", classId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return { success: false, message: "수정할 수 있는 수강반 정보가 없습니다." };
  }

  return { success: true, message: "수강반 정보가 수정되었습니다." };
}
