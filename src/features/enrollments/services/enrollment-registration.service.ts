import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

import type {
  EnrollmentRegistrationInput,
  EnrollmentRegistrationResult,
} from "../types/enrollment.types";

function normalize(value: string) {
  return value.trim();
}

export function validateEnrollmentRegistrationInput(
  input: EnrollmentRegistrationInput,
): EnrollmentRegistrationResult {
  if (!normalize(input.memberId)) {
    return {
      success: false,
      message: "회원을 선택해주세요.",
      field: "memberId",
    };
  }

  if (!normalize(input.courseId)) {
    return {
      success: false,
      message: "과정을 선택해주세요.",
      field: "courseId",
    };
  }

  if (!normalize(input.startDate)) {
    return {
      success: false,
      message: "시작일을 입력해주세요.",
      field: "startDate",
    };
  }

  if (!normalize(input.endDate)) {
    return {
      success: false,
      message: "종료일을 입력해주세요.",
      field: "endDate",
    };
  }

  if (Number.isNaN(Date.parse(input.startDate))) {
    return {
      success: false,
      message: "올바른 시작일을 입력해주세요.",
      field: "startDate",
    };
  }

  if (Number.isNaN(Date.parse(input.endDate))) {
    return {
      success: false,
      message: "올바른 종료일을 입력해주세요.",
      field: "endDate",
    };
  }

  if (input.endDate < input.startDate) {
    return {
      success: false,
      message: "종료일은 시작일 이후여야 합니다.",
      field: "endDate",
    };
  }

  return { success: true, enrollmentId: "" };
}

export async function createEnrollment(
  input: EnrollmentRegistrationInput,
): Promise<EnrollmentRegistrationResult> {
  const validation = validateEnrollmentRegistrationInput(input);
  if (!validation.success) {
    return validation;
  }

  const supabase = await createClient();

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", input.memberId)
    .is("deleted_at", null)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    return {
      success: false,
      message: "선택한 회원을 찾을 수 없습니다.",
      field: "memberId",
    };
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", input.courseId)
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

  const insertData: Database["public"]["Tables"]["enrollments"]["Insert"] = {
    member_id: input.memberId,
    course_id: input.courseId,
    start_date: input.startDate,
    end_date: input.endDate,
    status: input.status,
    year: new Date(input.startDate).getFullYear(),
    application_date: new Date().toISOString().slice(0, 10),
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "해당 회원은 이미 이 과정에 수강 등록되어 있습니다.",
        field: "courseId",
      };
    }

    throw new Error(error.message);
  }

  return { success: true, enrollmentId: data.id };
}
